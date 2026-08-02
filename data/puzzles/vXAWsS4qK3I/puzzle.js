// Title: Multiple Madness
// Author: Kitty Trouble
// Video: https://www.youtube.com/watch?v=vXAWsS4qK3I
// Source: https://app.crackingthecryptic.com/igpr21m2co

// Normal Sudoku rules apply. Consecutive cells on each violet line have a
// multiple relationship; the red thermometer increases from its R2C3 bulb.
const multiple = Pair.fnToKey((a, b) => a % b === 0 || b % a === 0, 9);
const violetLines = [
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R9C7', 'R8C8', 'R7C9'],
  ['R9C9', 'R8C9', 'R7C9', 'R6C9'],
  ['R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9'],
  ['R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2'],
  ['R1C7', 'R2C8'],
  ['R4C7', 'R3C8', 'R2C7', 'R3C6'],
  ['R3C6', 'R4C5', 'R4C4'],
  ['R4C5', 'R5C5', 'R6C5', 'R6C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R4C2', 'R5C2'],
  ['R6C3', 'R7C2', 'R8C3', 'R7C4'],
]; // Drawn violet multiple-line paths.

return [
  new Shape('9x9'),
  ...violetLines.map(cells => new Pair(multiple, 'multiple', ...cells)),
  new Thermo('R2C3', 'R2C4', 'R3C5'),
];
