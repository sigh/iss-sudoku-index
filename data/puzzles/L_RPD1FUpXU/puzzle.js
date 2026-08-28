// Title: Quasimodo's Ears
// Author: Memeristor
// Video: https://www.youtube.com/watch?v=L_RPD1FUpXU
// Source: https://tinyurl.com/2c577j92

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Green lines: German whisper -- adjacent cells on the line differ by >= 5.
// Blue lines: region sum lines -- digits on the line have an equal sum
// within each box the line passes through.

const whispers = [
  ['R1C1', 'R2C1'],
  ['R9C8', 'R9C7'],
  ['R7C3', 'R6C4', 'R6C5'],
  ['R3C7', 'R4C6', 'R4C5'],
  ['R7C6', 'R6C5'],
  ['R3C4', 'R4C5'],
].map((cells) => new Whisper(5, ...cells));

const regionSumLines = [
  ['R1C5', 'R2C4', 'R3C3', 'R2C3', 'R2C2', 'R3C2', 'R3C1'],
  ['R1C8', 'R1C7', 'R1C6', 'R2C6'],
  ['R3C8', 'R3C9', 'R4C9', 'R5C9'],
  ['R6C6', 'R5C7', 'R6C8'],
  ['R4C4', 'R5C3', 'R4C2'],
  ['R5C1', 'R6C1', 'R7C1', 'R7C2'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R8C4'],
  ['R9C5', 'R8C6', 'R7C7', 'R8C7', 'R8C8', 'R7C8', 'R7C9'],
].map((cells) => new RegionSumLine(...cells));

return [
  new Shape('9x9'),
  ...whispers,
  ...regionSumLines,
];
