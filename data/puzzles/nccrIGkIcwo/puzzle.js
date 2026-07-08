// Title: Come Clarity
// Author: DarthSillious72
// Video: https://www.youtube.com/watch?v=nccrIGkIcwo
// Source: https://sudokupad.app/avw3cs3lro

// Normal Sudoku. Killer cages: digits distinct, sum to the top-left total (Cage).
// Gray lines read the same from both ends (Palindrome). Blue lines are split into
// segments by box borders; every segment of a line shares the same sum
// (RegionSumLine).

const cages = [
  [5, 'R1C1', 'R2C1'],
  [13, 'R1C4', 'R2C4'],
  [7, 'R1C3', 'R2C3'],
  [14, 'R5C1', 'R5C2'],
  [11, 'R6C8', 'R6C9'],
  [7, 'R7C8', 'R7C9'],
  [7, 'R7C6', 'R8C6'],
  [7, 'R9C8', 'R9C9'],
];

const palindromes = [
  ['R7C1', 'R6C1', 'R6C2'],
  ['R9C3', 'R9C4', 'R8C4'],
  ['R3C6', 'R2C6', 'R2C7'],
  ['R4C7', 'R4C8', 'R3C8'],
  ['R6C5', 'R7C5', 'R7C4'],
];

const regionSumLines = [
  ['R8C1', 'R7C1', 'R6C2', 'R6C3', 'R5C4', 'R4C4', 'R3C5', 'R3C6', 'R4C6'],
  // Decode over-extended this line by one cell to R3C6 (it converges with the
  // line above there); that lone box segment breaks the equal sum, so it starts at R2C7.
  ['R2C7', 'R1C7', 'R1C6', 'R1C5'],
  ['R9C2', 'R9C3', 'R8C4', 'R7C4', 'R6C5', 'R6C6', 'R5C7', 'R4C7', 'R3C8', 'R3C9', 'R4C9', 'R5C9'],
  ['R3C3', 'R3C2', 'R4C1', 'R5C1'],
  ['R9C5', 'R9C6', 'R8C7', 'R7C7'],
];

return [
  new Shape('9x9'),
  new Given('R4C6', 5),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...palindromes.map((cells) => new Palindrome(...cells)),
  ...regionSumLines.map((cells) => new RegionSumLine(...cells)),
];
