// Title: Phantom Locker
// Author: Sumanta (Anu)
// Video: https://www.youtube.com/watch?v=btdLnB9PXuY
// Source: https://sudokupad.app/dwz5f8ntmd

// Normal sudoku rules apply. No given digits.
//
// One killer cage carries no total, so it only enforces distinctness within
// itself. Three thermometers increase from the bulb. Three green lines
// require neighbouring digits to differ by >= 5 (Whisper). Two grey lines
// are palindromes.

// Cage with no total: distinct digits only (killer-cage adjacency, no sum).
const cage = ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R5C3'];

const thermos = [
  ['R8C6', 'R9C7', 'R9C8', 'R8C9'],
  ['R1C3', 'R2C3', 'R3C3', 'R4C4', 'R4C5'],
  ['R3C1', 'R2C1', 'R2C2', 'R1C2'],
];

// Green lines: neighbouring digits differ by >= 5.
const whispers = [
  ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R6C2', 'R7C2', 'R8C2', 'R9C2'],
  ['R1C9', 'R2C8', 'R3C9', 'R4C8', 'R5C9'],
  ['R3C6', 'R2C5'],
];

// Grey (non-thermometer) lines: palindromes.
const palindromes = [
  ['R5C4', 'R5C5', 'R5C6', 'R6C7', 'R6C8', 'R6C9'],
  ['R7C5', 'R7C6', 'R8C7', 'R8C8'],
];

return [
  new Shape('9x9'),
  new AllDifferent(...cage),
  ...thermos.map(cells => new Thermo(...cells)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...palindromes.map(cells => new Palindrome(...cells)),
];
