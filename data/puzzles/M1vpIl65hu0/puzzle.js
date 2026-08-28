// Title: Happy Birthday Sarah!
// Author: Christian Burns
// Video: https://www.youtube.com/watch?v=M1vpIl65hu0
// Source: https://tinyurl.com/4j6mdx27

// Normal Sudoku rules apply (default rows/columns/3x3 boxes). Digits along
// each thermometer strictly increase from the bulb (rounded end) to the tip.
// The pink-shaded cells (visible in the source) form a decorative heart
// outline; the rules text gives them no meaning, so they carry no constraint.

return [
  new Shape('9x9'),

  // Givens, as printed on the grid.
  new Given('R1C4', 9),
  new Given('R1C8', 2),
  new Given('R1C9', 6),
  new Given('R2C7', 1),
  new Given('R3C6', 1),
  new Given('R8C8', 9),
  new Given('R9C1', 2),
  new Given('R9C2', 6),
  new Given('R9C8', 5),

  // Thermometers, bulb-first (as drawn on the grid).
  new Thermo('R3C4', 'R3C3', 'R4C2', 'R4C3', 'R4C4', 'R5C3', 'R5C2'),
  new Thermo('R3C6', 'R4C6', 'R5C6', 'R5C7', 'R5C8', 'R4C7', 'R4C8', 'R3C7'),
  new Thermo('R8C5', 'R7C6', 'R6C7'),
  new Thermo('R7C5', 'R6C6'),
  new Thermo('R5C5', 'R6C4'),
  new Thermo('R4C5', 'R5C4'),
  new Thermo('R6C5', 'R7C4', 'R6C3'),
  new Thermo('R9C1', 'R9C2', 'R9C3'),
  new Thermo('R1C8', 'R1C9', 'R2C9'),
];
