// Title: Induction
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=nmVNgQX_4No
// Source: https://app.crackingthecryptic.com/sudoku/Rt7qnrqPTB

// Normal sudoku rules (default rows/cols/boxes). Green lines: adjacent
// digits along the line differ by >= 5 -> Whisper(5, ...). All orthogonally
// adjacent cells (globally, not just on the lines): no consecutive digits ->
// AntiConsecutive.

// Given digits, transcribed from the drawn givens.
const givens = [
  ['R5C5', 2],
  ['R7C8', 9],
];

// Green line cell paths, transcribed from the drawn line geometry in path
// order. The last line dips back into the same box via an orthogonal middle
// step (R9C4-R9C3); Whisper applies the difference constraint between each
// consecutive pair in this order regardless of grid adjacency shape.
const greenLines = [
  ['R2C1', 'R3C2', 'R2C3', 'R1C2'],
  ['R1C8', 'R2C7', 'R3C8', 'R2C9'],
  ['R5C7', 'R4C8', 'R5C9', 'R6C8'],
  ['R6C2', 'R5C1', 'R4C2', 'R5C3'],
  ['R7C6', 'R8C7'],
  ['R8C2', 'R7C1'],
  ['R9C2', 'R8C1'],
  ['R8C3', 'R9C4', 'R9C3', 'R8C4'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  new AntiConsecutive(),
];
