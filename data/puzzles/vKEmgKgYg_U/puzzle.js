// Title: Arrow Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=vKEmgKgYg_U
// Source: https://cracking-the-cryptic.web.app/sudoku/DGT6HQ46FN

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Arrows: digits along the arm sum to the digit(s) in the attached
// circle/pill -> Arrow(bulb, ...arm) for a single-cell circle bulb,
// PillArrow(2, ...pillCells, ...arm) for a two-cell pill bulb. Each
// bulb's drawn cell count (circle vs. rounded-rect underlay spanning two
// grid cells) fixes which cells are the bulb versus the arm; PillArrow
// sorts the supplied pill cells into reading order itself. Two arrows
// (R1C7-R1C6 and R2C6-R2C5-R2C4) share the same single-cell bulb at
// R2C7.

const arrows = [
  new Arrow('R2C7', 'R1C7', 'R1C6'),
  new Arrow('R2C7', 'R2C6', 'R2C5', 'R2C4'),
  new Arrow('R3C6', 'R4C6', 'R5C6', 'R6C6'),
  new Arrow('R7C1', 'R6C2', 'R5C2'),
  new Arrow('R8C2', 'R7C3', 'R7C4', 'R7C5'),
  new Arrow('R8C5', 'R8C4', 'R8C3'),
  new Arrow('R6C7', 'R7C6', 'R8C6'),
];

const pillArrows = [
  new PillArrow(2, 'R3C7', 'R3C8', 'R3C9', 'R2C9'),
  new PillArrow(2, 'R3C4', 'R3C5', 'R4C5', 'R4C4', 'R5C3', 'R6C3'),
  new PillArrow(2, 'R3C1', 'R3C2', 'R4C1', 'R4C2', 'R4C3', 'R5C4'),
  // 12-cell arm, the longest arrow in the puzzle (per the video title):
  // down the right edge, along the whole bottom row, up the left edge.
  new PillArrow(2, 'R6C8', 'R6C9', 'R7C8', 'R8C9', 'R9C9', 'R9C8', 'R9C7',
    'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1', 'R8C1'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...pillArrows,
];
