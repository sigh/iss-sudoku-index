// Title: August 13, 2021: X Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=Y-VrdZMHMqM
// Source: https://tinyurl.com/49aj38x2

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Digits along a
// thermometer must increase, starting from the round bulb. Digits separated
// by an X must sum to 10; not all Xes are necessarily given, so absence of an
// X carries no information and is not encoded as a negative constraint.

// Thermometers: cell order is bulb-first, matching the drawn line order, so
// Thermo's default "increasing from the first cell" semantics apply directly.
const thermos = [
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R4C4', 'R5C4', 'R6C4', 'R7C4'],
  ['R6C6', 'R7C6', 'R8C6', 'R9C6'],
  ['R4C9', 'R4C8', 'R4C7', 'R4C6'],
  ['R9C4', 'R9C3', 'R9C2', 'R9C1'],
  ['R7C1', 'R6C1', 'R5C1', 'R4C1'],
  ['R9C9', 'R8C9', 'R7C9', 'R6C9'],
];

// X markers: each pair of adjacent cells sums to 10.
const xPairs = [
  ['R1C6', 'R1C7'],
  ['R3C3', 'R3C4'],
  ['R6C4', 'R5C4'],
  ['R8C6', 'R7C6'],
  ['R9C4', 'R9C3'],
  ['R4C7', 'R4C6'],
  ['R7C1', 'R8C1'],
  ['R5C9', 'R6C9'],
  ['R5C1', 'R5C2'],
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  ...xPairs.map(cells => new X(...cells)),
];
