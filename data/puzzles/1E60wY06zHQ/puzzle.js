// Title: Wild Blue Vines
// Author: Atrum
// Video: https://www.youtube.com/watch?v=1E60wY06zHQ
// Source: https://app.crackingthecryptic.com/sudoku/jqFJNfRhnM

// Normal sudoku rules apply (default row/column/box all-different).
//
// Digits on an arrow sum to the number in the arrow's circle. Circles hold
// one, two, or three digits, read left-to-right or top-to-bottom (source
// rules text). Two circles (F: R1C9/R2C9, and G: R9C8/R9C9 below) are each
// fed by two separate arrow strokes, so two different arms sum to that one
// shared circle value.
//
// Digits along each of the nine blue lines sum to one common (undeclared)
// total.

// Single-cell circle bulbs: plain Arrow(bulb, ...arm).
const singleBulbArrows = [
  new Arrow('R3C2', 'R4C3', 'R4C4'),
  new Arrow('R9C3', 'R8C3', 'R8C2', 'R7C2', 'R6C2'),
  new Arrow('R9C7', 'R8C7', 'R7C7', 'R8C6', 'R7C6'),
];

// Multi-cell circle bulbs: PillArrow(pillSize, ...pillCells, ...armCells).
// Pill cells are passed left-to-right / top-to-bottom, matching the rules'
// stated reading order.
const pillArrows = [
  new PillArrow(2, 'R9C1', 'R9C2',
    'R8C1', 'R7C1', 'R6C1', 'R5C2', 'R5C1', 'R4C1', 'R4C2', 'R3C1', 'R2C1', 'R1C1'),
  new PillArrow(3, 'R9C4', 'R9C5', 'R9C6',
    'R8C5', 'R7C5', 'R6C5', 'R6C6', 'R5C6', 'R5C5', 'R6C4', 'R7C3', 'R6C3', 'R5C4',
    'R4C5', 'R3C6', 'R3C7', 'R2C6', 'R1C6', 'R2C5', 'R3C4', 'R3C3', 'R2C4', 'R1C5',
    'R1C4', 'R2C3', 'R1C2'),
  // Circle F (R1C9, R2C9) -- two arms into the same pill.
  new PillArrow(2, 'R1C9', 'R2C9', 'R1C8', 'R2C7'),
  new PillArrow(2, 'R1C9', 'R2C9', 'R2C8', 'R3C8'),
  // Circle G (R9C8, R9C9) -- two arms into the same pill.
  new PillArrow(2, 'R9C8', 'R9C9', 'R8C8', 'R7C8', 'R6C7', 'R5C7', 'R4C7', 'R4C8', 'R3C9'),
  new PillArrow(2, 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C8', 'R5C8', 'R4C9', 'R5C9', 'R6C9'),
];

const blueLines = new EqualSum(
  ['R7C1', 'R6C1', 'R5C2'],
  ['R4C2', 'R3C1', 'R2C1', 'R1C1'],
  ['R2C3', 'R1C4'],
  ['R3C4', 'R2C5', 'R1C6', 'R2C6'],
  ['R5C4', 'R6C3'],
  ['R6C5', 'R7C5'],
  ['R8C9', 'R7C9', 'R6C8'],
  ['R5C8', 'R4C9', 'R5C9'],
  ['R5C7', 'R4C7', 'R4C8'],
);

return [
  new Shape('9x9'),
  ...singleBulbArrows,
  ...pillArrows,
  blueLines,
];
