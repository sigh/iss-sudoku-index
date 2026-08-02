// Title: Minimum Maximum
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=4fHLysfBnwE
// Source: https://sudokupad.app/ohqf2rxsno

// Normal Sudoku rules apply. Each lime minimum-line digit is at least its line's
// cell count; each blue maximum-line digit is at most its line's cell count.
// The tables transcribe the coloured paths; the repeated first cell closes the
// four-cell blue loop and is not a second occupied cell.
const minimumLines = [
  ['R9C8', 'R8C7', 'R7C6', 'R7C5', 'R6C5', 'R5C4', 'R5C3', 'R4C2'],
  ['R2C6', 'R2C5', 'R3C5'],
  ['R4C5', 'R4C4', 'R3C4', 'R3C3', 'R4C3'],
  ['R4C6', 'R5C6'],
  ['R2C3', 'R2C4', 'R1C4', 'R1C3', 'R1C2', 'R1C1'],
  ['R6C3', 'R6C4', 'R7C4'],
  ['R8C3', 'R8C4'],
  ['R6C1', 'R5C1', 'R4C1'],
  ['R3C6', 'R2C7'],
  ['R6C7', 'R6C6', 'R5C7'],
];
const maximumLines = [
  ['R1C5', 'R1C6'],
  ['R9C3', 'R9C4', 'R9C5'],
  ['R5C2', 'R6C2', 'R7C3', 'R7C2', 'R7C1', 'R8C1'],
  ['R7C9', 'R6C8', 'R5C8', 'R4C8', 'R5C9'],
  ['R2C1', 'R3C1', 'R3C2', 'R2C2'],
  ['R2C8', 'R3C7', 'R3C8', 'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7'],
];

const allowedFrom = (minimum) => Array.from({length: 10 - minimum}, (_, i) => minimum + i);
const allowedTo = (maximum) => Array.from({length: maximum}, (_, i) => i + 1);

return [
  new Shape('9x9'),
  ...minimumLines.flatMap((line) => line.map((cell) => new Given(cell, ...allowedFrom(line.length)))),
  ...maximumLines.flatMap((line) => line.map((cell) => new Given(cell, ...allowedTo(line.length)))),
];
