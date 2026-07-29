// Title: sum or mu
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=aNwVXvVvxFc
// Source: https://sudokupad.app/yjy08cqz6p

// Normal Sudoku rules apply. Grey lines sum to 10. A circled cell equals the
// exact average of all cells on its golden line. The four cells around the
// white circle in box 6 are a consecutive set.

// These paths are the drawn grey and golden lines; each golden entry names its
// circled cell separately from the other cells so its average equation is clear.
const greyLines = [
  ['R2C1', 'R2C2'],
  ['R1C1', 'R1C2'],
  ['R8C8', 'R8C9'],
  ['R9C8', 'R9C9'],
  ['R4C8', 'R5C8'],
  ['R3C4', 'R3C5', 'R3C6'],
  ['R4C2', 'R5C2'],
  ['R6C2', 'R7C1'],
  ['R6C6', 'R6C5', 'R6C4'],
  ['R7C4', 'R8C4'],
];
const goldenLines = [
  ['R7C7', ['R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7', 'R1C7']],
  ['R3C3', ['R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3']],
  ['R9C5', ['R8C5', 'R7C5']],
  ['R9C2', ['R8C2', 'R7C2']],
  ['R3C9', ['R2C9', 'R1C9']],
  ['R2C6', ['R2C5', 'R2C4']],
  ['R5C4', ['R5C5', 'R5C6']],
  ['R5C9', ['R6C9', 'R6C8']],
];

return [
  new Shape('9x9'),
  ...greyLines.map((cells) => new Sum(10, ...cells)),
  // For each golden line, its non-circle cells sum to (line length - 1) times
  // the circled digit, which is equivalent to that digit being the line average.
  ...goldenLines.map(([circle, arms]) => new Sum(0, ...arms, [circle, -arms.length])),
  new Renban('R5C7', 'R5C8', 'R6C7', 'R6C8'),
];
