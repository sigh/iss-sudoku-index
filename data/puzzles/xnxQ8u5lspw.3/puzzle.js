// Title: Jun 19, 2022: Thermo Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=xnxQ8u5lspw
// Source: https://tinyurl.com/4amfu4td

// Normal Sudoku rules apply (rows, columns, boxes all-different). Numbers
// placed on a thermometer must strictly increase, starting from the bulb
// end; each Thermo below is ordered bulb-first per the payload's own line
// order, matching the f-puzzles convention that the first listed cell is
// the bulb.

// Givens, transcribed from the source grid.
const givens = [
  new Given('R1C1', 2),
  new Given('R1C7', 3),
  new Given('R1C8', 4),
  new Given('R1C9', 7),
  new Given('R2C1', 1),
  new Given('R3C1', 7),
  new Given('R3C4', 4),
  new Given('R4C4', 1),
  new Given('R5C5', 5),
  new Given('R6C6', 7),
  new Given('R7C6', 5),
  new Given('R7C9', 4),
  new Given('R8C9', 5),
  new Given('R9C1', 3),
  new Given('R9C2', 1),
  new Given('R9C3', 5),
  new Given('R9C9', 6),
];

// Thermometers, transcribed from the source's drawn thermometer lines.
const thermometers = [
  new Thermo('R1C3', 'R2C4', 'R1C5', 'R2C6'),
  new Thermo('R8C4', 'R9C5', 'R8C6', 'R9C7'),
  new Thermo('R5C6', 'R6C7', 'R5C8', 'R6C9'),
  new Thermo('R4C1', 'R5C2', 'R4C3', 'R5C4'),
  new Thermo('R3C6', 'R4C7', 'R3C8', 'R4C9'),
  new Thermo('R6C1', 'R7C2', 'R6C3', 'R7C4'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermometers,
];
