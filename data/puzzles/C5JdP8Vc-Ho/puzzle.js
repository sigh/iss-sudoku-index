// Title: Battle of Evermore
// Author: kuraban
// Video: https://www.youtube.com/watch?v=C5JdP8Vc-Ho
// Source: https://sudokupad.app/gPdj8GrQrR

// Normal sudoku rules apply.
// Along a marked diagonal, digits cannot repeat.
// Digits along an arrow sum to the digit in that arrow's circle.
// Cells separated by a single knight's move cannot contain the same digit.

return [
  new Shape('9x9'),
  // Two diagonals are marked, drawn corner-to-corner in the same colour:
  // R1C1-R9C9 and R1C9-R9C1. Direction -1 selects R1C1-R9C9, +1 selects
  // R1C9-R9C1.
  new Diagonal(-1),
  new Diagonal(1),
  new AntiKnight(),
  // Circle cell first, then the arm cells in drawn order, transcribed from the
  // six drawn arrows and their bulb circles.
  new Arrow('R4C5', 'R3C4', 'R3C5', 'R3C6'),
  new Arrow('R5C4', 'R4C3', 'R5C3', 'R6C3'),
  new Arrow('R6C5', 'R7C6', 'R7C5', 'R7C4'),
  new Arrow('R5C6', 'R6C7', 'R5C7', 'R4C7'),
  new Arrow('R4C9', 'R5C9', 'R6C9', 'R7C9'),
  new Arrow('R9C1', 'R8C1', 'R7C1'),
];
