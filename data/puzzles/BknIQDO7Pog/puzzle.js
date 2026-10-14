// Title: Odd Blockade Runners 3
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=BknIQDO7Pog
// Source: https://sudokupad.app/h57xhdfzi8

// Normal Sudoku; odd digits form one orthogonally connected region.
// A circled digit counts its occurrences among all circles.
// The < between R2C4 and R2C5 points to the smaller digit.

// Cell-centred circles drawn on the grid.
const circles = [
  "R1C6",
  "R2C6",
  "R2C5",
  "R2C4",
  "R3C4",
  "R3C5",
  "R3C6",
  "R2C7",
  "R2C8",
  "R3C8",
  "R2C3",
  "R3C2",
  "R4C3",
  "R4C4",
  "R5C4",
  "R5C3",
  "R6C3",
  "R6C4",
  "R4C5",
  "R5C5",
  "R6C5",
  "R6C6",
  "R4C6",
  "R6C7",
  "R7C7",
  "R8C7",
  "R8C8",
  "R8C9",
  "R9C9",
  "R8C6",
  "R9C6",
  "R7C6",
  "R7C5",
  "R8C5",
  "R8C4",
  "R9C4",
  "R9C5",
  "R7C3",
  "R8C2",
  "R9C1",
  "R9C3",
  "R6C8",
  "R4C7",
  "R4C2"
];

return [
  new Shape('9x9'),
  new ConnectedValues('', [1, 3, 5, 7, 9]),
  new CountingCircles(...circles),
  new GreaterThan('R2C5', 'R2C4'),
];
