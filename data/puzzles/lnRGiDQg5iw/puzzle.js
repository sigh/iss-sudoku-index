// Title: The Puzzle Has Been SET
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=lnRGiDQg5iw
// Source: https://sudokupad.app/kbv0s65hd7

// Standard Sudoku, killer cages, little-killer diagonals, arrows,
// two-cell palindromes, and non-negative white Kropki dots.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

return [
  new Shape('9x9'),

  new Cage(14, 'R5C1', 'R5C2'),
  new Cage(12, 'R1C5', 'R2C5'),
  new Cage(15, 'R8C5', 'R9C5'),
  new Cage(11, 'R5C8', 'R5C9'),

  LittleKiller.fromCells(35, graph.ray('R1C5', 1, 1), geometry),
  LittleKiller.fromCells(43, graph.ray('R9C8', -1, -1), geometry),

  new Arrow('R4C4', 'R3C3', 'R2C2', 'R1C1'),
  new Arrow('R4C6', 'R3C7', 'R2C8', 'R1C9'),
  new Arrow('R6C6', 'R7C7', 'R8C8', 'R9C9'),
  new Arrow('R6C4', 'R7C3', 'R8C2', 'R9C1'),

  new Palindrome('R6C2', 'R7C1'),
  new Palindrome('R3C1', 'R4C2'),
  new Palindrome('R1C3', 'R2C4'),
  new Palindrome('R2C6', 'R1C7'),
  new Palindrome('R4C8', 'R3C9'),
  new Palindrome('R6C8', 'R7C9'),
  new Palindrome('R8C6', 'R9C7'),
  new Palindrome('R8C4', 'R9C3'),

  new WhiteDot('R3C5', 'R3C6'),
  new WhiteDot('R7C4', 'R7C5'),
  new WhiteDot('R9C6', 'R9C7'),
];
