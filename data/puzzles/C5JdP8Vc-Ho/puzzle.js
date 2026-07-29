// Title: Battle of Evermore
// Author: kuraban
// Video: https://www.youtube.com/watch?v=C5JdP8Vc-Ho
// Source: https://sudokupad.app/gPdj8GrQrR

// Standard Sudoku with both marked diagonals all-different and anti-knight.
// Each arrow's arm digits sum to its circled control digit.

return [
  new Shape('9x9'),
  new Diagonal(),
  new AntiKnight(),
  // Arrow circles and arms transcribed from the drawn arrows.
  new Arrow('R4C5', 'R3C4', 'R3C5', 'R3C6'),
  new Arrow('R5C4', 'R4C3', 'R5C3', 'R6C3'),
  new Arrow('R6C5', 'R7C6', 'R7C5', 'R7C4'),
  new Arrow('R5C6', 'R6C7', 'R5C7', 'R4C7'),
  new Arrow('R4C9', 'R5C9', 'R6C9', 'R7C9'),
  new Arrow('R9C1', 'R8C1', 'R7C1'),
];
