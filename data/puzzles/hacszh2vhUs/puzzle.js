// Title: I'm A Poor Lonesome Arrow...
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=hacszh2vhUs
// Source: https://app.crackingthecryptic.com/sudoku/Dt6DbPFq4h

// Rules: place 1-7 once each per row, column and outlined region (no
// standard boxes -- the grid is 7x7 with seven irregular 7-cell regions).
// Digits along the arrow sum to the digit in the arrow's circle.
// Orthogonally adjacent cells may not hold consecutive digits
// (AntiConsecutive's built-in adjacency is orthogonal-only, matching the
// "sharing an edge" rule). No digits are given.

const shape = new Shape('7x7');

// Seven outlined regions, transcribed from the drawn region outlines.
const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C1', 'R2C2'],
  ['R1C6', 'R1C7', 'R2C6', 'R2C7', 'R3C7', 'R4C7', 'R5C7'],
  ['R6C6', 'R6C7', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R7C1', 'R7C2'],
  ['R2C3', 'R2C4', 'R2C5', 'R3C2', 'R3C3', 'R4C2', 'R4C3'],
  ['R3C4', 'R3C5', 'R3C6', 'R4C4', 'R5C2', 'R5C3', 'R5C4'],
  ['R4C5', 'R4C6', 'R5C5', 'R5C6', 'R6C3', 'R6C4', 'R6C5'],
];

return [
  shape,
  // 7 is prime, so Shape('7x7') has no default box tiling (boxes() is
  // empty) -- NoBoxes() is not needed before adding the drawn regions.
  ...regions.map(cells => new Jigsaw('7x7', ...cells)),
  // Arrow bulb (circled cell, from the underlay) is R3C3; its arm runs
  // R3C3-R3C2-R2C2, so R3C3 = R3C2 + R2C2.
  new Arrow('R3C3', 'R3C2', 'R2C2'),
  new AntiConsecutive(),
];
