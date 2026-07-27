// Title: playful fog
// Author: Wypman
// Video: https://www.youtube.com/watch?v=AwQ-H3lPQVc
// Source: https://sudokupad.app/njt50oqooj
//
// Normal sudoku rules apply. Digits on an arrow sum to the digit in its
// attached circle (the circle sits on a grid cell, not a total written
// outside the grid). On a red line, every sequential run of 3 cells holds
// one low (1-3), one mid (4-6), and one high (7-9) digit -- the native
// Entropic class's semantics. Fog (which cells are hidden until nearby
// digits are placed) is solving UI, not a final-grid rule, and is omitted.
//
// Arrow cells: [circle, ...arm], read off the drawn geometry (arrow paths,
// each starting at the cell carrying the white circle overlay).
const ARROWS = [
  ['R1C6', 'R1C5', 'R1C4'],
  ['R6C9', 'R5C9', 'R4C9'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R3C1', 'R3C2', 'R3C3'],
  ['R7C9', 'R7C8', 'R7C7'],
  ['R7C3', 'R8C3', 'R9C3'],
  ['R3C7', 'R2C7', 'R1C7'],
  ['R1C8', 'R2C8', 'R3C8'],
  ['R7C2', 'R6C3', 'R6C4'],
  ['R5C5', 'R4C5', 'R3C5'],
  ['R6C6', 'R5C7', 'R4C7'],
  ['R1C3', 'R2C3', 'R2C2'],
];

// Red (entropic) line cells, read off the drawn line geometry in stroke order.
const ENTROPIC_LINES = [
  ['R1C4', 'R2C4', 'R2C5', 'R1C5', 'R1C6', 'R1C7'],
  ['R4C9', 'R4C8', 'R5C8', 'R5C9', 'R6C9', 'R7C9'],
  ['R9C6', 'R8C6', 'R8C5', 'R9C5', 'R9C4', 'R9C3'],
  ['R6C1', 'R6C2', 'R5C2', 'R5C1', 'R4C1', 'R3C1'],
  ['R2C6', 'R3C6', 'R3C5'],
  ['R4C3', 'R4C2', 'R3C2'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 9),
  new Given('R1C9', 1),
  new Given('R9C1', 1),
  new Given('R9C9', 9),
  ...ARROWS.map(cells => new Arrow(...cells)),
  ...ENTROPIC_LINES.map(cells => new Entropic(...cells)),
];
