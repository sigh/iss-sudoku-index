// Title: Aug. 18, 23: Palindrome Killer
// Author: clover!
// Video: https://www.youtube.com/watch?v=HF8Eoa2PL-o
// Source: https://tinyurl.com/3wvv6nhy

// Normal sudoku rules apply (standard rows/columns/boxes, no givens).
// Killer cages: digits in each cage do not repeat and sum to the shown total.
// Gray lines are palindromes: the digit sequence along each line reads the
// same forwards and backwards.

// Cage cells and totals transcribed from the killercage array.
const cages = [
  [7, 'R1C7', 'R1C8'],
  [3, 'R2C1', 'R2C2'],
  [17, 'R2C5', 'R2C6'],
  [4, 'R3C3', 'R3C4'],
  [12, 'R3C8', 'R3C9'],
  [5, 'R4C5', 'R4C6'],
  [7, 'R5C2', 'R5C3'],
  [7, 'R5C7', 'R5C8'],
  [5, 'R6C4', 'R6C5'],
  [15, 'R7C1', 'R7C2'],
  [7, 'R7C6', 'R7C7'],
  [17, 'R8C4', 'R8C5'],
  [12, 'R8C8', 'R8C9'],
  [12, 'R9C2', 'R9C3'],
];

// Palindrome line cells transcribed from the palindrome array.
const palindromeLines = [
  ['R2C2', 'R2C3', 'R3C4', 'R3C5', 'R4C6', 'R4C7', 'R5C8', 'R5C9'],
  ['R8C8', 'R8C7', 'R7C6', 'R7C5', 'R6C4', 'R6C3', 'R5C2', 'R5C1'],
  ['R3C8', 'R3C7', 'R2C6', 'R2C5'],
  ['R7C2', 'R7C3', 'R8C4', 'R8C5'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...palindromeLines.map((cells) => new Palindrome(...cells)),
];
