// Title: February "2nd", 2023:Renthermo
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=iRkA0we43Og
// Source: https://tinyurl.com/ysbr8tyd

// Normal sudoku: rows, columns, and the nine 3x3 boxes (no custom regions
// drawn in the payload) each contain 1-9 once.
// Thermo: digits along a line strictly increase from the bulb (circle) to
// the tip, and every thermo is a run of consecutive digits. Encoded as
// Thermo (bulb-to-tip increasing order) plus Renban (consecutive set) on the
// same cells: together they force each step along the line to be exactly +1.
// Circles mark the bulb end of each thermo. One drawn line runs tip-to-bulb
// (its circle sits on the cell listed last in the source), so its cells are
// reordered bulb-first below: R9C4, R8C4, R7C4, R6C4.

return [
  new Shape('9x9'),

  new Given('R1C5', 3),
  new Given('R2C1', 2),
  new Given('R4C7', 3),
  new Given('R5C5', 9),
  new Given('R6C3', 2),
  new Given('R8C9', 3),
  new Given('R9C5', 2),

  new Thermo('R6C1', 'R5C2', 'R4C3', 'R3C2', 'R2C3', 'R3C4'),
  new Renban('R6C1', 'R5C2', 'R4C3', 'R3C2', 'R2C3', 'R3C4'),

  new Thermo('R4C9', 'R5C8', 'R6C7', 'R7C8', 'R8C7', 'R7C6'),
  new Renban('R4C9', 'R5C8', 'R6C7', 'R7C8', 'R8C7', 'R7C6'),

  new Thermo('R1C6', 'R2C6', 'R3C6', 'R4C6'),
  new Renban('R1C6', 'R2C6', 'R3C6', 'R4C6'),

  new Thermo('R9C4', 'R8C4', 'R7C4', 'R6C4'),
  new Renban('R9C4', 'R8C4', 'R7C4', 'R6C4'),

  new Thermo('R9C1', 'R8C2', 'R7C3'),
  new Renban('R9C1', 'R8C2', 'R7C3'),

  new Thermo('R1C9', 'R2C8', 'R3C7'),
  new Renban('R1C9', 'R2C8', 'R3C7'),
];
