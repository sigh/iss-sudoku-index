// Title: Winkelmesser
// Author: Myxo
// Video: https://www.youtube.com/watch?v=RYLm-3P-gks
// Source: https://sudokupad.app/y85zt1ul4o

// Sudoku: standard row/column/box constraint (Shape('9x9')).
// Thermo: digits strictly increase from bulb to tip. Each Thermo below is
// listed bulb-first; bulb cell identified by the drawn circle underlay at
// one end of each grey line.
const thermometers = [
  new Thermo('R5C9', 'R5C8', 'R5C7', 'R5C6', 'R4C5', 'R3C5', 'R2C5', 'R1C5'),
  new Thermo('R8C5', 'R7C5', 'R6C5', 'R5C4', 'R5C3', 'R5C2'),
  new Thermo('R5C1', 'R4C1', 'R3C1', 'R2C1'),
  new Thermo('R9C8', 'R9C7', 'R9C6', 'R9C5'),
  new Thermo('R9C9', 'R8C9', 'R7C9', 'R6C9'),
  new Thermo('R1C4', 'R1C3', 'R1C2', 'R1C1'),
  new Thermo('R3C8', 'R2C8', 'R2C7'),
  new Thermo('R6C3', 'R7C4'),
  new Thermo('R8C3', 'R7C2'),
  new Thermo('R4C6', 'R3C7'),
];

return [
  new Shape('9x9'),
  ...thermometers,
];
