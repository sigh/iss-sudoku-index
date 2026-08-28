// Title: Poisoned Sandwich
// Author: Phoenix0589
// Video: https://www.youtube.com/watch?v=H8rzIxL8VsU
// Source: https://cracking-the-cryptic.web.app/sudoku/HTNqPftpgR
//
// Standard 9x9 sudoku (default regions: the nine 3x3 boxes).
// Sandwich clues: outside-grid totals give the sum of digits strictly
// between the 1 and the 9 in that row/column (0 means 1 and 9 are adjacent).
// Little killer clues: arrows from a grid corner give the sum of the digits
// on the diagonal they point along (digits may repeat off a sudoku unit).
//
// Two little killer arrows are drawn with letters instead of numbers ("a"
// and "b") in place of a sum; both diagonals pass through R1C6, which
// carries its own "c" label. A formula below the grid reads "a+b-c=37":
// the "a" diagonal sum, plus the "b" diagonal sum, minus the value of R1C6,
// equals 37. Since both diagonals share exactly the cell R1C6, this reduces
// algebraically to a plain sum: (a - R1C6) + b = 37, i.e. the total of the
// "a" diagonal's other 5 cells plus every cell of the "b" diagonal is 37.

const geometry = cellGeometry('9x9');
const g = cellGraph('9x9');

// Sandwich totals, transcribed from the outside-grid overlay text next to
// each row/column.
const sandwichCols = { 1: 35, 2: 29, 3: 0, 4: 0, 5: 11, 7: 0, 8: 29, 9: 35 };
const sandwichRows = { 2: 30, 3: 0, 4: 7, 6: 11, 7: 0, 8: 30 };

const sandwiches = [
  ...Object.entries(sandwichCols).map(
    ([c, v]) => Sandwich.fromCells(v, g.column(+c), geometry)),
  ...Object.entries(sandwichRows).map(
    ([r, v]) => Sandwich.fromCells(v, g.row(+r), geometry)),
];

// Numbered little killer diagonals, transcribed from the corner overlay
// text next to each arrow.
const littleKillers = [
  LittleKiller.fromCells(19, g.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(49, g.ray('R1C7', 1, -1), geometry),
  LittleKiller.fromCells(37, g.ray('R9C1', -1, 1), geometry),
  LittleKiller.fromCells(13, g.ray('R9C3', -1, -1), geometry),
];

// The "a" and "b" diagonals (unlabelled arrows) and the a+b-c=37 formula.
// diagA[0] === diagB[3] === 'R1C6' === the cell marked "c".
const diagA = g.ray('R1C6', 1, -1); // 6 cells, sum = a
const diagB = g.ray('R4C9', -1, -1); // 4 cells, sum = b, ends at R1C6
const formulaCells = [...diagA.slice(1), ...diagB]; // a's cells minus c, plus all of b
const abcFormula = new Sum(37, ...formulaCells);

return [
  new Shape('9x9'),
  ...sandwiches,
  ...littleKillers,
  abcFormula,
];
