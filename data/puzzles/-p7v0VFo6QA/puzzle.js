// Title: German Hisses
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=-p7v0VFo6QA
// Source: https://app.crackingthecryptic.com/sudoku/fdBbF4dTDF

// Standard 9x9 sudoku (regions in the payload are plain 3x3 boxes, so the
// default row/column/box constraints already match).
//
// Encoded: two snakes, each an unknown-length simple path between one of two
// fixed pairs of endpoint circles, self-avoiding and mutually non-touching
// orthogonally (diagonal touch allowed), with adjacent along-snake digits
// differing by >= 5; and the five "digit = count of snake cells in the 3x3
// square centred on it" clues.
//
// Omitted: "The non-snake cells form several regions. In regions, digits
// cannot repeat. Some region totals have been indicated by small corner
// clues." Region shape/count is solver-discovered, unanchored and unbounded,
// with per-region distinctness and (for some regions) a sum or parity total
// -- no ISS primitive attaches predicates to a solver-discovered partition's
// components.
//
// Which two of the four endpoint circles share a snake is not stated by the
// rules or drawn geometry, so all three ways to split the four circles into
// two pairs are encoded as an Or; snake identity (which pair is "first")
// does not matter, so only the 3 unordered splits are needed, not 6.

const NONE = 1, A = 2, B = 3; // snake-membership overlay values

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS'); // one Var per grid cell: NONE / A / B
const gridCells = graph.cells();

// Every membership cell is NONE, A, or B (a multi-candidate Given replicated
// to every overlay cell restricts its domain).
const firstShade = shade.cells()[0];
const domainRestriction = shade.makeReplicate(new Given(firstShade, NONE, A, B));

// Snake endpoint circles (underlays), drawn with no connecting path.
const CIRCLES = ['R1C2', 'R1C9', 'R8C4', 'R9C5'];
const PAIRINGS = [
  [['R1C2', 'R1C9'], ['R8C4', 'R9C5']],
  [['R1C2', 'R8C4'], ['R1C9', 'R9C5']],
  [['R1C2', 'R9C5'], ['R1C9', 'R8C4']],
];

// A cell whose own overlay value is `label` must have exactly `targetDegree`
// orthogonal neighbours also holding `label`; a cell not holding `label` is
// unconstrained by this NFA. Reads [self, ...orthogonal neighbours].
function degreeNFA(cell, label, targetDegree) {
  const machine = NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, count }, v) => {
      if (phase === 'start') return v === label ? { phase: 'on', count: 0 } : { phase: 'off' };
      if (phase === 'off') return { phase: 'off' };
      const next = count + (v === label ? 1 : 0);
      return next > targetDegree ? undefined : { phase: 'on', count: next };
    },
    accept: ({ phase, count }) => phase === 'off' || count === targetDegree,
  }, geometry.numValues);
  return new NFA(machine, `deg-${label}-${targetDegree}`,
    ...shade.at([cell, ...graph.neighbours(cell)]));
}

// One branch of the endpoint-pairing Or: pin the four endpoints to their
// snake's label, then require degree 1 there and degree 2 at every other
// same-label cell. With ConnectedValues (below, applied outside the Or since
// it is unconditionally true regardless of which pairing holds) this closes
// each snake to a single simple path -- the "route may not touch itself"
// case, since a self-touch would push some cell's same-label degree to 3.
function branchConstraints(pairA, pairB) {
  const forcedLabel = new Map();
  for (const c of pairA) forcedLabel.set(c, A);
  for (const c of pairB) forcedLabel.set(c, B);

  const endpointGivens = [
    ...pairA.map(c => new Given(c, A)),
    ...pairB.map(c => new Given(c, B)),
  ];

  const degrees = gridCells.flatMap(cell => {
    const forced = forcedLabel.get(cell);
    return [A, B].map(label => degreeNFA(cell, label, forced === label ? 1 : 2));
  });

  return new And([...endpointGivens, ...degrees]);
}

const snakeShape = new Or(PAIRINGS.map(([pairA, pairB]) => branchConstraints(pairA, pairB)));

// Every orthogonal edge, right-steps and down-steps only (covers each edge once).
const orderedEdges = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => [cell, other]));

// Snakes cannot touch each other orthogonally: adjacent overlay cells cannot
// be different nonzero labels (NONE next to anything, or same label next to
// itself, are both fine).
const noCrossTouchKey = Pair.fnToKey(
  (a, b) => !((a === A && b === B) || (a === B && b === A)), 9);
const rightOrigins = gridCells.filter(cell => graph.step(cell, 0, 1));
const downOrigins = gridCells.filter(cell => graph.step(cell, 1, 0));
const noCrossTouch = [
  shade.makeReplicate(
    new Pair(noCrossTouchKey, 'no-cross-touch',
      shade.at(gridCells[0]), shade.at(graph.step(gridCells[0], 0, 1))),
    shade.at(rightOrigins)),
  shade.makeReplicate(
    new Pair(noCrossTouchKey, 'no-cross-touch',
      shade.at(gridCells[0]), shade.at(graph.step(gridCells[0], 1, 0))),
    shade.at(downOrigins)),
];

// Adjacent digits along a snake differ by >= 5: reads [label1, digit1,
// label2, digit2] per orthogonal edge; only constrains the pair when both
// cells share the same nonzero label (which, given the degree/connectivity
// shape above, is exactly when the edge is a used snake step).
const diffMachine = NFA.encodeSpec({
  startState: { phase: 'aLabel' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aLabel': return { phase: 'aDigit', aLabel: value };
      case 'aDigit': return { phase: 'bLabel', aLabel: state.aLabel, aDigit: value };
      case 'bLabel':
        return { phase: 'bDigit', aLabel: state.aLabel, aDigit: state.aDigit, bLabel: value };
      case 'bDigit': {
        const { aLabel, aDigit, bLabel } = state;
        if (aLabel === bLabel && aLabel !== NONE) {
          return Math.abs(aDigit - value) >= 5 ? { phase: 'done' } : undefined;
        }
        return { phase: 'done' };
      }
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const snakeDiffs = orderedEdges.map(([c1, c2]) =>
  new NFA(diffMachine, 'snake-diff', shade.at(c1), c1, shade.at(c2), c2));

// The given digits indicate the number of snake cells within the 3x3 square
// centred on that digit (including the given cell itself). Reads the grid
// cell's own digit as a target, then the membership of [self, ...king
// neighbours]; clipped near an edge (R7C1) automatically has fewer symbols.
const COUNT_CLUES = { R2C5: 3, R3C4: 6, R7C1: 3, R7C4: 5, R8C2: 4 };
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === NONE ? 0 : 1);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const windowCounts = Object.keys(COUNT_CLUES).map(cell =>
  new NFA(countMachine, 'window-count',
    cell, ...shade.at([cell, ...graph.kingNeighbours(cell)])));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  domainRestriction,
  ...Object.entries(COUNT_CLUES).map(([cell, v]) => new Given(cell, v)),
  snakeShape,
  // Each snake is one orthogonally-connected region (both labels appear,
  // since every branch above pins two endpoint cells to each).
  new ConnectedValues('VS', A),
  new ConnectedValues('VS', B),
  ...noCrossTouch,
  ...snakeDiffs,
  ...windowCounts,
];
