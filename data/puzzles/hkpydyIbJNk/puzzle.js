// Title: Bubbler
// Author: thetearex15
// Video: https://www.youtube.com/watch?v=hkpydyIbJNk
// Source: https://app.crackingthecryptic.com/sudoku/r3LrBMrN9P

// Rules: "Normal sudoku rules apply (1-9 appears in each row, column and
// 3x3 box)." No cages, lines, arrows, or other overlays are present in the
// payload. Regions are the standard 3x3 boxes, so no NoBoxes/RegionSize
// override is needed -- the default Shape('9x9') row/column/box
// all-different constraints already match the drawn regions.

return [
  new Shape('9x9'),

  new Given('R1C1', 4), new Given('R1C4', 5), new Given('R1C6', 7), new Given('R1C9', 2),
  new Given('R2C2', 5), new Given('R2C3', 7), new Given('R2C5', 6), new Given('R2C7', 4),
  new Given('R3C2', 6),
  new Given('R4C1', 5), new Given('R4C4', 4), new Given('R4C5', 2), new Given('R4C6', 6), new Given('R4C7', 3),
  new Given('R5C2', 7), new Given('R5C4', 3), new Given('R5C6', 9), new Given('R5C7', 8),
  new Given('R6C1', 6), new Given('R6C4', 7), new Given('R6C5', 8),
  new Given('R7C2', 4), new Given('R7C4', 2), new Given('R7C5', 9), new Given('R7C7', 5),
  new Given('R8C8', 1),
  new Given('R9C1', 3), new Given('R9C9', 9),
];
