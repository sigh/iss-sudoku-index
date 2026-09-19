// Title: Nonconsecutive Spoons
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=jFsMiAicuYc
// Source: https://sudokupad.app/tmwfllzail

// Normal sudoku rules apply (rows, columns, and 3x3 boxes all contain 1-9;
// enforced by the default Shape). No given digits.
// Along each thermometer, digits increase from the bulb end (Thermo, first
// cell is the bulb).
// Orthogonally adjacent cells may not hold consecutive digits, globally,
// across the whole grid (AntiConsecutive).

return [
  new Shape('9x9'),

  // Thermometers transcribed from the payload's `thermometer` array; each
  // entry's cell order is bulb-first per the SudokuPad convention.
  new Thermo('R2C2', 'R3C2', 'R4C2'),
  new Thermo('R2C3', 'R3C3', 'R4C3'),
  new Thermo('R2C4', 'R3C4', 'R4C4'),
  new Thermo('R2C6', 'R3C6', 'R4C6'),
  new Thermo('R2C7', 'R3C7', 'R4C7'),
  new Thermo('R6C3', 'R7C3', 'R8C3'),
  new Thermo('R6C4', 'R7C4', 'R8C4'),
  new Thermo('R6C6', 'R7C6', 'R8C6'),
  new Thermo('R6C7', 'R7C7', 'R8C7'),
  new Thermo('R6C8', 'R7C8', 'R8C8'),
  new Thermo('R9C5', 'R9C4', 'R9C3'),

  new AntiConsecutive(),
];
