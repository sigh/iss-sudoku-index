// Title: March of the Palindromes
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=DqaEEPItN1g
// Source: https://app.crackingthecryptic.com/68jb7y05c9

// Normal Sudoku. The cyan anti-diagonal has no repeated digit; black dots are 1:2.
// Pale-grey lines are palindromes. Outside clues are sums along their drawn diagonals.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),
  new Diagonal(1),

  // The four black dots drawn between adjacent cells.
  new BlackDot('R1C4', 'R1C5'),
  new BlackDot('R2C8', 'R2C9'),
  new BlackDot('R5C9', 'R6C9'),
  new BlackDot('R9C4', 'R9C5'),

  // The three drawn outside diagonal sums.
  LittleKiller.fromCells(15, graph.ray('R3C1', -1, 1), geometry),
  LittleKiller.fromCells(16, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(15, graph.ray('R9C3', -1, -1), geometry),

  // The fourteen separately drawn pale-grey palindrome lines.
  new Palindrome('R2C7', 'R3C8', 'R4C9'),
  new Palindrome('R2C6', 'R3C7', 'R4C8'),
  new Palindrome('R2C5', 'R3C6', 'R4C7', 'R5C8'),
  new Palindrome('R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8'),
  new Palindrome('R2C3', 'R3C4', 'R4C5'),
  new Palindrome('R2C2', 'R3C3', 'R4C4'),
  new Palindrome('R3C2', 'R4C3', 'R5C4'),
  new Palindrome('R4C2', 'R5C3', 'R6C4', 'R7C5', 'R8C6'),
  new Palindrome('R5C2', 'R6C3', 'R7C4', 'R8C5'),
  new Palindrome('R6C2', 'R7C3', 'R8C4'),
  new Palindrome('R6C1', 'R7C2', 'R8C3'),
  new Palindrome('R6C5', 'R7C6', 'R8C7'),
  new Palindrome('R6C6', 'R7C7', 'R8C8'),
  new Palindrome('R5C6', 'R6C7', 'R7C8'),
];
