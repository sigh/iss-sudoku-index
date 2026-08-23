// Title: Setting The Scene
// Author: PjotrV
// Video: https://www.youtube.com/watch?v=Cwz3pBVjTCc
// Source: https://app.crackingthecryptic.com/sudoku/33MN2jT4Hf

// Normal sudoku rules apply (standard 3x3 boxes, from the payload's own
// region list). Digits along an arrow sum to the digit in that arrow's
// circle -- each circle sits on a normal grid cell, which is itself the
// sum. In cages, digits sum to the small top-left total (all-different
// among cage cells regardless of whether a total is printed). Along each
// main diagonal (drawn blue) digits cannot repeat.

return [
  new Shape('9x9'),

  new Given('R2C5', 7),
  new Given('R3C9', 4),

  // Cages: totals from the top-left corner clue; Cage enforces sum + distinct.
  new Cage(8, 'R4C1', 'R5C1', 'R6C1'),
  // No total printed on this cage -- still enforces all-different: an
  // untotalled killer cage is AllDifferent over its cells.
  new AllDifferent('R4C9', 'R5C9', 'R6C9'),

  // Arrows: bulb/control cell first, then arm cells (Arrow: arm sums to bulb).
  new Arrow('R1C1', 'R1C2', 'R1C3', 'R2C3'),
  new Arrow('R1C9', 'R1C8', 'R1C7', 'R2C7'),
  new Arrow('R9C9', 'R9C8', 'R9C7', 'R8C7'),
  new Arrow('R9C1', 'R9C2', 'R9C3', 'R8C3'),
  new Arrow('R5C3', 'R6C3', 'R5C2'),
  new Arrow('R5C7', 'R4C7', 'R5C8'),

  // Diagonals: direction -1 is the top-left/bottom-right (main) diagonal,
  // direction 1 is the top-right/bottom-left (anti) diagonal.
  new Diagonal(-1),
  new Diagonal(1),
];
