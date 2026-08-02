// Title: 10/8/23: Parity Lines Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=SuzBgBqaztw
// Source: https://tinyurl.com/2nzkxu37

// Normal Sudoku rules apply. Along each gray line, all digits are odd or all
// digits are even. The drawn paths below are the ten gray line entries.
const sameParityKey = Pair.fnToKey((a, b) => (a % 2) === (b % 2), 9);
const parityLines = [
  ['R2C2', 'R2C3', 'R2C4'],
  ['R8C8', 'R8C7', 'R8C6'],
  ['R5C4', 'R5C3'],
  ['R5C6', 'R5C7'],
  ['R5C9', 'R6C9'],
  ['R4C1', 'R5C1'],
  ['R4C8', 'R3C8', 'R2C8'],
  ['R6C2', 'R7C2', 'R8C2'],
  ['R9C3', 'R9C4'],
  ['R1C7', 'R1C6'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R1C2', 2),
  new Given('R1C3', 3),
  new Given('R1C4', 9),
  new Given('R3C1', 4),
  new Given('R3C2', 5),
  new Given('R3C3', 6),
  new Given('R4C4', 2),
  new Given('R4C5', 3),
  new Given('R4C6', 4),
  new Given('R6C4', 6),
  new Given('R6C5', 7),
  new Given('R6C6', 8),
  new Given('R7C7', 4),
  new Given('R7C8', 5),
  new Given('R7C9', 6),
  new Given('R9C6', 3),
  new Given('R9C7', 7),
  new Given('R9C8', 8),
  new Given('R9C9', 9),
  ...parityLines.map(cells => new Pair(sameParityKey, 'same parity', ...cells)),
];
