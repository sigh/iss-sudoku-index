// Title: Knight Time
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=z51ueWyCFnY
// Source: https://app.crackingthecryptic.com/sudoku/88mBm8N4JN

// Rules encoded here:
//   - Normal Sudoku: digits 1-9 once each per row, column and 3x3 box.
//   - Identical digits cannot be a chess knight's move apart.
//   - Digits increase along a thermometer from the bulb to the end(s).
//   - Cages show the sum of the digits they contain.
//
// Omitted: the board carries two small red dots on cell edges (between R4C4 and
// R5C4, and between R5C6 and R6C6). No available rules text defines what a red
// dot means here, so no constraint is placed on those two pairs.

// Givens as drawn in the four cells that carry a printed digit.
const givens = [
  new Given('R3C3', 6),
  new Given('R3C7', 4),
  new Given('R7C3', 5),
  new Given('R7C7', 7),
];

// Each grey stroke, listed bulb-first: the bulb is the grey disc drawn at one
// end of the stroke.
const thermometers = [
  new Thermo('R1C4', 'R1C3'),
  new Thermo('R3C5', 'R2C5', 'R1C5'),
  new Thermo('R5C3', 'R5C2', 'R5C1'),
  new Thermo('R5C7', 'R5C8', 'R5C9'),
  new Thermo('R7C5', 'R8C5', 'R9C5'),
  new Thermo('R9C6', 'R9C7'),
  // One branching figure: a single bulb at R5C5 with four one-cell arms to the
  // diagonally adjacent cells. The rules read "from the bulb to the end(s)", so
  // each arm increases away from the shared bulb; each is one Thermo.
  new Thermo('R5C5', 'R4C4'),
  new Thermo('R5C5', 'R4C6'),
  new Thermo('R5C5', 'R6C4'),
  new Thermo('R5C5', 'R6C6'),
];

// The four drawn cages and their printed totals. Each cage's three cells lie in
// a single row or a single column, so the no-repeat part of Cage is already
// forced by Sudoku and only the total is doing work here.
const cages = [
  new Cage(15, 'R5C1', 'R5C2', 'R5C3'),
  new Cage(15, 'R5C7', 'R5C8', 'R5C9'),
  new Cage(14, 'R1C5', 'R2C5', 'R3C5'),
  new Cage(14, 'R7C5', 'R8C5', 'R9C5'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermometers,
  ...cages,
  new AntiKnight(),
];
