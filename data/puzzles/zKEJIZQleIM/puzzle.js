// Title: Surely This Sudoku Can't Be Solved?
// Author: Nityant Agarwal
// Video: https://www.youtube.com/watch?v=zKEJIZQleIM
// Source: https://cracking-the-cryptic.web.app/sudoku/th4Qh27tJF

// Normal sudoku rules (default rows/cols/boxes, no givens). Nine arrows: the
// sum of the digits along each arrow's path equals the digit in its circled
// cell. Digits may repeat within an arrow.

// Arrow bulb (circled sum cell, first) and arm cells, transcribed from the
// drawn arrow paths (each arrow's bulb coincides with one of the nine drawn
// white-circle underlays, one-to-one).
const arrows = [
  ['R3C2', 'R2C3', 'R1C4'],
  ['R4C2', 'R3C3', 'R2C4', 'R1C5'],
  ['R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C5'],
  ['R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7'],
  ['R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R6C7', 'R5C8', 'R4C9'],
  ['R9C3', 'R8C4', 'R7C5', 'R6C6'],
  ['R9C5', 'R8C6', 'R7C7'],
  ['R9C7', 'R8C8', 'R7C9'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
