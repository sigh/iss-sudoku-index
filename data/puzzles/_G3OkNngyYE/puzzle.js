// Title: Tellurium Chaos
// Author: Nityant Agarwal
// Video: https://www.youtube.com/watch?v=_G3OkNngyYE
// Source: https://app.crackingthecryptic.com/sudoku/6ntFBrGr9t

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Digits along each arrow sum to the digit in that arrow's
// circle (bulb): Arrow's first cell is the bulb, the rest is the line.
// Cell paths transcribed from the payload's arrow waypoints; the payload's
// 13th arrow entry carries no waypoints and draws nothing, so it is omitted.
const arrows = [
  ['R2C2', 'R1C2', 'R1C3'],
  ['R2C2', 'R2C3', 'R3C3', 'R3C2'],
  ['R5C2', 'R5C3', 'R4C3', 'R4C2'],
  ['R5C2', 'R6C2', 'R6C3'],
  ['R6C4', 'R7C4', 'R8C4', 'R9C4'],
  ['R5C5', 'R4C5', 'R3C5'],
  ['R1C4', 'R1C5', 'R2C5'],
  ['R7C7', 'R8C6', 'R9C6'],
  ['R5C6', 'R6C7'],
  ['R2C9', 'R3C9', 'R3C8', 'R4C8', 'R4C9'],
  ['R6C9', 'R5C8', 'R5C7'],
  ['R8C9', 'R9C8', 'R9C7'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
