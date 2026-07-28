// Title: Prime Loop
// Author: Klausku
// Video: https://www.youtube.com/watch?v=Qsaxs3C2PmA
// Source: https://sudokupad.app/nD8BMGnhbJ

// Normal Sudoku and the drawn killer cages are encoded. The unknown looping
// Region Sum Line (including its prime cells, diagonal movement, equal box
// segments, box coverage, and cage avoidance) is omitted from this partial model.
// Cage cells and totals are transcribed from the drawn cage data.
const cages = [
  new Cage(21, 'R1C1', 'R2C1', 'R3C1', 'R4C1'),
  new Cage(10, 'R3C3', 'R4C3', 'R4C4'),
  new Cage(9, 'R3C5', 'R4C5'),
  new Cage(15, 'R3C6', 'R3C7'),
  new Cage(4, 'R5C5', 'R6C5'),
  new Cage(7, 'R5C8', 'R6C8'),
  new Cage(20, 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'),
  new AllDifferent('R8C4', 'R8C5', 'R8C6'),
];

return [
  new Shape('9x9'),
  ...cages,
];
