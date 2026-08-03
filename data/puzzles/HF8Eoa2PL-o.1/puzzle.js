// Title: August 20, 2023: Nerf Herder
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=HF8Eoa2PL-o
// Source: https://tinyurl.com/227fzr5e

// Normal sudoku rules apply (rows, columns and boxes all-different). Each
// thermometer's digits must strictly increase from the bulb (round end) to
// the open tip; Thermo takes cells bulb-first with that semantics built in.
// Thermometer cell paths are transcribed from the source's `thermometer`
// lines array, bulb (first listed cell) to tip (last listed cell).

const givens = [
  new Given('R2C8', 7),
  new Given('R3C7', 5),
  new Given('R7C3', 3),
  new Given('R8C2', 1),
];

const thermos = [
  new Thermo('R3C4', 'R2C5', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2'),
  new Thermo('R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R5C2', 'R4C3'),
  new Thermo('R7C6', 'R8C5', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'),
  new Thermo('R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R5C8', 'R6C7'),
  new Thermo('R2C2', 'R2C3', 'R2C4', 'R3C3', 'R4C2'),
  new Thermo('R6C8', 'R7C8', 'R8C8', 'R8C7', 'R8C6', 'R7C7'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
];
