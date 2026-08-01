// Title: Confiable
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=ZcbWWK_D6_M
// Source: https://sudokupad.app/james-sinclair/confiable

// Standard 9x9 Sudoku. Killer cages have distinct digits summing to their labels;
// each arrow's circle equals the sum of its shaft, and the black dot is a 1:2 ratio.
// Cage cells and totals transcribed from the five drawn killer cages.
const cages = [
  [14, 'R4C4', 'R4C5', 'R5C4', 'R5C5'],
  [22, 'R8C9', 'R9C8', 'R9C9'],
  [16, 'R4C7', 'R4C8', 'R5C7', 'R5C8'],
  [16, 'R7C4', 'R7C5', 'R8C4', 'R8C5'],
  [20, 'R1C1', 'R1C2', 'R2C1'],
];

// Paths transcribed from the eight drawn arrows, with each circle first.
const arrows = [
  ['R3C6', 'R4C5', 'R4C4'],
  ['R6C3', 'R5C4', 'R5C5'],
  ['R6C9', 'R7C9', 'R8C9'],
  ['R9C6', 'R9C7', 'R9C8'],
  ['R9C3', 'R8C4', 'R7C5'],
  ['R3C9', 'R4C8', 'R5C7'],
  ['R3C1', 'R4C1', 'R5C1'],
  ['R1C3', 'R1C4', 'R1C5'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  new BlackDot('R1C2', 'R2C2'),
];
