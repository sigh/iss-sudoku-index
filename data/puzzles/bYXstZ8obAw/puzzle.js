// Title: Miracle Man's Thermo Sudoku
// Author: Mitchell Lee
// Video: https://www.youtube.com/watch?v=bYXstZ8obAw
// Source: https://cracking-the-cryptic.web.app/sudoku/MGFq4tgM2t

// Normal sudoku rules apply (standard 3x3 boxes; no givens). On each of the
// 14 thermometer lines, digits strictly increase from the bulb end. Bulb
// end for every line is grounded by the drawn round-circle underlay at
// that end; Thermo's first cell is the bulb.

return [
  new Shape('9x9'),

  new Thermo('R4C1', 'R3C1', 'R2C1', 'R1C1'),
  new Thermo('R4C2', 'R3C2', 'R2C2', 'R1C2'),
  new Thermo('R1C4', 'R2C4', 'R2C3'),
  new Thermo('R4C5', 'R3C5', 'R2C5', 'R1C5'),
  new Thermo('R4C7', 'R4C6'),
  new Thermo('R3C8', 'R2C8', 'R1C8'),
  new Thermo('R2C9', 'R3C9', 'R4C9', 'R5C9'),
  new Thermo('R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Thermo('R6C8', 'R7C8', 'R8C8', 'R9C8'),
  new Thermo('R8C1', 'R7C1', 'R6C1', 'R5C1'),
  new Thermo('R7C2', 'R8C2', 'R9C2'),
  new Thermo('R7C3', 'R7C4'),
  new Thermo('R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new Thermo('R7C6', 'R8C6', 'R8C7'),
];
