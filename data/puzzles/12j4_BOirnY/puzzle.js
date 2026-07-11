// Title: Starburst
// Author: Blobz
// Video: https://www.youtube.com/watch?v=12j4_BOirnY
// Source: https://sudokupad.app/blobz/starburst

// Normal sudoku rules apply.
//
// Along SLOW thermometers, digits either stay the same or increase as they
// move away from the bulb. ISS's built-in Thermo is strictly increasing, so
// each thermometer is instead encoded as a chain of Pair relations (bulb
// first) requiring the next cell to be >= the previous one.
//
// Along green lines, adjacent digits differ by at least 5 (Whisper).

const slow = Pair.fnToKey((a, b) => b >= a, 9);

const thermos = [
  ['R4C4', 'R3C3', 'R2C2', 'R1C1'],
  ['R4C5', 'R3C5', 'R2C5', 'R1C5'],
  ['R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R5C6', 'R5C7', 'R5C8'],
  ['R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R6C4', 'R7C3', 'R8C2'],
  ['R5C4', 'R5C3', 'R5C2', 'R5C1'],
];

const greenLines = [
  ['R1C8', 'R2C7', 'R3C6', 'R2C6', 'R1C6'],
  ['R1C2', 'R2C3', 'R3C4', 'R2C4'],
  ['R8C4', 'R7C4', 'R8C3', 'R9C2'],
  ['R8C6', 'R7C6', 'R8C7', 'R9C8'],
  ['R3C8', 'R4C7'],
  ['R6C7', 'R6C8'],
  ['R2C1', 'R3C2'],
  ['R3C1', 'R4C2', 'R5C3'],
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Pair(slow, 'Slow thermometer', ...cells)),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
];
