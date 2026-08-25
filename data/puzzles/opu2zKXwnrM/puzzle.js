// Title: Banksydoku
// Author: olima
// Video: https://www.youtube.com/watch?v=opu2zKXwnrM
// Source: https://app.crackingthecryptic.com/sudoku/df86rMgM2J

// Normal sudoku rules apply (default rows/columns/boxes; the payload's
// regions are the standard nine 3x3 boxes). Digits increase along
// thermometers away from the bulb. Cages show their sums and contain no
// repeated digits.
//
// The seventh thermometer branches: a single bulb at R3C4 feeds a shaft cell
// at R4C4, which forks into four arms (three separate drawn stroke entries
// meeting at R4C4, a T-junction rather than a crossing). Each arm is its own
// Thermo call sharing the R3C4-R4C4 prefix, so every cell on every branch is
// constrained to increase from the bulb.
return [
  new Cage(42, 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C2'),
  new Cage(7, 'R2C8', 'R3C8'),
  new Cage(23, 'R4C8', 'R5C8', 'R6C8'),
  new Cage(19, 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7'),

  new Thermo('R6C3', 'R7C3', 'R8C3', 'R9C2'),
  new Thermo('R6C4', 'R7C4', 'R8C4', 'R9C3'),
  new Thermo('R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new Thermo('R6C6', 'R7C6', 'R8C6', 'R9C6'),
  new Thermo('R6C7', 'R7C7', 'R8C7', 'R9C7'),
  new Thermo('R2C7', 'R3C7', 'R4C6'),

  new Thermo('R3C4', 'R4C4', 'R5C4'),
  new Thermo('R3C4', 'R4C4', 'R5C3'),
  new Thermo('R3C4', 'R4C4', 'R5C5'),
  new Thermo('R3C4', 'R4C4', 'R4C5', 'R3C5'),
];
