// Title: Nov. 22, 2022: Palindrome
// Author: clover!
// Video: https://www.youtube.com/watch?v=y6tGf209-FU
// Source: https://tinyurl.com/mrx3bnkf

// Normal sudoku rules apply (standard 3x3 boxes, no jigsaw). Digits along
// each gray line form a palindrome (read the same forwards and backwards);
// Palindrome(...) treats the line symmetrically, so waypoint direction does
// not matter.

const givens = [
  ['R1C1', 1], ['R1C2', 2], ['R1C3', 3], ['R1C7', 4], ['R1C8', 5], ['R1C9', 6],
  ['R2C1', 8], ['R2C9', 2],
  ['R3C1', 9], ['R3C9', 1],
  ['R4C5', 1],
  ['R5C4', 2], ['R5C6', 6],
  ['R6C5', 7],
  ['R7C1', 7], ['R7C9', 8],
  ['R8C1', 6], ['R8C9', 9],
  ['R9C1', 2], ['R9C2', 3], ['R9C3', 4], ['R9C7', 5], ['R9C8', 6], ['R9C9', 7],
];

// Cell paths from the drawn palindrome lines.
const palindromes = [
  ['R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C7', 'R4C7', 'R5C6'],
  ['R6C5', 'R7C6', 'R7C7', 'R7C8', 'R6C9', 'R5C9', 'R4C9', 'R3C8'],
  ['R5C4', 'R6C3', 'R7C3', 'R8C3', 'R9C4', 'R9C5', 'R9C6', 'R8C7'],
  ['R4C5', 'R3C4', 'R3C3', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...palindromes.map((cells) => new Palindrome(...cells)),
];
