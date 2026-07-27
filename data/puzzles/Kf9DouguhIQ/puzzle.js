// Title: BoogieigooW
// Author: Br1312te
// Video: https://www.youtube.com/watch?v=Kf9DouguhIQ
// Source: https://sudokupad.app/6pnb3dipkp

// Normal sudoku rules apply (standard rows/columns/3x3 boxes).
// Grey lines are palindromes: each line reads the same forwards and
// backwards. The fog covering the grid is a solving-UI reveal mechanic
// (metadata cages entry, value "foglight"), not a final-grid rule, and is
// intentionally not encoded.

const PALINDROMES = [
  // Provenance: the puzzle's 15 drawn grey lines.
  ['R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8'],
  ['R4C5', 'R3C6', 'R2C7', 'R1C8'],
  ['R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'],
  ['R1C3', 'R2C4', 'R3C5'],
  ['R1C2', 'R2C3', 'R3C4'],
  ['R1C7', 'R2C6'],
  ['R3C9', 'R4C8'],
  ['R3C3', 'R4C4'],
  ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8'],
  ['R2C1', 'R3C2', 'R4C3'],
  ['R6C3', 'R7C4'],
  ['R8C4', 'R7C3', 'R6C2', 'R5C1'],
  ['R6C1', 'R7C2', 'R8C3'],
  ['R8C7', 'R9C6'],
  ['R6C9', 'R7C8'],
];

return [
  new Shape('9x9'),

  // Provenance: the puzzle's 9 given digits.
  new Given('R7C7', 2),
  new Given('R7C8', 9),
  new Given('R7C9', 4),
  new Given('R8C7', 7),
  new Given('R8C9', 3),
  new Given('R9C1', 5),
  new Given('R9C7', 6),
  new Given('R9C8', 1),
  new Given('R9C9', 8),

  ...PALINDROMES.map(line => new Palindrome(...line)),
];
