// Title: Lockdown
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=NsiGrBiISOs
// Source: https://sudokupad.app/89qx1om0so

// Normal Sudoku. Blue strokes are open region-sum lines, grey strokes are
// palindromes, and green strokes are German whispers (difference at least 5).
const regionSumLines = [
  ['R8C1', 'R7C1', 'R6C2', 'R6C3', 'R7C3', 'R7C4', 'R8C4', 'R9C3', 'R9C2'],
  ['R1C8', 'R1C7', 'R2C6', 'R3C6', 'R3C7', 'R4C7', 'R4C8', 'R3C9', 'R2C9'],
  ['R5C2', 'R5C3', 'R5C4', 'R4C5', 'R3C5', 'R2C5'],
];

const palindromes = [
  ['R2C1', 'R3C1', 'R4C2', 'R4C3'],
  ['R1C2', 'R1C3', 'R2C4', 'R3C4'],
  ['R6C7', 'R6C8', 'R7C9', 'R8C9'],
  ['R7C6', 'R8C6', 'R9C7', 'R9C8'],
];

const whispers = [
  ['R7C5', 'R6C5', 'R5C6', 'R5C7'],
  ['R1C2', 'R2C1'],
];

return [
  new Shape('9x9'),
  new Given('R5C8', 5),
  new Given('R8C5', 3),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  ...palindromes.map(cells => new Palindrome(...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
];
