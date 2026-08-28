// Title: Fantastic Mr Fox
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=z12MyKk_zro
// Source: https://cracking-the-cryptic.web.app/sudoku/BHMGttM449

// Standard sudoku (rows, columns, boxes) plus digits 1-9 on both main
// diagonals (Diagonal, direction -1 for top-left/bottom-right, direction 1
// for top-right/bottom-left) and seven thermometers (Thermo, bulb cell
// first) that increase away from the bulb.

return [
  new Shape('9x9'),

  new Diagonal(-1),
  new Diagonal(1),

  new Thermo('R1C1', 'R2C1', 'R3C1', 'R4C1'),
  new Thermo('R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'),
  new Thermo('R2C4', 'R2C5', 'R2C6', 'R2C7'),
  new Thermo('R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'),
  new Thermo('R6C5', 'R7C4'),
  new Thermo('R9C1', 'R8C1', 'R7C1', 'R6C1'),
  new Thermo('R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'),
];
