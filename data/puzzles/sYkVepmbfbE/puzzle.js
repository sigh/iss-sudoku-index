// Title: Bowser's Castle
// Author: Emmettcito
// Video: https://www.youtube.com/watch?v=sYkVepmbfbE
// Source: https://app.crackingthecryptic.com/sudoku/3HbhqRrQRR
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Digits along an arrow sum to the digit in that arrow's circle ->
// one Arrow(circle, ...shaft) per arrow, bulb first. Arrow cells were read
// off the drawn waypoints; each bulb is a white-filled, grey-bordered
// circle and the 14 circles match the 14 arrows one-to-one.
const arrows = [
  ['R1C2', 'R1C3', 'R2C3', 'R3C3'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R1C8', 'R1C7', 'R2C7', 'R3C7'],
  ['R4C8', 'R3C9'],
  ['R5C7', 'R4C6'],
  ['R6C7', 'R7C6'],
  ['R6C8', 'R7C7'],
  ['R9C8', 'R9C9', 'R8C9', 'R7C9'],
  ['R9C5', 'R9C6', 'R9C7'],
  ['R9C2', 'R9C1', 'R8C1', 'R7C1'],
  ['R6C2', 'R7C3'],
  ['R5C3', 'R5C4', 'R5C5', 'R6C6'],
  ['R4C2', 'R3C1'],
  ['R4C3', 'R3C2'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
