// Title: Chess Pairs Sudoku
// Author: Tom Groot Kormelink
// Video: https://www.youtube.com/watch?v=DKBDO_Qu48c
// Source: https://cracking-the-cryptic.web.app/sudoku/qHhF8tdPd3

// Normal sudoku rules: rows, columns, and 3x3 boxes all-different, which a
// 9x9 Shape adds by default.
//
// Chess-pairs rule: every cell must share its digit with at least one cell a
// chess move away, where "a chess move" is a knight's move or any distance
// along a diagonal (a bishop's line of sight) -- "each cell 'sees' at least
// one identical digit by a chess move (i.e. a knight's move or diagonally)".
// Encoded as one Or of SameValues(2, cell, neighbour) per cell over its
// in-grid knight/diagonal neighbours; SameValues(2, a, b) is the pairwise
// cell-equality idiom.

const KNIGHT_OFFSETS = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];
// Every distance 1..8 in each of the 4 diagonal directions; out-of-grid
// offsets are dropped per-cell below.
const DIAGONAL_OFFSETS = Array.from({ length: 8 }, (_, i) => i + 1)
  .flatMap(d => [[-d, -d], [-d, d], [d, -d], [d, d]]);
const CHESS_OFFSETS = [...KNIGHT_OFFSETS, ...DIAGONAL_OFFSETS];

// R#C# / value pairs transcribed from the puzzle's printed givens.
const givens = [
  ['R1C1', 3], ['R1C2', 9], ['R1C4', 1], ['R1C8', 8], ['R1C9', 2],
  ['R2C1', 2], ['R2C7', 5],
  ['R3C4', 4],
  ['R4C1', 6], ['R4C4', 2],
  ['R5C1', 1], ['R5C6', 4],
  ['R6C7', 3],
  ['R8C2', 6], ['R8C6', 3], ['R8C9', 5],
  ['R9C1', 5], ['R9C2', 1], ['R9C8', 6], ['R9C9', 4],
];

const IN_RANGE = (n) => n >= 1 && n <= 9;
const ALL_ROWS_COLS = Array.from({ length: 9 }, (_, i) => i + 1);
const ALL_CELLS = ALL_ROWS_COLS.flatMap(
  row => ALL_ROWS_COLS.map(col => ({ row, col })));

const chessSeesConstraints = () => ALL_CELLS.map(({ row, col }) => new Or(
  CHESS_OFFSETS
    .map(([dr, dc]) => ({ r: row + dr, c: col + dc }))
    .filter(({ r, c }) => IN_RANGE(r) && IN_RANGE(c))
    .map(({ r, c }) => new SameValues(2, makeCellId(row, col), makeCellId(r, c)))
));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...chessSeesConstraints(),
];
