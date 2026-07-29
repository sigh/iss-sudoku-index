// Title: Gold
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=TLDIcF6IXDk
// Source: https://sudokupad.app/r00yffw1w7

// Normal Sudoku. Purple arrows have a circle digit equal to the sum of their arm.
// Cages sum to their shown totals without repeats. Grey lines are palindromes.
// Arrow and cage coordinates are transcribed from the drawn purple circles, shafts,
// and dashed cage outlines; grey-line coordinates are transcribed from grey strokes.
return [
  new Shape('9x9'),
  new Arrow('R1C3', 'R2C2', 'R3C1'),
  new Arrow('R4C3', 'R3C2', 'R2C1'),
  new Arrow('R4C4', 'R3C5', 'R2C6'),
  new Arrow('R1C4', 'R2C5', 'R3C6'),
  new Arrow('R5C1', 'R6C2', 'R6C3', 'R5C4'),
  new Arrow('R7C1', 'R7C2', 'R7C3', 'R8C3'),
  new Arrow('R7C6', 'R8C5', 'R9C5'),
  new Arrow('R7C6', 'R6C6', 'R5C7'),
  new Cage(15, 'R2C7', 'R2C8', 'R2C9'),
  new Cage(9, 'R6C8', 'R7C8'),
  new Cage(16, 'R7C7', 'R8C7', 'R8C6'),
  new Cage(14, 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new Cage(15, 'R5C4', 'R6C4', 'R7C4'),
  new Palindrome('R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9'),
  new Palindrome('R4C7', 'R3C8'),
  new Palindrome('R6C7', 'R7C8'),
];
