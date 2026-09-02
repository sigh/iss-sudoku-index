// Title: Hydra
// Author: zetamath
// Video: https://www.youtube.com/watch?v=xCy3FdNzdas
// Source: https://app.crackingthecryptic.com/sudoku/btgQm83JD2

// Rules encoded here:
//  - Each row and column holds 1-9 (the ISS baseline).  The grid is drawn
//    without 3x3 boxes, so NoBoxes removes them.
//  - Nine orthogonally connected regions each hold 1-9: ChaosConstruction.
//  - Each region is a "friendly serpent": one cell wide, 9 cells long, and it
//    does not touch itself, even diagonally.
//  - Each serpent has a head and a tail, chosen by the solver.  Counting from
//    the head, every cell has a position 1..9 within its serpent: the VP
//    overlay below.
//  - A cell is circled exactly when its digit equals its position in its
//    serpent, and all circles are given, so an uncircled cell's digit must
//    differ from its position.

const graph = cellGraph('9x9');
// The chaos-construction region label of each grid cell.
const cc = graph.makeOverlay('CC');
// The cell's position along its own serpent, counting 1..9 from the head.
const pos = graph.makeOverlay('VP');

// Transcribed from the drawn clues: the six given digits, and the 25 white
// circles drawn in the source.
const GIVENS = [
  ['R1C2', 2], ['R2C9', 9], ['R3C9', 1],
  ['R4C6', 1], ['R8C2', 9], ['R9C8', 1],
];
const CIRCLED = [
  'R1C2', 'R1C4', 'R1C9',
  'R2C4', 'R2C5', 'R2C8', 'R2C9',
  'R3C2', 'R3C9',
  'R4C1', 'R4C2', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9',
  'R5C2',
  'R7C8',
  'R8C2', 'R8C3', 'R8C8',
  'R9C1', 'R9C2', 'R9C8', 'R9C9',
];

// Serpent shape, seen from one cell `c` with `k` orthogonal neighbours.
// Cell order is [region(c), region(n1..nk), position(c), position(n1..nk)].
// For every neighbour sharing c's region it requires position = position(c) +-1,
// and it refuses to spend either of those two values twice.  So a cell has at
// most one serpent-predecessor and one serpent-successor among its neighbours:
// that is "one cell wide", and with the region already connected and 9 cells
// it makes the region a 9-cell path whose positions run 1..9 along it.
// `self` is cleared once the region labels have been read, so the label value
// does not multiply into the states that follow.
const serpentShapeSpec = k => NFA.encodeSpec({
  startState: { i: 0, self: 0, match: [], pos: 0, used: 0 },
  transition: ({ i, self, match, pos, used }, value) => {
    // The centre cell's region label.
    if (i === 0) return { i: 1, self: value, match: [], pos: 0, used: 0 };
    // Each neighbour's region label: record only whether it matches.
    if (i <= k) {
      return { i: i + 1, self, match: [...match, value === self], pos: 0, used: 0 };
    }
    // The centre cell's own position.
    if (i === k + 1) return { i: i + 1, self: 0, match, pos: value, used: 0 };
    // Each neighbour's position, in the same order as the labels above.
    const [sameRegion, ...rest] = match;
    if (!sameRegion) return { i: i + 1, self: 0, match: rest, pos, used };
    const step = value - pos;
    // Bit 1 = this neighbour is the predecessor, bit 2 = the successor.
    const bit = step === -1 ? 1 : step === 1 ? 2 : 0;
    if (!bit || (used & bit)) return undefined;
    return { i: i + 1, self: 0, match: rest, pos, used: used | bit };
  },
  accept: ({ i }) => i === 2 * k + 2,
  maxDepth: 2 * k + 2,   // one region label and one position per cell read
}, 9);
const SERPENT_SHAPE_SPECS = new Map(
  [2, 3, 4].map(k => [k, serpentShapeSpec(k)]));

// Two cells of one serpent that touch diagonally can only be the two cells
// either side of a turn, which are two steps apart along the serpent.  Any
// other diagonal touch is the serpent touching itself.  Cell order is
// [region(a), region(b), position(a), position(b)].
const serpentTouchSpec = NFA.encodeSpec({
  startState: { i: 0, self: 0, same: false, pos: 0 },
  transition: ({ i, self, same, pos }, value) => {
    if (i === 0) return { i: 1, self: value, same: false, pos: 0 };
    if (i === 1) return { i: 2, self: 0, same: value === self, pos: 0 };
    if (i === 2) return { i: 3, self: 0, same, pos: same ? value : 0 };
    if (same && Math.abs(value - pos) !== 2) return undefined;
    return { i: 4, self: 0, same: false, pos: 0 };
  },
  accept: ({ i }) => i === 4,
  maxDepth: 4,
}, 9);

const givens = GIVENS.map(([cell, value]) => new Given(cell, value));

const serpentShape = graph.cells().map(cell => {
  const neighbours = graph.neighbours(cell);
  return new NFA(
    SERPENT_SHAPE_SPECS.get(neighbours.length), 'SerpentShape',
    cc.at(cell), ...cc.at(neighbours), pos.at(cell), ...pos.at(neighbours));
});

// Down-right and down-left cover every diagonally touching pair exactly once.
const serpentTouch = graph.cells().flatMap(cell =>
  [graph.step(cell, 1, 1), graph.step(cell, 1, -1)]
    .filter(other => other !== null)
    .map(other => new NFA(
      serpentTouchSpec, 'SerpentTouch',
      cc.at(cell), cc.at(other), pos.at(cell), pos.at(other))));

const circledSet = new Set(CIRCLED);
const circles = graph.cells().map(cell => (
  circledSet.has(cell)
    ? new SameValues(2, cell, pos.at(cell))
    : new AllDifferent(cell, pos.at(cell))));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  pos.toVar('Position'),
  ...givens,
  ...serpentShape,
  ...serpentTouch,
  ...circles,
];
