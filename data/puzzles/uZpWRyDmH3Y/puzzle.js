// Title: Satellite
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=uZpWRyDmH3Y
// Source: https://sudokupad.app/btl00ki232

// Normal Sudoku. On each colour independently, every digit present on that
// colour's lines equals its total number of appearances there. Green lines are
// German whispers, red lines alternate parity, and blue lines have equal sums
// in each box segment. No rules are omitted.

const greenLines = [
  ['R7C6', 'R7C7', 'R6C7'],
  ['R4C3', 'R3C3', 'R3C4'],
  ['R5C5', 'R6C6'],
  ['R7C3', 'R8C2'],
  ['R2C8', 'R3C7'],
  ['R1C1', 'R2C2'],
];
const redLines = [
  ['R8C9', 'R9C8'],
  ['R1C2', 'R2C1'],
  ['R7C5', 'R7C4', 'R6C3', 'R6C2'],
  ['R4C8', 'R4C7', 'R3C6', 'R3C5'],
  ['R5C6', 'R6C5'],
  ['R7C2', 'R8C3'],
];
const blueLines = [
  ['R8C5', 'R9C6', 'R8C7', 'R8C8', 'R7C8', 'R6C9', 'R5C9'],
  ['R5C2', 'R4C1', 'R3C2', 'R2C3', 'R1C4', 'R2C5'],
];

const parityKey = Pair.fnToKey((a, b) => a % 2 !== b % 2, 9);

return [
  new Shape('9x9'),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  ...redLines.map(cells => new Pair(parityKey, 'parity', ...cells)),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
  new CountingCircles(...greenLines.flat()),
  new CountingCircles(...redLines.flat()),
  new CountingCircles(...blueLines.flat()),
];
