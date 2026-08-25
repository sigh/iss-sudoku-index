// Title: Four Scissors
// Author: Lucy Audrin
// Video: https://www.youtube.com/watch?v=LahNxpmam3w
// Source: https://app.crackingthecryptic.com/sudoku/6dtFphTTqg

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Thermometers: digits increase from the bulb end -> Thermo(...cells), bulb
// first. Two thermometers cross at a shared cell in each of four spots on
// the grid (the "Four Scissors" of the title); the shared cell is simply
// listed in both Thermo calls, so it is bound by both increasing chains.
// Circles: the listed digits each appear among the four surrounding cells
// -> Quad(topLeftCell, ...values).
//
// A ninth line-array entry carries only a colour and thickness with no
// wayPoints and draws nothing on the board, so it is not encoded.

const thermos = [
  new Thermo('R5C1', 'R4C2', 'R3C3', 'R2C3'),
  new Thermo('R5C3', 'R4C2', 'R3C1', 'R2C1'),
  new Thermo('R4C4', 'R3C5', 'R2C6', 'R1C6'),
  new Thermo('R4C6', 'R3C5', 'R2C4', 'R1C4'),
  new Thermo('R5C7', 'R6C8', 'R7C9', 'R8C9'),
  new Thermo('R5C9', 'R6C8', 'R7C7', 'R8C7'),
  new Thermo('R6C6', 'R7C5', 'R8C4', 'R9C4'),
  new Thermo('R6C4', 'R7C5', 'R8C6', 'R9C6'),
];

const quads = [
  new Quad('R2C1', 4, 5),
  new Quad('R2C2', 6, 8),
  new Quad('R1C4', 4, 6),
  new Quad('R8C2', 3, 8),
  new Quad('R8C5', 2, 4),
  new Quad('R7C8', 1, 8),
  new Quad('R1C8', 3, 5, 8),
];

return [
  new Shape('9x9'),
  ...thermos,
  ...quads,
];
