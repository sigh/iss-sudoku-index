// Title: Variant Lesson: Dominoes
// Author: Deckatron
// Video: https://www.youtube.com/watch?v=5GEmnRO9u1I
// Source: https://sudokupad.app/sdcd71jvuh

// 6x6 grid, values 1-9: place 6 unique digits (an unknown subset of 1-9) so
// each digit appears 6 times and no digit repeats in a row, column, or 2x3
// box. Default box regions for a 6x6 shape are already 2x3, matching the
// drawn regions, so no explicit Jigsaw is needed.
const shape = new Shape('6x6~1-9');

// "Which 6 digits to use must be determined": RegionSameValues forces every
// row, column, and box (all size-6, the largest regions on this 9-value
// grid) to share one common 6-digit set. Combined with the default
// row/column/box all-different, this is exactly equivalent to "only 6
// distinct digits appear in the whole grid, each appearing 6 times" -- a
// row of 6 distinct cells drawn from a 6-value pool must be a permutation
// of that whole pool, so every row (and column, and box) uses the full set.
const digitsUsed = new RegionSameValues();

// X/V marks (sum to 10 / sum to 5). Not all Xs/Vs are given.
const xv = [
  new X('R3C1', 'R3C2'),
  new X('R3C5', 'R3C6'),
  new V('R4C2', 'R4C3'),
  new V('R5C5', 'R6C5'),
];

// Kropki dots (white = consecutive, black = 2:1 ratio). Not all dots given.
const dots = [
  new WhiteDot('R4C1', 'R5C1'),
  new WhiteDot('R1C2', 'R1C3'),
  new WhiteDot('R1C2', 'R2C2'),
  new BlackDot('R3C2', 'R3C3'),
  new BlackDot('R6C2', 'R6C3'),
  new BlackDot('R1C4', 'R1C5'),
  new BlackDot('R3C4', 'R4C4'),
];

return [
  shape,
  digitsUsed,
  ...xv,
  ...dots,
];
