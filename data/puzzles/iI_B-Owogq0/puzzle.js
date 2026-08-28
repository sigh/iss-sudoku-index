// Title: A Magical Miracle Sudoku
// Author: The Dying Flutchman
// Video: https://www.youtube.com/watch?v=iI_B-Owogq0
// Source: https://cracking-the-cryptic.web.app/sudoku/4RQ9rbpmjT
//
// Normal sudoku rules apply. Cells separated by a knight's or a king's move
// cannot hold the same digit (AntiKnight, AntiKing). The nine grey cells
// must all differ (AllDifferent) and form a magic square: every row,
// column, and main diagonal of the grey arrangement sums to the same total
// (EqualSum over all eight segments together).
//
// Grey cells (one per box, from the puzzle's drawn grey-fill markers):
//   R2C2 R2C5 R2C8
//   R5C2 R5C5 R5C8
//   R8C2 R8C5 R8C8
// These already lie on grid rows 2/5/8 and grid columns 2/5/8, so the grey
// arrangement's own rows/columns are exactly those three grid rows/columns;
// its two "main diagonals" are R2C2-R5C5-R8C8 and R2C8-R5C5-R8C2.

const greyRows = [
  ['R2C2', 'R2C5', 'R2C8'],
  ['R5C2', 'R5C5', 'R5C8'],
  ['R8C2', 'R8C5', 'R8C8'],
];
const greyCols = [0, 1, 2].map(c => greyRows.map(row => row[c]));
const greyDiag1 = [greyRows[0][0], greyRows[1][1], greyRows[2][2]];
const greyDiag2 = [greyRows[0][2], greyRows[1][1], greyRows[2][0]];
const greyCells = greyRows.flat();

return [
  new Shape('9x9'),

  new Given('R5C4', 1),
  new Given('R7C4', 2),
  new Given('R9C4', 4),

  new AntiKnight(),
  new AntiKing(),

  new AllDifferent(...greyCells),
  new EqualSum(...greyRows, ...greyCols, greyDiag1, greyDiag2),
];
