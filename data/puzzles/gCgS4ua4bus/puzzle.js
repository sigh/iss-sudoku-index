// Title: Knights & Bishops
// Author: Andrej Boban
// Video: https://www.youtube.com/watch?v=gCgS4ua4bus
// Source: https://cracking-the-cryptic.web.app/sudoku/39h9RTpq2Q

// Standard 9x9 sudoku (rows, columns, boxes). The grid also carries a fixed
// checkerboard colouring (grey/white cells, drawn on the board): 4 of the 9
// digits are "White Bishops" and occur only in white cells; the
// other 5 are "Knights", and identical digits cannot be a knight's move
// apart. Which digits are Bishops vs Knights is not given and is left to the
// solver.
//
// A knight's move always steps between a grey and a white cell (its
// (row+col) offset is always odd), so two cells holding the same Bishop
// digit -- both white -- can never be a knight's move apart. The anti-knight
// rule is therefore automatically satisfied for Bishop digits, and applying
// AntiKnight() globally over all 9 digits is equivalent to applying it only
// to the 5 Knight digits.
//
// "Exactly 4 digits occur only in white cells" is the same statement as
// "the grey cells collectively hold exactly 5 distinct digit values" (the
// digits absent from the grey cells are exactly the white-only ones). That
// is encoded below with CountDistinct: an off-grid control Var pinned to 5,
// tied to the distinct count over every grey cell.

// Givens, as drawn on the board.
const GIVENS = [
  ['R1C3', 2], ['R1C7', 3], ['R2C2', 1], ['R2C8', 4], ['R3C9', 5],
  ['R4C4', 3], ['R5C5', 6], ['R6C6', 9], ['R7C1', 7], ['R8C2', 3],
  ['R8C8', 9], ['R9C3', 9], ['R9C7', 8],
];

// Grey cells, as shaded on the board (40 light-grey cells): a checkerboard
// where (row + col) is odd, 1-indexed.
const GREY_CELLS = [
  'R1C2', 'R1C4', 'R1C6', 'R1C8',
  'R2C1', 'R2C3', 'R2C5', 'R2C7', 'R2C9',
  'R3C2', 'R3C4', 'R3C6', 'R3C8',
  'R4C1', 'R4C3', 'R4C5', 'R4C7', 'R4C9',
  'R5C2', 'R5C4', 'R5C6', 'R5C8',
  'R6C1', 'R6C3', 'R6C5', 'R6C7', 'R6C9',
  'R7C2', 'R7C4', 'R7C6', 'R7C8',
  'R8C1', 'R8C3', 'R8C5', 'R8C7', 'R8C9',
  'R9C2', 'R9C4', 'R9C6', 'R9C8',
];

const greyDistinctCount = new Var('B', 'grey-cell-distinct-value-count', 1);

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, v]) => new Given(cell, v)),
  new AntiKnight(),
  greyDistinctCount,
  new Given(greyDistinctCount.cell(1), 5),
  new CountDistinct(greyDistinctCount.cell(1), ...GREY_CELLS),
];
