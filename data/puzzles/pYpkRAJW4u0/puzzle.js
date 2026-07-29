// Title: A Bit Of A Stretch
// Author: gdc
// Video: https://www.youtube.com/watch?v=pYpkRAJW4u0
// Source: https://sudokupad.app/4swipiexba

// Normal Sudoku rules apply. On each purple zipper line, cells equally distant
// from the circled center sum to its center digit. The paths below are transcribed
// from the six drawn purple lines; each middle cell is the drawn circle.
return [
  new Shape('9x9'),
  new Zipper('R1C5', 'R2C5', 'R3C5', 'R4C4', 'R4C3', 'R3C2', 'R3C1'),
  new Zipper('R7C5', 'R8C5', 'R9C5', 'R9C4', 'R9C3', 'R8C3', 'R7C3'),
  new Zipper('R4C1', 'R5C1', 'R6C1', 'R7C2', 'R6C3', 'R5C3', 'R5C4'),
  new Zipper('R1C6', 'R2C6', 'R3C6', 'R4C7', 'R5C8', 'R5C9', 'R6C9'),
  new Zipper('R8C9', 'R7C8', 'R7C7', 'R8C7', 'R9C8'),
  new Zipper('R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9'),
];
