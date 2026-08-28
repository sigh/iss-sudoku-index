// Title: Aug 29, 2021: Even Sandwich
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=O1vAKJyVvG0
// Source: https://tinyurl.com/9tr79ea4

// Rules: Normal Sudoku rules apply (default row/column/box AllDifferent).
// A margin label outside a row or column names one digit. Wherever that
// digit sits in the row/column, its immediate left and right neighbours (row
// clue) or above/below neighbours (column clue) must both be even -- the
// digit is "sandwiched" between two even digits, so it cannot occupy the
// first or last cell of the line. Each clue is encoded as a Regex over the
// line's 9 digits: a 3-character window of [even][clue digit][even] must
// occur somewhere in the sequence; a window can only match at an interior
// position, which is what excludes the two end cells.

const graph = cellGraph('9x9');

// Givens, transcribed from the drawn grid.
const givens = [
  new Given('R2C2', 1), new Given('R2C8', 2),
  new Given('R3C3', 2), new Given('R3C7', 3),
  new Given('R4C4', 3), new Given('R4C6', 4),
  new Given('R6C4', 6), new Given('R6C6', 5),
  new Given('R7C3', 7), new Given('R7C7', 6),
  new Given('R8C2', 8), new Given('R8C8', 7),
];

// Row-margin "Even Sandwich" clues, transcribed from the drawn margin labels.
// [row, clueDigit]
const rowClues = [
  [2, 1],
  [3, 2],
  [4, 3],
  [5, 4],
  [6, 5],
  [7, 6],
  [8, 7],
];

// Column-margin "Even Sandwich" clues, transcribed from the drawn margin
// labels. [col, clueDigit]
const colClues = [
  [2, 3],
  [3, 6],
  [4, 9],
  [5, 9],
  [6, 7],
  [7, 8],
  [8, 9],
];

const sandwichPattern = (digit) => `.*[2468]${digit}[2468].*`;

const rowSandwiches = rowClues.map(([row, digit]) =>
  new Regex(sandwichPattern(digit), ...graph.row(row)));

const colSandwiches = colClues.map(([col, digit]) =>
  new Regex(sandwichPattern(digit), ...graph.column(col)));

return [
  new Shape('9x9'),
  ...givens,
  ...rowSandwiches,
  ...colSandwiches,
];
