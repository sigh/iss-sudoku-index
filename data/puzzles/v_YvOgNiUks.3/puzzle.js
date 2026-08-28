// Title: Sep 17, 2021: Thermo Clones
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=v_YvOgNiUks
// Source: https://tinyurl.com/59m8wa4m

// Normal Sudoku rules (default row/column/box AllDifferent from Shape).
// Nine thermometers: digits strictly increase from the bulb (first listed
// cell) to the tip (last listed cell) -- Thermo's built-in semantics.
// Four shaded "clone" cells must all hold the same value.

const givens = [
  new Given('R1C1', 7),
  new Given('R1C2', 6),
  new Given('R2C1', 8),
  new Given('R8C9', 1),
  new Given('R9C8', 3),
  new Given('R9C9', 2),
];

const thermometers = [
  new Thermo('R2C3', 'R2C4', 'R2C5', 'R2C6'),
  new Thermo('R8C4', 'R8C5', 'R8C6', 'R8C7'),
  new Thermo('R3C8', 'R4C8', 'R5C8', 'R6C8'),
  new Thermo('R4C2', 'R5C2', 'R6C2', 'R7C2'),
  new Thermo('R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8'),
  new Thermo('R3C4', 'R3C5', 'R3C6'),
  new Thermo('R7C4', 'R7C5', 'R7C6'),
  new Thermo('R4C9', 'R5C9', 'R6C9'),
  new Thermo('R4C1', 'R5C1', 'R6C1'),
];

// Clone cells (shaded #8080F0 in the payload): R2C6, R4C2, R6C8, R8C4 must
// all contain the same value. SameValues(4, ...) splits the four cells into
// four singleton sets and requires the sets to hold the same value.
const clones = [
  new SameValues(4, 'R2C6', 'R4C2', 'R6C8', 'R8C4'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermometers,
  ...clones,
];
