// Title: February 25, 2022: Thermoboros
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=5KkjaYmgOBc
// Source: https://tinyurl.com/3yhpbz96

// Normal sudoku rules apply. Digits along each thermometer must strictly
// increase from the bulb to the tip; Thermo enforces exactly this, in
// argument order, so each thermometer's cells are listed bulb-first per the
// payload's thermometer convention (bulb-first, unlike betweenline).

return [
  new Shape('9x9'),

  // Givens.
  new Given('R2C2', 5),
  new Given('R2C8', 6),
  new Given('R8C2', 8),
  new Given('R8C8', 1),

  // Thermometers. All steps are diagonal (king-move) adjacencies; the first
  // forms an octagonal ring around the centre cell R5C5.
  new Thermo('R4C4', 'R5C3', 'R6C4', 'R7C5', 'R6C6', 'R5C7', 'R4C6', 'R3C5'),
  new Thermo('R2C4', 'R3C3', 'R4C2', 'R5C1', 'R6C2', 'R7C3', 'R8C4'),
  new Thermo('R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R4C8', 'R3C7'),
  new Thermo('R2C6', 'R1C5'),
];
