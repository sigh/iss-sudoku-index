// Title: Dec. 27, 2022: Kropki-Paste
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=EIVLk0zoBt8
// Source: https://tinyurl.com/4kbvdb75

// Normal sudoku (rows, columns, boxes). Grey clone regions: R1C1:R5C4 (A)
// and R5C6:R9C9 (B) must hold the same digit at each corresponding relative
// position (a fixed translation of +4 rows, +5 cols from A to B). White dots
// mark consecutive cells (WhiteDot); black dots mark a 2:1 ratio (BlackDot).
// No negative constraint: undotted adjacent pairs may still happen to be
// consecutive or in a 2:1 ratio, so nothing is asserted about them.

// Clone region cells, drawn top-left to bottom-right, row-major (matches the
// source's `clone`/`cloneCells` arrays).
const cloneA = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4',
  'R2C1', 'R2C2', 'R2C3', 'R2C4',
  'R3C1', 'R3C2', 'R3C3', 'R3C4',
  'R4C1', 'R4C2', 'R4C3', 'R4C4',
  'R5C1', 'R5C2', 'R5C3', 'R5C4',
];
const cloneB = [
  'R5C6', 'R5C7', 'R5C8', 'R5C9',
  'R6C6', 'R6C7', 'R6C8', 'R6C9',
  'R7C6', 'R7C7', 'R7C8', 'R7C9',
  'R8C6', 'R8C7', 'R8C8', 'R8C9',
  'R9C6', 'R9C7', 'R9C8', 'R9C9',
];
// One equality per corresponding pair (SameValues with singleton sets forces
// the two cells to hold the same value); this expresses "same digits in the
// same relative position" directly, cell by cell.
const clonePairs = cloneA.map(
  (a, i) => new SameValues(2, a, cloneB[i]));

// White dots (difference of 1), drawn between region-B cells.
const whiteDots = [
  ['R5C7', 'R6C7'],
  ['R5C8', 'R6C8'],
  ['R6C9', 'R5C9'],
  ['R7C6', 'R7C7'],
  ['R8C9', 'R7C9'],
  ['R9C8', 'R8C8'],
  ['R7C8', 'R7C7'],
].map(([a, b]) => new WhiteDot(a, b));

// Black dots (ratio 2:1), drawn between region-A cells.
const blackDots = [
  ['R1C2', 'R2C2'],
  ['R3C1', 'R2C1'],
  ['R1C3', 'R1C4'],
  ['R4C4', 'R4C3'],
  ['R5C2', 'R5C3'],
  ['R1C2', 'R1C3'],
].map(([a, b]) => new BlackDot(a, b));

return [
  new Shape('9x9'),
  ...clonePairs,
  ...whiteDots,
  ...blackDots,
];
