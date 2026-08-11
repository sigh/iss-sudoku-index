// Title: Programmer's Arrows
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=h9WzDaKn6uI
// Source: https://app.crackingthecryptic.com/sudoku/tFQqJHHt3R

// Standard sudoku rules, but the digit set is 0-8 rather than 1-9 (the
// video's rules text and the source solution's symbol set both give
// 0-8). Digits along each arrow sum to the digit in that arrow's circle.
// Three separate arrows share one circle at R4C4 (drawn as one circle with
// three distinct shafts leaving it); each is its own Arrow constraint.
const arrows = [
  ['R2C2', 'R1C2', 'R2C1'],
  ['R4C4', 'R3C4', 'R2C3', 'R1C3'],
  ['R4C4', 'R4C3', 'R3C2', 'R3C1'],
  ['R4C4', 'R4C5', 'R5C5'],
  ['R2C6', 'R3C6', 'R4C7'],
  ['R4C8', 'R3C9'],
  ['R5C6', 'R5C7', 'R5C8', 'R6C9'],
  ['R6C6', 'R6C7', 'R6C8'],
  ['R6C2', 'R7C3', 'R8C4', 'R9C4'],
  ['R6C3', 'R7C4', 'R8C5', 'R9C5'],
  ['R6C4', 'R6C5', 'R7C5', 'R8C6'],
  ['R9C1', 'R8C1', 'R7C2', 'R8C3'],
  ['R9C6', 'R9C7', 'R8C8', 'R7C8'],
];

return [
  new Shape('9x9', '0-8'),
  ...arrows.map(cells => new Arrow(...cells)),
];
