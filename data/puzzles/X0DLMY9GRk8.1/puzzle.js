// Title: 4 Crossbows and a Dream
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=X0DLMY9GRk8
// Source: https://sudokupad.app/l5x54tkzdt

// Irregular Sudoku: place 1-6 once each in every row, column, and irregular
// region (six jigsaw regions, no given digits).
//
// Crossbows (Little Killers): a clue outside the grid gives the sum of the
// digits along the indicated diagonal. Digits along a diagonal may repeat.
//
// Region membership (0-indexed row/col as in the decoded source):
//   A: R1C1 R2C1 R2C2 R3C2 R3C3 R3C4
//   B: R1C2 R1C3 R1C4 R1C5 R1C6 R2C6
//   C: R2C3 R2C4 R2C5 R3C5 R4C4 R4C5
//   D: R3C6 R4C6 R5C6 R6C4 R6C5 R6C6
//   E: R5C3 R5C4 R5C5 R6C1 R6C2 R6C3
//   F: R3C1 R4C1 R4C2 R4C3 R5C1 R5C2
//
// The four diagonal clues (cornerCell is the on-grid cell where the
// diagonal starts and the direction is implied by the solver's canonical
// diagonal map for this shape):
//   22 from R1C1: R1C1 R2C2 R3C3 R4C4 R5C5 R6C6 (main diagonal)
//   17 from R1C6: R1C6 R2C5 R3C4 R4C3 R5C2 R6C1 (anti-diagonal)
//   15 from R1C4: R1C4 R2C3 R3C2 R4C1 (4 cells)
//   15 from R4C6: R4C6 R3C5 R2C4 R1C3 (4 cells)

return [
  new Shape('6x6'),
  new NoBoxes(),

  new Jigsaw('6x6', 'R1C1', 'R2C1', 'R2C2', 'R3C2', 'R3C3', 'R3C4'),
  new Jigsaw('6x6', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C6'),
  new Jigsaw('6x6', 'R2C3', 'R2C4', 'R2C5', 'R3C5', 'R4C4', 'R4C5'),
  new Jigsaw('6x6', 'R3C6', 'R4C6', 'R5C6', 'R6C4', 'R6C5', 'R6C6'),
  new Jigsaw('6x6', 'R5C3', 'R5C4', 'R5C5', 'R6C1', 'R6C2', 'R6C3'),
  new Jigsaw('6x6', 'R3C1', 'R4C1', 'R4C2', 'R4C3', 'R5C1', 'R5C2'),

  new LittleKiller('R1C1', 22),
  new LittleKiller('R1C6', 17),
  new LittleKiller('R1C4', 15),
  new LittleKiller('R4C6', 15),
];
