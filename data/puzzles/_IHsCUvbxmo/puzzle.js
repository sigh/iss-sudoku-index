// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=_IHsCUvbxmo
// Source: https://cracking-the-cryptic.web.app/sudoku/mgg2h6frfJ

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Thermometers: digits increase from the bulb along the stem -> Thermo(bulb, ...stem).
// Arrows: digits along the arm sum to the digit(s) in the attached
// circle/pill -> Arrow(bulb, ...arm) for a single-digit circle bulb,
// PillArrow(2, ...pillCells, ...arm) for a two-digit pill bulb. There is no
// printed total anywhere in the source; the bulb/pill cells are ordinary grid
// cells whose own solved digit(s) form the total. Each pill/circle underlay's
// cell count (drawn geometry) fixes which cells are the bulb versus the arm.

const thermos = [
  new Thermo('R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'),
  new Thermo('R4C7', 'R4C8', 'R3C8', 'R3C9'),
  new Thermo('R8C7', 'R8C8', 'R7C8', 'R6C8', 'R6C7', 'R5C7'),
  new Thermo('R7C1', 'R7C2', 'R7C3', 'R7C4'),
  // Drawn tip-first (R9C1 -> R9C4); the bulb underlay sits at R9C4, the
  // drawn line's last point, so the increasing direction is reversed here.
  new Thermo('R9C4', 'R9C3', 'R9C2', 'R9C1'),
];

const arrows = [
  new Arrow('R4C3', 'R3C3', 'R2C3', 'R2C4'),
  new Arrow('R4C6', 'R4C7', 'R5C7'),
  new PillArrow(2, 'R1C5', 'R1C6', 'R2C5', 'R2C6'),
  new Arrow('R6C2', 'R7C2', 'R8C2', 'R9C2'),
  new PillArrow(2, 'R4C9', 'R5C9', 'R3C9', 'R3C8', 'R4C8'),
  new Arrow('R7C6', 'R6C7'),
  new Arrow('R9C7', 'R8C7', 'R8C8', 'R7C8'),
];

return [
  new Shape('9x9'),
  ...thermos,
  ...arrows,
];
