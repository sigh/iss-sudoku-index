// Title: Carefully Balanced Weights and Measures
// Author: HalfBakedLunatic (aka David Workman)
// Video: https://www.youtube.com/watch?v=CaCAZhVcovA
// Source: https://sudokupad.app/qlc2250o3w

// Box borders split each blue line into equal-sum segments.
const regionSumLines = [
  ['R3C1', 'R3C2', 'R2C2', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R1C4', 'R1C5', 'R2C4', 'R2C5', 'R3C4', 'R3C5'],
  ['R4C4', 'R5C5', 'R5C4', 'R6C3', 'R5C3', 'R4C2'],
  ['R7C4', 'R7C5', 'R8C5', 'R7C6', 'R8C6', 'R9C5', 'R8C4', 'R7C3', 'R8C2', 'R9C2', 'R9C1'],
  ['R4C6', 'R5C6', 'R6C6', 'R5C7', 'R6C7', 'R5C8'],
  ['R4C5', 'R3C6', 'R2C6', 'R3C7', 'R3C8'],
  ['R1C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C8', 'R6C9'],
  ['R8C1', 'R7C1', 'R7C2', 'R6C2'],
].map(cells => new RegionSumLine(...cells));

const palindromeLines = [
  ['R3C1', 'R3C2', 'R2C2', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R1C4', 'R1C5', 'R2C4', 'R2C5', 'R3C4', 'R3C5', 'R4C4', 'R5C5', 'R5C4'],
  ['R4C2', 'R5C3', 'R6C3', 'R7C4', 'R7C5', 'R8C5'],
  ['R8C4', 'R9C5', 'R8C6', 'R7C6', 'R6C7', 'R5C7', 'R6C6', 'R5C6'],
  ['R9C2', 'R8C2', 'R7C3', 'R6C2', 'R5C1', 'R6C1'],
  ['R4C6', 'R4C5', 'R3C6', 'R2C6', 'R1C6', 'R2C7', 'R1C7', 'R1C8', 'R2C9', 'R1C9'],
  ['R7C8', 'R7C7', 'R8C8', 'R7C9', 'R6C8', 'R5C9', 'R4C9', 'R3C9'],
].map(cells => new Palindrome(...cells));

return [
  new Shape('9x9'),
  new Given('R2C8', 9),
  new Given('R8C3', 6),
  new Given('R9C9', 4),
  ...regionSumLines,
  ...palindromeLines,
];
