// Title: Zip-a-Dee-Doo-Dah
// Author: gdc
// Video: https://www.youtube.com/watch?v=ZQQVOn0_w18
// Source: https://sudokupad.app/co8u58tluq

// Standard Sudoku rules apply. Digits on both marked diagonals may not repeat.
// Each lavender zipper line has equal-distance digit pairs summing to its centre.
// The six literal paths are transcribed from the lavender lines in the source art.
return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  new Zipper('R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R8C3'),
  new Zipper('R2C5', 'R1C5', 'R1C6'),
  new Zipper('R4C5', 'R4C6', 'R5C6', 'R5C5', 'R5C4', 'R6C4', 'R6C5'),
  new Zipper('R1C8', 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R2C8', 'R2C9'),
  new Zipper('R4C1', 'R3C1', 'R2C1', 'R1C1', 'R2C2', 'R3C3', 'R4C3'),
  new Zipper('R7C7', 'R8C8', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6'),
];
