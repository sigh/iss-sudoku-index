// Title: Renbanku V2
// Author: SuDaveKu
// Video: https://www.youtube.com/watch?v=WsRkjYQdhyc
// Source: https://app.crackingthecryptic.com/q2hhm7t82m

// Normal Sudoku rules apply. Purple paths are renban lines: each holds a
// non-repeating consecutive set. Outside clues are sandwich sums, and the
// grey line increases from its bulb at R3C9 to R2C9.
const renbans = [
  ['R8C1', 'R9C1', 'R9C2', 'R8C2', 'R7C2', 'R7C3', 'R7C4', 'R7C5'],
  ['R9C3', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R7C7', 'R7C8'],
  ['R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9'],
  ['R6C1', 'R5C1', 'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R3C5'],
  ['R5C3', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R5C6', 'R5C7', 'R5C8'],
  ['R6C8', 'R6C9', 'R5C9', 'R4C9', 'R4C8', 'R4C7', 'R4C6', 'R3C6'],
  ['R3C2', 'R3C3', 'R3C4', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R1C7'],
  ['R3C1', 'R2C1', 'R2C2', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'],
];

const geometry = cellGeometry('9x9');
const row = (number) => Array.from({length: 9}, (_, i) => makeCellId(number, i + 1));
const column = (number) => Array.from({length: 9}, (_, i) => makeCellId(i + 1, number));

return [
  new Shape('9x9'),
  ...renbans.map((cells) => new Renban(...cells)),
  new Thermo('R3C9', 'R2C9'),
  // Outside badges address these complete row or column lanes.
  Sandwich.fromCells(29, column(1), geometry),
  Sandwich.fromCells(20, column(6), geometry),
  Sandwich.fromCells(12, column(8), geometry),
  Sandwich.fromCells(19, row(1), geometry),
  Sandwich.fromCells(17, row(4), geometry),
  Sandwich.fromCells(9, row(5), geometry),
  Sandwich.fromCells(14, row(6), geometry),
  Sandwich.fromCells(31, row(9), geometry),
];
