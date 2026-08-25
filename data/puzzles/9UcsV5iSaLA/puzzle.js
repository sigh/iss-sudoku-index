// Title: At Least I Didn't Use a Spoon
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=9UcsV5iSaLA
// Source: https://app.crackingthecryptic.com/webapp/84fgT3J23J

// Normal sudoku rules apply (default row/column/box all-different). Digits
// along an arrow sum to the number in the circle; a circle spanning two
// cells is a 2-digit number read left-to-right or top-to-bottom (video
// description).

// Single-cell circle bulbs: plain Arrow(bulb, ...arm).
const singleBulbArrows = [
  new Arrow('R6C4', 'R7C3', 'R8C2'),
  new Arrow('R2C2', 'R3C3', 'R4C4', 'R5C5'),
  new Arrow('R8C8', 'R7C7', 'R6C6'),
  new Arrow('R4C6', 'R3C7', 'R2C8'),
];

// Two-cell circle bulbs: PillArrow(2, ...pillCells, ...armCells). Pill
// cells are passed left-to-right / top-to-bottom, matching the stated
// reading order.
const pillArrows = [
  new PillArrow(2, 'R7C1', 'R8C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1', 'R1C1'),
  new PillArrow(2, 'R6C2', 'R7C2', 'R5C2', 'R4C2', 'R3C2'),
  new PillArrow(2, 'R9C7', 'R9C8', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'),
  new PillArrow(2, 'R8C6', 'R8C7', 'R8C5', 'R8C4', 'R8C3'),
  new PillArrow(2, 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'),
  new PillArrow(2, 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7'),
  new PillArrow(2, 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new PillArrow(2, 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8'),
];

return [
  new Shape('9x9'),
  new Given('R5C9', 8),
  new Given('R9C5', 5),
  ...singleBulbArrows,
  ...pillArrows,
];
