// Title: Angular Arrows
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=GVigUFcWOf4
// Source: https://sudokupad.app/p2qL4hj8DG

// Normal Sudoku; each of the two drawn blue main diagonals has no repeated digit.
// Each light-grey arrow's arm digits sum to its circled first cell.
// Givens are transcribed from the four filled grid cells.
return [
  new Shape('9x9'),
  new Given('R5C1', 4),
  new Given('R5C2', 5),
  new Given('R8C6', 9),
  new Given('R9C9', 1),
  new Diagonal(1),
  new Diagonal(-1),
  new Arrow('R2C2', 'R2C1', 'R1C1', 'R1C2'),
  new Arrow('R4C4', 'R4C3', 'R3C3', 'R3C4'),
  new Arrow('R2C8', 'R1C8', 'R1C9', 'R2C9'),
  new Arrow('R4C6', 'R3C6', 'R3C7', 'R4C7'),
  new Arrow('R6C4', 'R7C4', 'R7C3', 'R6C3'),
  new Arrow('R6C6', 'R6C7', 'R7C7', 'R7C6'),
  new Arrow('R8C2', 'R9C2', 'R9C1', 'R8C1'),
  new Arrow('R8C8', 'R8C9', 'R9C9', 'R9C8'),
];
