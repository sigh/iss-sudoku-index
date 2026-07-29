// Title: Easy as a Quattroquadri
// Author: damasosos92
// Video: https://www.youtube.com/watch?v=i4Ru0mdIwsE
// Source: https://sudokupad.app/z7cztf0wsy

// Digits 1-9 do not repeat in rows, columns, or the four outlined regions.
// Black dots are 1:2 ratios; white dots are consecutive. Unmarked adjacencies
// are unrestricted because the rules say not all dots are given.
// Each outside clue is the first 3, 6, or 9 seen from its indicated direction.
// Region cells and dot positions are transcribed from the drawn grid.
const blackDots = [
  ['R2C4', 'R2C5'], ['R1C1', 'R1C2'], ['R3C3', 'R3C4'],
  ['R5C3', 'R5C4'], ['R5C3', 'R6C3'], ['R4C6', 'R5C6'],
  ['R4C1', 'R4C2'],
];
const whiteDots = [
  ['R4C3', 'R4C4'], ['R5C5', 'R5C6'], ['R5C4', 'R6C4'],
  ['R2C2', 'R3C2'], ['R3C5', 'R4C5'], ['R5C2', 'R6C2'],
  ['R1C3', 'R2C3'], ['R4C5', 'R5C5'], ['R4C1', 'R5C1'],
];
// The prefix [124578]* has no 3, 6, or 9, so the following digit is the first
// member of that set; the suffix is otherwise unrestricted.
const first369 = (digit, cells) =>
  new Regex(`[124578]*${digit}.*`, ...cells);

return [
  new Shape('6x6', 9),
  new NoBoxes(),
  new RegionSize(9),
  new Jigsaw('6x6~9', 'R1C1', 'R1C2', 'R2C2', 'R2C3', 'R2C5', 'R3C3', 'R3C4', 'R3C5', 'R4C4'),
  new Jigsaw('6x6~9', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C6', 'R3C6', 'R4C5', 'R4C6'),
  new Jigsaw('6x6~9', 'R2C1', 'R3C1', 'R3C2', 'R4C1', 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R6C3'),
  new Jigsaw('6x6~9', 'R4C2', 'R4C3', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  first369(9, ['R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2']),
  first369(9, ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6']),
  first369(9, ['R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1']),
  first369(3, ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6']),
  first369(3, ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6']),
  first369(6, ['R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1']),
  first369(6, ['R6C6', 'R5C6', 'R4C6', 'R3C6', 'R2C6', 'R1C6']),
  first369(3, ['R6C6', 'R6C5', 'R6C4', 'R6C3', 'R6C2', 'R6C1']),
];
