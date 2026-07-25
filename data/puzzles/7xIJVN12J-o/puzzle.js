// Title: Whispering Internal Loop Skyscrapers
// Author: yttrio
// Video: https://www.youtube.com/watch?v=7xIJVN12J-o
// Source: https://sudokupad.app/kwf3g2ne92
//
// Standard 9x9 sudoku, no givens. Draw a single 1-cell-wide loop of
// orthogonally connected cells that does not branch or touch itself, not
// even diagonally. Adjacent digits along the loop (German Whispers) differ
// by at least 5. Each loop cell is a skyscraper of height equal to its
// digit; non-loop cells are not skyscrapers (they neither block nor count).
// Seven clued cells each carry a direction arrow; the clued cell's own
// digit gives the count of loop-skyscrapers visible looking that way,
// excluding the clued cell itself, under the usual "taller blocks
// same-or-shorter" visibility rule. The clued cell may or may not be on the
// loop itself, so its digit is read as the target count only, never as a
// building.
//
// Loop membership is a Var cell per grid cell (1 = on, 2 = off), shaped by
// the same degree-2 + no-diagonal-touch + ConnectedValues pattern used for
// other solver-discovered loops (see e.g. nordschleife.js).

const ON = 1;                  // loop-membership values, stored in the Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// The loop-membership Var cell paired with each grid cell (VL1..VL81, in grid order).
const loop = graph.makeOverlay('VL');
const gridCells = graph.cells();

// --- Loop membership domain: every overlay cell is on (1) or off (2). ---
const originCell = loop.cells()[0];
const membershipDomain = loop.makeReplicate(new Given(originCell, ON, OFF));

// --- Degree 2: each on-loop cell has exactly two on-loop orthogonal
// neighbours; off cells are unconstrained. Reads the cell's own membership,
// then each neighbour's.
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

// --- No diagonal self-touch: forbid a 2x2 block whose only on-loop cells
// are a diagonal pair. Reads the four membership cells of the block,
// left-to-right, top-to-bottom.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// Replicated over every cell that starts a 2x2 block (i.e. not in the last
// row/column) -- one shifted template rather than 64 near-identical NFAs.
const noTouchOrigin = gridCells.find(cell => graph.block(cell, 2, 2));
const noTouchTargets = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch', ...loop.at(graph.block(noTouchOrigin, 2, 2))),
  loop.at(noTouchTargets));

// --- German Whispers along the loop: for two orthogonally adjacent on-loop
// cells, digits must differ by at least 5. Reads (membership, digit) per
// cell; if either cell is off the loop the pair is unconstrained.
const whisperMachine = NFA.encodeSpec({
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
// Right/down steps only: each orthogonal pair is covered once.
const whispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(whisperMachine, 'whisper',
    loop.at(cell), cell, loop.at(other), other)));

// --- Internal loop skyscraper visibility clues. ---
// Direction vectors, matched to the drawn arrow-stub geometry per clue cell.
const RIGHT = [0, 1], LEFT = [0, -1], UP = [-1, 0], DOWN = [1, 0];
const skyscraperClues = [
  ['R1C1', DOWN],
  ['R1C6', RIGHT],
  ['R1C7', RIGHT],
  ['R4C3', RIGHT],
  ['R6C7', UP],
  ['R8C7', LEFT],
  ['R9C2', UP],
];

// Reads the clued cell's own digit as the target count, then scans
// (membership, digit) pairs for each cell further along the ray (nearest
// first). An off-loop cell is transparent: skipped without updating the
// running max or being counted. An on-loop cell counts as visible when its
// digit beats the running max of on-loop digits seen so far.
const skyscraperMachine = NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    if (state.phase === 'target') {
      return { phase: 'loop', target: value, max: 0, count: 0 };
    }
    if (state.phase === 'loop') {
      return {
        phase: 'digit', target: state.target, max: state.max,
        count: state.count, on: value === ON,
      };
    }
    // phase === 'digit'
    const { target, max, count, on } = state;
    if (!on) return { phase: 'loop', target, max, count };
    const hit = value > max ? 1 : 0;
    const nextCount = count + hit;
    if (nextCount > target) return undefined;
    return { phase: 'loop', target, max: Math.max(max, value), count: nextCount };
  },
  accept: ({ phase, target, count }) => phase === 'loop' && count === target,
}, geometry.numValues);
const skyscrapers = skyscraperClues.map(([cell, [dR, dC]]) => {
  const ray = graph.ray(cell, dR, dC).slice(1);  // exclude the clued cell itself
  return new NFA(skyscraperMachine, 'skyscraper', cell,
    ...ray.flatMap(c => [loop.at(c), c]));
});

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  membershipDomain,
  // Single loop: the on-loop cells form one orthogonally-connected region.
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...whispers,
  ...skyscrapers,
];
