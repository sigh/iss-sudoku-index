// Title: Jousting Knights
// Author: Unknown
// Video: https://www.youtube.com/watch?v=KDxxgJAv23A
// Source: https://cracking-the-cryptic.web.app/sudoku/r2R6G86t93
//
// Standard sudoku (default row/column/box AllDifferent from Shape('9x9')).
// "Jousting": two same digits a knight's move apart are opponents. A cell may
// have at most one knight-move neighbour sharing its digit (the joust cap). A
// 5 must have zero such neighbours ("5's ... cannot joust"). Every other digit
// not sitting on a red-shaded cell must have exactly one such neighbour ("all
// digits ... are jousting, except for digits in red boxes"); a non-5 digit on
// a red cell only carries the shared cap, with no minimum.

const graph = cellGraph('9x9');

// Red-shaded cells, transcribed from the puzzle's drawn 1x1 red squares (17
// cells; see the puzzle description for the full list and grid picture).
const redCells = [
  'R1C1', 'R1C2', 'R1C5', 'R1C9', 'R2C9', 'R4C6', 'R5C1', 'R5C3', 'R5C5',
  'R5C7', 'R5C9', 'R6C4', 'R8C1', 'R9C1', 'R9C5', 'R9C8', 'R9C9',
];
const redSet = new Set(redCells);

// Knight-move offsets.
const KNIGHT_STEPS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const knightNeighbours = cell =>
  KNIGHT_STEPS.map(([dr, dc]) => graph.step(cell, dr, dc)).filter(c => c != null);

// State: `target` is the origin cell's own digit (set from the first symbol
// scanned); `count` is how many later cells (its knight neighbours) match it,
// clamped at 2 once "more than one opponent" is already violated.
const transition = ({ target, count }, value) => {
  if (target === null) return { target: value, count: 0 };
  return { target, count: Math.min(count + (value === target ? 1 : 0), 2) };
};

// Non-red cell: a non-5 digit must joust exactly once; a 5 must not joust.
const mustJoustSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition,
  accept: ({ target, count }) => (target === 5 ? count === 0 : count === 1),
}, 9);

// Red cell: exempt from the "must joust" minimum, but a 5 still may not
// joust, and the shared "at most one opponent" cap still applies.
const redCellSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition,
  accept: ({ target, count }) => (target === 5 ? count === 0 : count <= 1),
}, 9);

return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C5', 2), new Given('R1C9', 3),
  new Given('R2C1', 2),
  new Given('R4C5', 4),
  new Given('R5C1', 4), new Given('R5C3', 7), new Given('R5C5', 5),
  new Given('R5C7', 3), new Given('R5C9', 6),
  new Given('R6C5', 6),
  new Given('R8C9', 8),
  new Given('R9C1', 7), new Given('R9C5', 8), new Given('R9C9', 9),
  ...graph.cells().map(cell => new NFA(
    redSet.has(cell) ? redCellSpec : mustJoustSpec,
    'JOUST',
    cell,
    ...knightNeighbours(cell))),
];
