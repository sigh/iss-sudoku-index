// Title: Circles in the Mist
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=cyEoWCqQf1w
// Source: https://sudokupad.app/zdmnz4qx5m

// Rules encoded here:
//   Normal Sudoku (no givens).
//   Arrows: digits on an arrow sum to the digit in that arrow's circle.
//   Circles: a digit in a circle gives how many times that digit appears in
//     circles; arrow circles count as circles.
// Not encoded, and why:
//   "Arrows do not branch, cross or share cells (including circles) with other
//     arrows" describes the drawn arrow set, not the digits; the 33 arrow cells
//     below are distinct, so the drawing already satisfies it.
//   Fog, and the two `foglight` 3x3 areas (box 1 and box 7), are reveal
//     mechanics for the interactive grid and place no restriction on digits.

// Drawn arrows, circle (bulb) first, then the shaft cells in drawn order.
const arrows = [
  ['R1C1', 'R2C2', 'R3C2'],
  ['R6C2', 'R6C1', 'R7C2', 'R8C2', 'R9C2'],
  ['R1C4', 'R1C3', 'R1C2'],
  ['R4C2', 'R4C3', 'R5C3', 'R6C4'],
  ['R7C6', 'R7C5', 'R8C4', 'R9C3'],
  ['R5C6', 'R6C7', 'R7C7', 'R8C6'],
  ['R9C6', 'R9C7', 'R9C8'],
  ['R2C8', 'R3C8', 'R4C8', 'R5C8'],
  ['R2C9', 'R1C8', 'R1C7'],
];

// The 15 drawn circles that are not an arrow bulb.
const plainCircles = [
  'R1C6', 'R2C6', 'R2C7', 'R3C4', 'R3C5', 'R3C9', 'R4C4', 'R5C1',
  'R5C7', 'R6C8', 'R6C9', 'R8C7', 'R8C8', 'R9C5', 'R9C9',
];

// "Arrow circles count as circles for this rule": the counted set is every drawn
// circle, so the nine arrow bulbs join the fifteen plain ones. All 24 are
// distinct cells.
const circles = [...arrows.map(cells => cells[0]), ...plainCircles];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  new CountingCircles(...circles),
];
