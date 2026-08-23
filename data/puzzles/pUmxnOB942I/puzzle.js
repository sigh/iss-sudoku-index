// Title: Triple Decker
// Author: Mimaamakim
// Video: https://www.youtube.com/watch?v=pUmxnOB942I
// Source: https://app.crackingthecryptic.com/sudoku/Dm4HRqnL7p

// Normal sudoku, standard 3x3 boxes, no givens. Renban lines: each contains a
// set of non-repeating consecutive digits, in any order (12 lines, in 4
// groups of 3 parallel lines -- transcribed from the drawn line geometry).
// Sandwich clues outside the grid give the sum of the digits between the 1
// and the 9 in that row/column. Two inequality marks point to the smaller of
// their two connected cells; the R6C2/R6C3 mark sits on top of one of the
// renban lines (its first two cells) but is drawn and stated as its own
// separate clue, not a line split -- the other mark (R5C7/R5C8) is not on
// any line at all, confirming inequalities and lines are independent here.

const renbans = [
  ['R2C2', 'R3C2', 'R4C2'],
  ['R2C3', 'R3C3', 'R4C3'],
  ['R2C4', 'R3C4', 'R4C4'],
  ['R6C2', 'R6C3', 'R6C4'],
  ['R7C2', 'R7C3', 'R7C4'],
  ['R8C2', 'R8C3', 'R8C4'],
  ['R2C6', 'R2C7', 'R2C8'],
  ['R3C6', 'R3C7', 'R3C8'],
  ['R4C6', 'R4C7', 'R4C8'],
  ['R6C6', 'R7C6', 'R8C6'],
  ['R6C7', 'R7C7', 'R8C7'],
  ['R6C8', 'R7C8', 'R8C8'],
];

const geometry = cellGeometry('9x9');

// Sandwich clue arrowIds built from their full row/column cell lists so the
// direction-independence of the clue (sum between 1 and 9, wherever printed)
// is handled by the class itself rather than guessed by hand.
const col = (c) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => makeCellId(r, c));
const row = (r) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => makeCellId(r, c));
const sandwiches = [
  Sandwich.fromCells(33, col(1), geometry), // outside clue above column 1
  Sandwich.fromCells(33, row(9), geometry), // outside clue right of row 9
  Sandwich.fromCells(32, col(9), geometry), // outside clue below column 9
];

// GreaterThan(a, b) means a > b; the "<" marks point to the smaller cell.
const inequalities = [
  new GreaterThan('R6C3', 'R6C2'),
  new GreaterThan('R5C8', 'R5C7'),
];

return [
  new Shape('9x9'),
  ...renbans.map((cells) => new Renban(...cells)),
  ...sandwiches,
  ...inequalities,
];
