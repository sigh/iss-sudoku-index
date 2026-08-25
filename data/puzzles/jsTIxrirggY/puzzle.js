// Title: La Persistencia del Sudoku
// Author: Phil Preen
// Video: https://www.youtube.com/watch?v=jsTIxrirggY
// Source: https://app.crackingthecryptic.com/sudoku/H93QNngg6Q

// Normal sudoku rules (default row/column/box all-different from Shape).
// Yellow lines are separate palindromes (Palindrome per line, independently).
// Grey lines are thermometers, strictly increasing from the bulb (first
// argument) towards the other end(s) (Thermo per line/arm).
// One hidden, unmarked, straight 9-cell thermometer occupies some whole row,
// column, or main diagonal -- neither the line nor which end is the bulb is
// given, so this is encoded as a disjunction over every row, every column,
// and both main diagonals, each tried in both directions (Thermo's first
// argument is its bulb).

const idx = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const rows = idx.map(r => idx.map(c => makeCellId(r, c)));
const cols = idx.map(c => idx.map(r => makeCellId(r, c)));
const mainDiag = idx.map(i => makeCellId(i, i));
const antiDiag = idx.map(i => makeCellId(i, 10 - i));
const candidateLines = [...rows, ...cols, mainDiag, antiDiag];

const hiddenThermoOptions = candidateLines.flatMap(line => [
  new Thermo(...line),
  new Thermo(...[...line].reverse()),
]);

return [
  new Shape('9x9'),

  new Given('R3C4', 1),
  new Given('R4C5', 2),
  new Given('R5C2', 9),
  new Given('R5C8', 3),
  new Given('R8C5', 6),

  // Grey thermometers, drawn bulb first.
  new Thermo('R1C1', 'R2C1', 'R3C1'),
  new Thermo('R1C5', 'R2C5'),
  new Thermo('R3C9', 'R2C9', 'R1C9'),
  // One thermometer's bulb circle sits mid-path at the grid centre (R5C5),
  // splitting the drawn stroke into two ascending arms sharing that bulb.
  new Thermo('R5C5', 'R5C4', 'R6C3', 'R7C3'),
  new Thermo('R5C5', 'R4C6', 'R5C7', 'R6C7', 'R7C7', 'R8C7'),

  // Yellow palindromes, each independent.
  new Palindrome('R4C9', 'R5C8', 'R6C8', 'R7C8', 'R8C9', 'R9C9', 'R8C8'),
  new Palindrome(
    'R3C8', 'R2C7', 'R2C6', 'R3C5', 'R2C4', 'R2C3', 'R3C2', 'R4C1', 'R5C1'),
  new Palindrome(
    'R6C2', 'R7C1', 'R8C1', 'R7C2', 'R8C3', 'R8C4', 'R9C5', 'R9C6', 'R8C6'),

  // Hidden thermometer: exactly which line and which end is unknown, so try
  // every row, column, and main diagonal in both directions.
  new Or(hiddenThermoOptions),
];
