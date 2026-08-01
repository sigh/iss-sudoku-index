// Title: All the Dots are Brown
// Author: gdc
// Video: https://www.youtube.com/watch?v=tjosNn1tPzo
// Source: https://app.crackingthecryptic.com/xvflagdkmy

// Normal Sudoku rules apply. Each listed brown dot joins digits that are
// consecutive or in a 1:2 ratio. The fog and FOGLIGHT are reveal UI, not digit rules.
const brownDots = [
  ['R1C2', 'R1C3'], ['R1C5', 'R1C6'],
  ['R2C2', 'R2C3'], ['R2C3', 'R2C4'], ['R2C4', 'R2C5'], ['R2C7', 'R2C8'],
  ['R3C2', 'R3C3'],
  ['R4C1', 'R4C2'], ['R4C5', 'R4C6'],
  ['R5C1', 'R5C2'], ['R5C4', 'R5C5'], ['R5C5', 'R5C6'], ['R5C6', 'R5C7'], ['R5C7', 'R5C8'],
  ['R6C3', 'R6C4'], ['R6C4', 'R6C5'],
  ['R8C6', 'R8C7'], ['R9C4', 'R9C5'],
  ['R1C2', 'R2C2'],
  ['R2C2', 'R3C2'], ['R2C5', 'R3C5'], ['R2C8', 'R3C8'],
  ['R3C2', 'R4C2'], ['R3C3', 'R4C3'], ['R3C8', 'R4C8'],
  ['R4C2', 'R5C2'], ['R4C5', 'R5C5'], ['R4C6', 'R5C6'], ['R4C8', 'R5C8'],
  ['R5C5', 'R6C5'],
  ['R7C3', 'R8C3'], ['R7C9', 'R8C9'],
]; // Transcribed from the 32 drawn brown dots.

// The custom key permits either of the two relations named by a brown dot.
const brownDotKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) === 1 || a === 2 * b || b === 2 * a,
  9,
);

return [
  new Shape('9x9'),
  ...brownDots.map(([a, b]) => new Pair(brownDotKey, 'Brown dot', a, b)),
];
