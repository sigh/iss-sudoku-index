// Title: Killer Palindrome
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=4bMPPBWfs0U
// Source: https://cracking-the-cryptic.web.app/sudoku/9t79479dLj

// Normal sudoku rules apply on the default 9x9 grid (rows/columns/3x3 boxes).
// No given digits.
//
// Cages: the printed corner total is the sum of the cage's digits, which do
// not repeat within the cage (Cage: distinct + sum).
//
// Lines (grey): palindromes -- the digits read the same in each direction
// (Palindrome).

// Killer cages, transcribed from the payload's cages array (corner cell
// first, total, drawn dashed outline).
const cages = [
  [35, 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R3C1', 'R4C1'],
  [25, 'R2C2', 'R2C3', 'R3C2', 'R3C3'],
  [13, 'R2C4', 'R2C5'],
  [15, 'R3C4', 'R4C3', 'R4C4'],
  [13, 'R4C2', 'R5C2'],
  [4, 'R5C3', 'R6C3'],
  [4, 'R3C5', 'R3C6'],
  [9, 'R2C7', 'R2C8'],
  [17, 'R3C8', 'R4C7', 'R4C8'],
  [8, 'R4C6', 'R5C6'],
  [8, 'R6C4', 'R6C5'],
  [8, 'R7C4', 'R8C3', 'R8C4'],
  [11, 'R7C2', 'R8C2'],
  [15, 'R8C8', 'R8C9'],
  [15, 'R9C8', 'R9C9'],
];

// Grey palindrome lines, transcribed from the payload's lines array
// (waypoint order as drawn).
const palindromes = [
  ['R1C6', 'R2C7', 'R3C8'],
  ['R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C8'],
  ['R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R8C6'],
  ['R6C1', 'R7C2', 'R8C3'],
];

return [
  new Shape('9x9'),

  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),

  ...palindromes.map(cells => new Palindrome(...cells)),
];
