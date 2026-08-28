// Title: Arrow Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=OUu6nxHLso0
// Source: https://cracking-the-cryptic.web.app/sudoku/4FB6tGJqhr

// Normal sudoku rules apply (default row/column/box all-different).
//
// Digits along an arrow sum to the 1- or 2-digit number in the bulb it
// leaves from (source rules text). Two bulbs (E: R5C6, and F: R5C4) are
// each fed by two separate arrow strokes, so two different arms sum to
// that one shared bulb value.

// Single-cell circle bulbs: plain Arrow(bulb, ...arm).
const singleBulbArrows = [
  new Arrow('R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'),
  new Arrow('R9C1', 'R8C1', 'R7C2', 'R6C3'),
  new Arrow('R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7'),
  new Arrow('R7C5', 'R7C6', 'R8C6'),
  new Arrow('R5C6', 'R6C7', 'R6C8'),
  new Arrow('R5C6', 'R5C7', 'R5C8'),
  new Arrow('R5C4', 'R5C3', 'R5C2'),
  new Arrow('R5C4', 'R4C3', 'R4C2'),
  new Arrow('R3C5', 'R3C4', 'R2C4'),
  new Arrow('R1C9', 'R2C9', 'R3C8', 'R4C7'),
  new Arrow('R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3'),
  new Arrow('R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4'),
];

// Multi-cell (pill) bulbs: PillArrow(pillSize, ...pillCells, ...armCells).
// Pill cells passed left-to-right, matching the drawn horizontal pills.
const pillArrows = [
  new PillArrow(2, 'R2C1', 'R2C2',
    'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R3C2', 'R3C1'),
  new PillArrow(2, 'R8C8', 'R8C9',
    'R7C9', 'R7C8', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9'),
];

return [
  new Shape('9x9'),
  ...singleBulbArrows,
  ...pillArrows,
];
