// Title: Toxic
// Author: jwsinclair
// Video: https://www.youtube.com/watch?v=CTGC2rDjCJA
// Source: https://app.crackingthecryptic.com/sudoku/L48jNT3jnp

// Standard sudoku (9x9, boxes, no givens). Four killer cages (sum in the
// top-left cell, cells confined to a single box so Cage's built-in
// distinctness is not an over-constraint). Two thermometers (grey lines with
// a circle bulb underlay; the bulb-marked cell is listed first, per Thermo's
// bulb-first convention). Six green lines are German-whisper-style: adjacent
// digits differ by at least 5, which is Whisper's default difference (5), so
// no explicit difference argument is needed. Five purple lines are Renban:
// non-repeating consecutive digits in any order.
const cages = [
  new Cage(8, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(8, 'R9C1', 'R9C2', 'R8C2'),
  new Cage(22, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(22, 'R8C8', 'R9C8', 'R9C9'),
];

const thermos = [
  new Thermo('R2C3', 'R2C2'),
  new Thermo('R9C9', 'R8C9'),
];

const whispers = [
  new Whisper('R6C1', 'R5C1'),
  new Whisper('R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3'),
  new Whisper('R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'),
  new Whisper('R9C5', 'R9C6', 'R9C7'),
  new Whisper('R1C3', 'R1C4'),
  new Whisper('R4C4', 'R5C5', 'R6C6'),
];

const renbans = [
  new Renban('R3C2', 'R4C2'),
  new Renban('R4C8', 'R3C8', 'R3C9'),
  new Renban('R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'),
  new Renban('R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'),
  new Renban('R6C4', 'R5C5', 'R4C6'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...thermos,
  ...whispers,
  ...renbans,
];
