// Title: Polygons
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=brC06xfMLyc
// Source: https://app.crackingthecryptic.com/NRqTD93pf7

// Standard Sudoku applies. Orange loops are whispers with adjacent digits
// differing by at least four, including the closing edge. Blue loops have equal
// sums in each segment separated by a 3x3 box border. Cages have distinct digits
// summing to their shown totals.
const orangeLoops = [
  ['R3C8', 'R3C9', 'R4C9', 'R4C8', 'R3C8'],
  ['R5C7', 'R6C6', 'R7C6', 'R7C7', 'R6C8', 'R5C7'],
  ['R1C8', 'R2C8', 'R1C9', 'R1C8'],
  ['R7C1', 'R8C1', 'R8C2', 'R7C3', 'R6C2', 'R7C1'],
  ['R4C1', 'R5C1', 'R5C2', 'R4C2', 'R4C1'],
  ['R2C2', 'R3C1', 'R2C1', 'R2C2'],
];

// Drawn blue-line cells; the closing repeat is omitted because RegionSumLine
// partitions consecutive visits to boxes rather than sequential line edges. The
// last loop is rotated so its one left-box segment does not straddle the list ends.
const blueLoops = [
  ['R8C6', 'R9C6', 'R9C7', 'R8C7'],
  ['R3C6', 'R4C5', 'R5C5', 'R5C6', 'R4C7'],
  ['R1C6', 'R2C6', 'R1C7'],
  ['R8C3', 'R9C3', 'R9C4', 'R8C5', 'R7C4'],
  ['R4C3', 'R5C3', 'R5C4', 'R4C4'],
  ['R2C4', 'R3C3', 'R2C3'],
];

// Cage cell tables are transcribed from the drawn cage data.
return [
  new Shape('9x9'),
  ...orangeLoops.map(cells => new Whisper(4, ...cells)),
  ...blueLoops.map(cells => new RegionSumLine(...cells)),
  new Cage(18, 'R8C6', 'R8C7', 'R9C6', 'R9C7'),
  new Cage(24, 'R4C3', 'R4C4', 'R5C3', 'R5C4'),
  new Cage(17, 'R4C1', 'R4C2', 'R5C1', 'R5C2'),
  new Cage(23, 'R3C8', 'R3C9', 'R4C8', 'R4C9'),
];
