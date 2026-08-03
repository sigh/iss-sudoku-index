// Title: Grand Line
// Author: Adem Jaziri
// Video: https://www.youtube.com/watch?v=NjWLyl8jHrY
// Source: https://app.crackingthecryptic.com/sudoku/tBdqj9rHGn

// Normal sudoku: digits 1-7 once each in every row, column and 7-cell region.
// Two of the seven drawn regions are only 6 cells each (rule: "A 6-cell region
// must contain 6 different digits from the set of the digits 1 to 7"): each
// one's listed cells include one cell that is orthogonally disconnected from
// the other six (R1C7 for the top-right region, R7C1 for the bottom-left
// region), so those two cells sit outside the region boundary and carry no
// region constraint, only the default row/column ones.
// Killer cages: digits in a cage don't repeat and sum to the corner total.

return [
  new Shape('7x7'),

  // Five standard 7-cell jigsaw regions. 7x7 has no default box tiling, so
  // these plus the two 6-cell regions below are the puzzle's only regions.
  new Jigsaw('7x7', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R2C7', 'R3C7', 'R4C7'),
  new Jigsaw('7x7', 'R2C3', 'R2C4', 'R2C5', 'R3C5', 'R3C6', 'R4C6', 'R5C6'),
  new Jigsaw('7x7', 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R7C2', 'R7C3', 'R7C4'),
  new Jigsaw('7x7', 'R3C2', 'R4C2', 'R5C2', 'R5C3', 'R6C3', 'R6C4', 'R6C5'),
  new Jigsaw('7x7', 'R3C3', 'R3C4', 'R4C3', 'R4C4', 'R4C5', 'R5C4', 'R5C5'),

  // The two 6-cell regions: the contiguous hexomino only, excluding the
  // disconnected cell (see note above).
  new AllDifferent('R5C7', 'R6C6', 'R6C7', 'R7C5', 'R7C6', 'R7C7'),
  new AllDifferent('R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C1'),

  // Killer cages (top-left total, no repeats), from the drawn cage geometry.
  new Cage(8, 'R6C6', 'R7C6', 'R7C7'),
  new Cage(14, 'R1C1', 'R1C2', 'R2C2'),
  new Cage(9, 'R5C1', 'R5C2', 'R6C1'),
  new Cage(15, 'R2C7', 'R3C6', 'R3C7'),
  new Cage(6, 'R2C4', 'R3C4'),
];
