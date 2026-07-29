// Title: Thermo Sum Lines
// Author: Jobo
// Video: https://www.youtube.com/watch?v=uJrJd_TpGA4
// Source: https://sudokupad.app/HGGjr3NDm4

// Normal Sudoku rules apply. Each blue, grey-bulbed path is a slow thermometer
// from its bulb and a region sum line. White dots mark consecutive digits; no
// negative-dot rule is stated.
const lines = [
  ['R8C2', 'R7C3', 'R6C4'], ['R6C2', 'R5C3', 'R4C4'],
  ['R5C2', 'R4C3', 'R3C4'], ['R8C8', 'R7C7', 'R6C6'],
  ['R6C8', 'R5C7', 'R4C6'], ['R5C8', 'R4C7', 'R3C6'],
  ['R4C2', 'R3C3', 'R2C4'], ['R7C2', 'R6C3', 'R5C4'],
  ['R7C8', 'R6C7', 'R5C6'], ['R4C8', 'R3C7', 'R2C6'],
];
const slow = Pair.fnToKey((a, b) => a <= b, 9);

return [
  new Shape('9x9'),
  new Given('R3C2', 2), new Given('R3C5', 3), new Given('R3C8', 4),
  ...lines.flatMap(line => [
    new Pair(slow, 'slow thermometer', ...line),
    new RegionSumLine(...line),
  ]),
  new WhiteDot('R7C5', 'R8C5'),
  new WhiteDot('R8C4', 'R9C4'),
  new WhiteDot('R8C6', 'R9C6'),
];
