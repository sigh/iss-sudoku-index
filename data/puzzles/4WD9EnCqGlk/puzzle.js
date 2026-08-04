// Title: Stretching Squares
// Author: Ambrose & AnalyticalNinja
// Video: https://www.youtube.com/watch?v=4WD9EnCqGlk
// Source: https://app.crackingthecryptic.com/sudoku/pBQT2g63JN

// Normal sudoku rules apply (standard rows/columns/3x3 boxes, digits 1-9, no
// givens). Digits in each cage sum to the cage's stated total (Cage also
// enforces all-different within the cage). Along each thermometer, digits
// strictly increase from the bulb end (Thermo's first argument is the bulb).

// Cages: 10 three-cell straight runs, each with a stated total, drawn on the
// grid.
const cages = [
  new Cage(20, 'R1C6', 'R2C6', 'R3C6'),
  new Cage(17, 'R1C8', 'R2C8', 'R3C8'),
  new Cage(11, 'R6C7', 'R7C7', 'R8C7'),
  new Cage(13, 'R6C9', 'R7C9', 'R8C9'),
  new Cage(11, 'R7C2', 'R8C2', 'R9C2'),
  new Cage(10, 'R7C4', 'R8C4', 'R9C4'),
  new Cage(16, 'R2C1', 'R3C1', 'R4C1'),
  new Cage(9, 'R2C3', 'R3C3', 'R4C3'),
  new Cage(13, 'R4C4', 'R4C5', 'R4C6'),
  new Cage(17, 'R6C4', 'R6C5', 'R6C6'),
];

// Thermometers: 10 three-cell straight runs drawn on the grid. Bulb cell
// (listed first, per Thermo's constructor) is the cell carrying the drawn
// filled circle; each of the 10 drawn circles lands on exactly one end of
// exactly one of these 10 lines, so every bulb assignment below is
// unambiguous. A stray/broken line stub elsewhere in the source drawing has
// no recoverable cells and matches no circle; it is not encoded.
const thermos = [
  new Thermo('R1C6', 'R1C7', 'R1C8'),
  new Thermo('R3C6', 'R3C7', 'R3C8'),
  new Thermo('R2C3', 'R2C2', 'R2C1'),
  new Thermo('R4C3', 'R4C2', 'R4C1'),
  new Thermo('R6C4', 'R5C4', 'R4C4'),
  new Thermo('R6C6', 'R5C6', 'R4C6'),
  new Thermo('R6C9', 'R6C8', 'R6C7'),
  new Thermo('R8C9', 'R8C8', 'R8C7'),
  new Thermo('R7C2', 'R7C3', 'R7C4'),
  new Thermo('R9C2', 'R9C3', 'R9C4'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...thermos,
];
