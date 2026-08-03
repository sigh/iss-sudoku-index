// Title: Coordi-Loop
// Author: Celery
// Video: https://www.youtube.com/watch?v=ndxTwCxbFOo
// Source: https://app.crackingthecryptic.com/sudoku/TqHHLMgRNh

// Normal sudoku rules apply.
//
// Loop: a single loop travels orthogonally through cell centres. "A loop"
// (no branching, no self-crossing) is this genre's standard term of art, so
// that closure is assumed even though the rules text does not spell it out
// again. It visits every 3x3 box at least once; no 2x2 block is entirely
// loop cells; and any two orthogonally *grid*-adjacent cells that are both
// on the loop differ by at least 5 -- the rules say "adjacent...upon the
// loop", not "consecutive along the loop", and the sibling script
// nordschleife.js reads its own puzzle's identical phrasing ("adjacent
// digits [...] on the loop") the same way, as any grid-adjacent on-loop
// pair rather than a path-order pair.
//
// Cages: each cage is 2 cells, all-different, and -- when a total is shown
// in its top-left corner -- summing to that total. Every cage (shown total
// or not) also reveals a coordinate: X is the digit in its uppermost (or,
// for a horizontal cage, leftmost) cell, Y the digit in its lowermost/
// rightmost cell. The digit placed at R{X}C{Y} must equal the cage's own
// two digits' sum, and that cell must be on the loop. "Each cage" is
// unqualified, so this holds for every cage regardless of whether a total
// is shown; a shown total is then just the additional constraint that the
// cage's actual sum equals it. Modeled as a disjunction over every (X,Y)
// with X+Y a legal single digit -- X+Y>9 can't be placed anywhere, which is
// what forces every cage's two digits to sum to at most 9; no such bound is
// asserted separately.
// Exactly the shown-6 cage may sum to 6; every other cage is forbidden to.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// Loop membership: one Var per grid cell, 1 = on the loop, 2 = off.
const loop = graph.makeOverlay('VL');

// Two-cell cages, transcribed from the drawn cage geometry; the third
// element is the shown total, or null when none is shown. Cell order within
// a pair is as drawn, not pre-sorted -- orientation (which cell is X, which
// is Y) is derived below from the rule text's own uppermost/leftmost vs
// lowermost/rightmost test.
const cages = [
  ['R7C6', 'R7C7', null],
  ['R7C1', 'R7C2', 6],
  ['R3C1', 'R3C2', null],
  ['R9C7', 'R9C8', null],
  ['R1C9', 'R2C9', null],
  ['R7C5', 'R8C5', null],
  ['R4C5', 'R4C6', null],
  ['R1C4', 'R1C5', null],
  ['R6C5', 'R6C6', null],
  ['R4C3', 'R5C3', null],
  ['R2C3', 'R3C3', null],
];

// X-cell is uppermost, or leftmost when the pair shares a row; Y-cell is
// lowermost/rightmost -- exactly the rule's own definition.
function orient([a, b]) {
  const pa = parseCellId(a), pb = parseCellId(b);
  const aIsXCell = pa.row !== pb.row ? pa.row < pb.row : pa.col < pb.col;
  return aIsXCell ? [a, b] : [b, a];
}

// --- Cage bodies: all-different, plus the shown total (killer-cage sum) when given.
const cageBodies = cages.map(([a, b, total]) =>
  total == null ? new AllDifferent(a, b) : new Cage(total, a, b));

// --- Coordinate placement: for each cage, a disjunction over every (X, Y)
// digit pair whose sum is a placeable single digit (X+Y <= 9). Each branch
// pins the cage's two cells to that (X, Y) and requires R{X}C{Y} to hold
// X+Y and be on the loop. A branch whose (X, Y) happens to equal the grid
// address of xCell or yCell itself is dropped: it would pin that same cell
// to both its X/Y-source digit and the unequal X+Y placement value, which is
// simply unsatisfiable (Y, X >= 1 always), not a real candidate to weigh.
function coordinateBranches(xCell, yCell) {
  const branches = [];
  for (let x = 1; x <= 8; x++) {
    for (let y = 1; y <= 9 - x; y++) {
      const target = makeCellId(x, y);
      if (target === xCell || target === yCell) continue;
      branches.push(new And([
        new Given(xCell, x),
        new Given(yCell, y),
        new Given(target, x + y),
        new Given(loop.at(target), ON),
      ]));
    }
  }
  return new Or(branches);
}
const coordinatePlacements = cages.map(([a, b]) => {
  const [xCell, yCell] = orient([a, b]);
  return coordinateBranches(xCell, yCell);
});

// --- No other cage may sum to 6 (the shown-6 cage already must, via its Cage above).
const notSixKey = Pair.fnToKey((a, b) => a + b !== 6, 9);
const noOtherSixesToSix = cages
  .filter(([, , total]) => total !== 6)
  .map(([a, b]) => new Pair(notSixKey, 'not-6', a, b));

// --- Loop membership domain and shaping: ON/OFF membership plus a degree-2
// requirement below make the on-loop cells 2-regular, which combined with
// ConnectedValues (one connected region) forces a single simple cycle.
const originCell = loop.cells()[0];
const membership = [loop.makeReplicate(new Given(originCell, ON, OFF))];

const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// --- No 2x2 area fully on the loop.
const blocks = gridCells.map(cell => graph.block(cell, 2, 2)).filter(Boolean);
const no2x2 = blocks.map(block =>
  new Or(block.map(cell => new Given(loop.at(cell), OFF))));

// --- Loop visits every 3x3 box at least once.
const boxCoverage = graph.boxes().map(box =>
  new ContainAtLeast(String(ON), ...loop.at(box)));

// --- Adjacent (grid-adjacent, both on loop) digits differ by >= 5. Reads
// (membership, digit) for each of a pair; off cells are unconstrained, and
// their remaining symbol is absorbed by the skip countdown -- same shape as
// nordschleife.js's "multiples" NFA, with the pair predicate swapped.
const diffMachine = NFA.encodeSpec({
  startState: { phase: 'aOn' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aOn':
        return value === ON ? { phase: 'aDigit' } : { phase: 'skip', left: 3 };
      case 'aDigit':
        return { phase: 'bOn', aDigit: value };
      case 'bOn':
        return value === ON
          ? { phase: 'bDigit', aDigit: state.aDigit }
          : { phase: 'skip', left: 1 };
      case 'bDigit':
        return Math.abs(state.aDigit - value) >= 5 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const loopDiffs = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(diffMachine, 'loop-diff',
    loop.at(cell), cell, loop.at(other), other)));

return [
  new Shape('9x9'),
  ...cageBodies,
  ...coordinatePlacements,
  ...noOtherSixesToSix,
  loop.toVar('loop'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  ...no2x2,
  ...boxCoverage,
  ...loopDiffs,
];
