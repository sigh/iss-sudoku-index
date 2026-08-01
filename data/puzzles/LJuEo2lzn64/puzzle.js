// Title: Miami Zipper
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=LJuEo2lzn64
// Source: https://sudokupad.app/cedvkcdyrb

// Normal Sudoku rules apply. Purple lines are zippers: equally distant digits
// sum to the centre digit. The listed paths are transcribed from the purple lines.
return [
  new Shape('9x9'),
  new Given('R5C5', 3),
  new Given('R6C8', 3),
  new Zipper('R8C1', 'R9C1', 'R9C2', 'R8C2', 'R7C2'),
  new Zipper('R7C8', 'R8C8', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9'),
  new Zipper('R5C4', 'R5C3', 'R4C2', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R6C2', 'R7C3', 'R7C4', 'R6C5', 'R5C6', 'R5C7'),
  new Zipper('R1C3', 'R2C3', 'R3C3', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R3C7', 'R2C7', 'R1C7'),
  new Zipper('R1C6', 'R2C6', 'R1C5', 'R2C5', 'R2C4', 'R3C5', 'R3C4'),
  new Zipper('R8C5', 'R9C5', 'R8C6'),
];
