// Title: Not Your Average Thermo Puzzle
// Author: Scojo
// Video: https://www.youtube.com/watch?v=khPPxtVxjGk
// Source: https://app.crackingthecryptic.com/6D6Lrqt7p7

// Normal Sudoku rules apply. Grey thermometers increase from their bulbs to tips.
// On each orange arrow, the arm digits have arithmetic mean equal to its circled cell;
// arrows sharing a circle remain separate arrows.

// Thermometer paths transcribed from the grey bulb-and-line artwork, bulb first.
const thermos = [
  ['R3C1', 'R2C1'],
  ['R1C2', 'R1C3'],
  ['R3C8', 'R3C7', 'R3C6', 'R3C5', 'R2C4', 'R1C4'],
  ['R4C1', 'R4C2', 'R5C3', 'R6C3', 'R7C3', 'R8C3'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R1C9', 'R1C8', 'R1C7'],
  ['R5C6', 'R5C5', 'R6C5'],
  ['R4C8', 'R5C9', 'R6C9', 'R7C9'],
  ['R9C7', 'R9C6', 'R9C5', 'R8C4'],
];

// Orange arrow arms transcribed from the drawn arrows, as [circle, ...arm].
const arrows = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R1C1', 'R2C1', 'R3C1'],
  ['R4C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8'],
  ['R4C4', 'R5C3', 'R6C3', 'R7C3', 'R8C3'],
  ['R7C7', 'R6C7', 'R5C7', 'R4C7'],
  ['R7C7', 'R7C6', 'R7C5', 'R7C4'],
  ['R9C9', 'R8C9', 'R7C9', 'R6C9'],
  ['R9C9', 'R9C8', 'R9C7', 'R9C6'],
  ['R2C6', 'R1C7', 'R1C8', 'R1C9'],
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  ...arrows.map(([circle, ...arm]) => new Sum(0, ...arm, [circle, -arm.length])),
];
