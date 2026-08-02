// Title: Neighbours Sudoku
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=8gCChrnrs2U
// Source: https://app.crackingthecryptic.com/sudoku/hgBgMrm4JG

// Normal Sudoku rules apply. Each listed outside clue requires its two digits to
// be consecutive cells somewhere in the named row or column, in either order.
const columns = [
  ['45', 1], ['67', 2], ['23', 3], ['58', 4], ['67', 5], ['16', 6], ['13', 7], ['67', 8],
  ['29', 1], ['17', 6],
];
const rows = [
  ['13', 1], ['67', 2], ['38', 3], ['89', 4], ['67', 5], ['68', 6], ['49', 7], ['67', 8],
  ['29', 2], ['12', 5], ['79', 6],
];
const cellsInColumn = column => Array.from({length: 9}, (_, row) => makeCellId(row + 1, column));
const cellsInRow = row => Array.from({length: 9}, (_, column) => makeCellId(row, column + 1));
const neighbourRegex = digits => `.*(${digits}|${digits[1]}${digits[0]}).*`;

return [
  new Shape('9x9'),
  ...columns.map(([digits, column]) => new Regex(neighbourRegex(digits), ...cellsInColumn(column))),
  ...rows.map(([digits, row]) => new Regex(neighbourRegex(digits), ...cellsInRow(row))),
];
