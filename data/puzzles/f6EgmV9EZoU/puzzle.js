// Title: Clasp Locker
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=f6EgmV9EZoU
// Source: https://sudokupad.app/ykl7sztkdv

// Normal Sudoku rules apply.  Purple lines are zippers: digits equally distant
// from the circled centre sum to the centre digit.  The cell lists follow the
// five drawn purple lines from one end to the other.
const zippers = [
  new Zipper('R2C5', 'R1C5', 'R1C4', 'R1C3', 'R2C3', 'R3C3', 'R4C3', 'R4C4', 'R5C4', 'R6C4', 'R7C4'),
  new Zipper('R4C5', 'R4C6', 'R5C7', 'R6C8', 'R6C9', 'R5C9', 'R4C8', 'R3C7', 'R2C7'),
  new Zipper('R7C2', 'R6C2', 'R5C2', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2'),
  new Zipper('R9C8', 'R9C9', 'R8C9', 'R7C9', 'R7C8'),
  new Zipper('R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2'),
];

// The givens are the three digits printed in the grid.
return [
  new Shape('9x9'),
  new Given('R1C7', 3),
  new Given('R4C7', 7),
  new Given('R5C8', 4),
  ...zippers,
];
