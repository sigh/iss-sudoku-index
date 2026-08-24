// Title: Kropki/XV Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=c_NjEbFEeW0
// Source: https://app.crackingthecryptic.com/sudoku/BfQ9HBtQp8

// Standard Sudoku rules. Digits joined by a black dot are in a 1:2 ratio;
// digits joined by a white dot are consecutive; digits joined by an X sum to
// 10; digits joined by a V sum to 5. Not all dots, X's and V's are given, so
// unmarked adjacent pairs carry no constraint (StrictKropki/StrictXV do not
// apply here).

// Cell pairs transcribed from the puzzle's drawn dot/X/V overlays.
const whiteDots = [
  ['R2C7', 'R2C8'], ['R1C9', 'R2C9'], ['R3C9', 'R4C9'], ['R4C9', 'R5C9'],
  ['R5C7', 'R5C8'], ['R5C6', 'R5C7'], ['R5C6', 'R6C6'], ['R6C5', 'R6C6'],
  ['R9C4', 'R9C5'], ['R9C3', 'R9C4'], ['R8C2', 'R9C2'], ['R6C2', 'R7C2'],
];

const blackDots = [
  ['R2C8', 'R2C9'], ['R1C4', 'R1C5'], ['R1C2', 'R1C3'], ['R1C1', 'R2C1'],
  ['R3C1', 'R4C1'], ['R5C1', 'R5C2'], ['R7C2', 'R8C2'], ['R7C5', 'R8C5'],
];

const xMarks = [
  ['R5C8', 'R5C9'], ['R5C7', 'R6C7'], ['R2C6', 'R2C7'], ['R1C5', 'R2C5'],
  ['R2C1', 'R3C1'], ['R4C1', 'R5C1'], ['R5C2', 'R6C2'], ['R9C1', 'R9C2'],
  ['R8C5', 'R9C5'], ['R6C5', 'R7C5'],
];

const vMarks = [
  ['R2C5', 'R2C6'], ['R1C3', 'R1C4'], ['R1C1', 'R1C2'],
];

return [
  new Shape('9x9'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...xMarks.map(cells => new X(...cells)),
  ...vMarks.map(cells => new V(...cells)),
];
