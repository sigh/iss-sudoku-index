// Title: Dec. 4, 2022: Extra Regions
// Author: clover!
// Video: https://www.youtube.com/watch?v=3Onsq24T0Ug
// Source: https://tinyurl.com/42z4mzur

// Normal sudoku rules apply (rows, columns, boxes). Four gray-shaded 9-cell
// regions are drawn on the grid (source `extraregion` cell lists); each must
// also contain 1-9 exactly once, as extra AllDifferent groups alongside the
// standard ones.

return [
  new Shape('9x9'),

  new Given('R1C4', 6), new Given('R1C6', 9),
  new Given('R2C3', 5), new Given('R2C7', 6),
  new Given('R3C2', 4), new Given('R3C8', 7),
  new Given('R4C1', 8), new Given('R4C4', 1), new Given('R4C6', 2), new Given('R4C9', 5),
  new Given('R6C1', 1), new Given('R6C4', 4), new Given('R6C6', 3), new Given('R6C9', 2),
  new Given('R7C2', 2), new Given('R7C8', 8),
  new Given('R8C3', 3), new Given('R8C7', 1),
  new Given('R9C4', 7), new Given('R9C6', 6),

  new AllDifferent('R1C4', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C1', 'R4C2', 'R4C3'),
  new AllDifferent('R6C7', 'R6C8', 'R6C9', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R9C6'),
  new AllDifferent('R1C6', 'R2C6', 'R2C7', 'R3C6', 'R3C7', 'R3C8', 'R4C7', 'R4C8', 'R4C9'),
  new AllDifferent('R6C1', 'R6C2', 'R6C3', 'R7C2', 'R7C3', 'R7C4', 'R8C3', 'R8C4', 'R9C4'),
];
