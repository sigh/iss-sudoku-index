// Title: Tetris Sudoku
// Author: Trevor Nicholas
// Video: https://www.youtube.com/watch?v=OMckAiO5_Fk
// Source: https://sudokupad.app/TetrisSudokuTrevorNicholas?setting-conflictchecker=0

// Normal sudoku rules (rows, columns, 3x3 boxes) apply to the main 9x9 grid.
// Nine Tetris pieces (tetrominoes) are drawn as killer cages in the main
// grid: digits sum to the clue and cannot repeat within the piece --
// Cage(sum, cells) below covers both halves of that rule.
//
// After the grid is complete, each piece's digits "descend" into a second,
// fixed 4x9 structure that the source draws explicitly, as its own nine
// clued tetromino cages, rather than leaving for the solver to derive by
// simulating gravity. Matching each main-grid piece to its
// landing-structure counterpart by congruent shape and equal clue total
// gives a unique pairing per piece; comparing their drawn cell coordinates
// shows every piece maps by one uniform per-piece vertical translation
// (same columns, a fixed row shift for that whole piece) -- never a
// horizontal shift or a per-cell independent choice. That translation is
// exactly what "the pieces will descend... along with the digits placed
// inside them" describes, and it is fixed by the drawn geometry alone. It
// is encoded per matched cell pair below with SameValues, positionally --
// not as a same-multiset check over the whole piece, which would let a
// piece's digits land in any of its own cells.
//
// The landing structure is a Var block, not part of the main grid, so it
// gets its own explicit row/box constraints for "each row and box must
// contain the digits 1-9 once each": all 4 rows, and the 3 complete 3x3
// boxes drawn over its own bottom 3 rows. Its own drawn box divider (a
// single horizontal stroke after local row 1) leaves the thin top row
// without a box of its own -- a 9-cell box cannot fit in one row, and no
// such divider is drawn there.
//
// The source canvas also carries two blank rows between the two structures
// (no givens, cages, or lines) -- not modelled at all, matching that they
// carry no clue.
//
// Omitted: a 2-cell region spanning the very first and very last cell of
// the canvas, marked hidden, with no total and no distinct flag -- not
// named by the rules text, so it is a construction artifact rather than a
// clue.

const mainGrid = new Shape('9x9');

// Landing structure: 4x9 Var block mirroring payload rows 12-15.
const landed = new Var('B', 'Landed Tetris pieces (4x9)', '4x9');

// The source's only givens, all in the main grid.
const givens = [
  new Given('R1C8', 6),
  new Given('R5C6', 8),
  new Given('R6C7', 2),
  new Given('R6C8', 1),
];

// Nine Tetris pieces. `top` cell lists transcribed from the main-grid
// cages as drawn; `bot` cell lists transcribed from the landing
// structure's own cages (given as (local row, col), local row = source
// row - 11), matched to the `top` piece of the same shape and total --
// verified as a unique pairing per piece, not chosen from the solution.
// `bot` entries are listed in the same order as their matching `top`
// cells, so index i in `top` and index i in `bot` are the one piece cell
// translated.
const pieces = [
  { value: 12, top: ['R2C1', 'R2C2', 'R3C1', 'R3C2'], bot: [[1, 1], [1, 2], [2, 1], [2, 2]] },
  { value: 16, top: ['R1C5', 'R1C6', 'R1C7', 'R2C6'], bot: [[1, 5], [1, 6], [1, 7], [2, 6]] },
  { value: 20, top: ['R3C4', 'R4C4', 'R4C5', 'R5C4'], bot: [[1, 4], [2, 4], [2, 5], [3, 4]] },
  { value: 23, top: ['R3C8', 'R4C7', 'R4C8', 'R5C7'], bot: [[1, 8], [2, 7], [2, 8], [3, 7]] },
  { value: 21, top: ['R4C9', 'R5C9', 'R6C9', 'R7C9'], bot: [[1, 9], [2, 9], [3, 9], [4, 9]] },
  { value: 16, top: ['R7C8', 'R8C6', 'R8C7', 'R8C8'], bot: [[3, 8], [4, 6], [4, 7], [4, 8]] },
  { value: 22, top: ['R6C5', 'R6C6', 'R7C4', 'R7C5'], bot: [[3, 5], [3, 6], [4, 4], [4, 5]] },
  { value: 21, top: ['R5C3', 'R6C3', 'R7C2', 'R7C3'], bot: [[1, 3], [2, 3], [3, 2], [3, 3]] },
  { value: 29, top: ['R8C1', 'R9C1', 'R9C2', 'R9C3'], bot: [[3, 1], [4, 1], [4, 2], [4, 3]] },
];

const pieceCages = pieces.flatMap(({ value, top, bot }) => [
  new Cage(value, ...top),
  new Cage(value, ...bot.map(([r, c]) => landed.cell(r, c))),
]);

const landingEquality = pieces.flatMap(({ top, bot }) =>
  top.map((cell, i) => new SameValues(2, cell, landed.cell(...bot[i]))));

// Landing structure rows: all four must hold the digits 1-9 once each.
const landedRows = [1, 2, 3, 4].map(r => new AllDifferent(
  ...Array.from({ length: 9 }, (_, i) => landed.cell(r, i + 1))));

// Landing structure boxes: only the bottom 3 (of 4) rows form complete 3x3
// boxes -- see header note. Column-band starting columns, not multiplied
// inside a cell lookup.
const boxColStarts = Array.from({ length: 3 }, (_, band) => band * 3 + 1);
const landedBoxes = boxColStarts.map(c0 => new AllDifferent(
  ...[2, 3, 4].flatMap(r => Array.from(
    { length: 3 }, (_, i) => landed.cell(r, c0 + i)))));

return [
  mainGrid,
  landed,
  ...givens,
  ...pieceCages,
  ...landingEquality,
  ...landedRows,
  ...landedBoxes,
];
