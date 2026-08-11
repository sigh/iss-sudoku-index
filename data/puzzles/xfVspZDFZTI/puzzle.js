// Title: Assassin9
// Author: Ore
// Video: https://www.youtube.com/watch?v=xfVspZDFZTI
// Source: https://app.crackingthecryptic.com/sudoku/ppTdQNN23n

// Normal Sudoku (1-9 per row, column and marked region) on nine irregular
// 9-cell regions in place of default boxes. Digits in a cage sum to the
// printed total; the source's own clue array for these totals is itself
// named "cages", licensing Cage's built-in no-repeat half alongside the sum.
// Digits on an arrow sum to the digit in that arrow's circle. One circle
// (R9C5) anchors two arrows, encoded as two independent Arrow constraints
// sharing the bulb cell.

const shape = new Shape('9x9');

// Region cells, transcribed from the source's drawn region outlines.
const regions = [
  ['R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C1', 'R3C2', 'R4C3', 'R4C2', 'R4C1'],
  ['R5C3', 'R6C3', 'R6C4', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C7', 'R6C6'],
  ['R7C1', 'R7C2', 'R8C1', 'R8C2', 'R9C1', 'R5C1', 'R5C2', 'R6C2', 'R6C1'],
  ['R1C4', 'R1C5', 'R1C6', 'R3C3', 'R2C3', 'R1C3', 'R3C7', 'R2C7', 'R1C7'],
  ['R4C4', 'R4C5', 'R4C6', 'R2C4', 'R2C5', 'R2C6', 'R3C6', 'R3C5', 'R3C4'],
  ['R7C4', 'R7C5', 'R7C6', 'R8C4', 'R8C5', 'R8C6', 'R6C5', 'R7C3', 'R7C7'],
  ['R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C8', 'R3C9', 'R4C7', 'R4C8', 'R4C9'],
  ['R5C8', 'R5C9', 'R6C8', 'R6C9', 'R7C8', 'R8C8', 'R7C9', 'R8C9', 'R9C9'],
  ['R8C7', 'R9C7', 'R9C8', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R8C3'],
];

// Cage cells and totals, transcribed from the source's drawn killer cages.
const cages = [
  [18, ['R1C4', 'R1C5', 'R1C6']],
  [11, ['R3C8', 'R3C9']],
  [12, ['R5C4', 'R5C5']],
  [9, ['R5C7', 'R6C7']],
];

// Arrow circle (bulb) and arm cells, derived from each drawn arrow's line
// (interpolated to the cells it crosses) and matched to the nearest drawn
// circle at its tail. R9C5 supplies the bulb for two separate arrows.
const arrows = [
  ['R2C1', ['R1C1', 'R1C2', 'R2C2']],
  ['R2C5', ['R3C5', 'R4C5']],
  ['R2C9', ['R1C9', 'R1C8', 'R2C8']],
  ['R6C9', ['R5C9', 'R5C8', 'R6C8']],
  ['R7C1', ['R6C1', 'R6C2', 'R7C2']],
  ['R8C6', ['R7C6', 'R7C5', 'R6C5']],
  ['R9C5', ['R9C6', 'R9C7']],
  ['R9C5', ['R9C4', 'R9C3', 'R9C2']],
];

return [
  shape,
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  ...cages.map(([total, cells]) => new Cage(total, ...cells)),
  ...arrows.map(([bulb, arms]) => new Arrow(bulb, ...arms)),
];
