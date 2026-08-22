// Title: January 1, 2022: Nova
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=4NP5NMG0MIQ
// Source: https://tinyurl.com/2p8wkvbp

// Rules: Normal sudoku rules apply (rows, columns, 3x3 boxes). Digits along
// thermometers must strictly increase from bulb to tip. Thermo enforces this
// directly with the bulb as cells[0].
// Thermometer cell paths transcribed from the puzzle's drawn thermometer lines.

return [
  new Shape('9x9'),

  new Given('R1C4', 8),
  new Given('R1C8', 1),
  new Given('R2C1', 7),
  new Given('R4C9', 5),
  new Given('R6C1', 6),
  new Given('R8C9', 4),
  new Given('R9C2', 2),
  new Given('R9C6', 3),

  new Thermo('R4C4', 'R4C3', 'R3C2', 'R3C3', 'R3C4', 'R2C3', 'R2C2'),
  new Thermo('R8C8', 'R8C7', 'R7C6', 'R7C7', 'R7C8', 'R6C7', 'R6C6'),
  new Thermo('R7C5', 'R7C4', 'R6C3', 'R6C4', 'R6C5', 'R5C4', 'R5C3'),
  new Thermo('R5C6', 'R4C5', 'R3C5', 'R3C6', 'R4C7', 'R5C7'),
];
