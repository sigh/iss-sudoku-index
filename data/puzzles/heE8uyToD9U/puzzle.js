// Title: Ten-Oh
// Author: Qodec
// Video: https://www.youtube.com/watch?v=heE8uyToD9U
// Source: https://app.crackingthecryptic.com/sudoku/b8qfQH4qQ3

// Normal sudoku rules (default 9x9 boxes). Each drawn grey line partitions,
// in path order, into one or more contiguous non-overlapping groups of
// cells, each summing to 10; digits may repeat freely along a line and
// within a sum -- no extra distinctness beyond the usual row/column/box
// rules applies. This is exactly SumLine(10, ...): a line divides into
// segments that each sum to the given total. Four of the twelve drawn
// lines close into loops (their first and last cell are adjacent, closing
// the stroke into a cycle); those get the 'LOOP' marker, which tells
// SumLine the partition wraps cyclically instead of starting a fresh
// segment at cell 0.

const loopA = [
  'R3C1', 'R3C2', 'R3C3', 'R4C2', 'R4C3',
  'R3C4', 'R4C4', 'R5C3', 'R5C2', 'R4C1',
];
const loopB = [
  'R3C7', 'R3C8', 'R3C9', 'R4C9', 'R5C8',
  'R5C7', 'R4C6', 'R3C6', 'R4C7', 'R4C8',
];
const loopC = ['R8C6', 'R7C7', 'R8C8', 'R9C7'];
const loopD = ['R5C4', 'R4C5', 'R5C6', 'R5C5'];

const openLines = [
  ['R1C1', 'R2C1'],
  ['R5C1', 'R6C1'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2'],
  ['R2C5', 'R3C5'],
  ['R6C2', 'R7C3'],
  ['R2C7', 'R1C8', 'R1C9'],
  ['R5C9', 'R6C9'],
  ['R7C8', 'R7C9'],
];

return [
  new Shape('9x9'),
  new SumLine(10, ...loopA, 'LOOP'),
  new SumLine(10, ...loopB, 'LOOP'),
  new SumLine(10, ...loopC, 'LOOP'),
  new SumLine(10, ...loopD, 'LOOP'),
  ...openLines.map(cells => new SumLine(10, ...cells)),
];
