// Title: Equipoise
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=W_h4QH-W45Q
// Source: https://sudokupad.app/qpd5keiva9

// Normal sudoku rules apply (default rows/columns/3x3 boxes, no givens).
// Digits strictly increase along each thermometer starting from the bulb end.
// The short 2-cell green thermometer is drawn R8C4-R8C5, but its bulb circle
// sits on R8C5 (not the first-drawn cell), so it is encoded bulb-first as
// R8C5, R8C4. This is confirmed by the equal-sum arithmetic below: reading it
// the other way would make it a decreasing pair, breaking the strict-increase
// rule that every other thermometer obeys.
const blueThermos = [
  ['R3C3', 'R3C2', 'R3C1'],
  ['R1C6', 'R2C5', 'R3C4'],
  ['R3C9', 'R2C8', 'R1C7'],
  ['R6C3', 'R5C3', 'R4C3'],
  ['R6C6', 'R6C5', 'R6C4'],
];

const greenThermos = [
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R4C7', 'R5C7', 'R6C7'],
  ['R7C7', 'R7C8', 'R7C9'],
  ['R9C4', 'R9C5', 'R9C6', 'R8C6', 'R7C6'],
  ['R8C5', 'R8C4'],
  ['R9C3', 'R8C2', 'R7C2'],
];

return [
  new Shape('9x9'),
  ...blueThermos.map(cells => new Thermo(...cells)),
  ...greenThermos.map(cells => new Thermo(...cells)),
  // All thermometers of the same colour sum to the same total (the two
  // colours' totals need not match each other).
  new EqualSum(...blueThermos),
  new EqualSum(...greenThermos),
];
