// Title: Boxes
// Author: Clover
// Video: https://www.youtube.com/watch?v=Ty9tf-er3xk
// Source: https://app.crackingthecryptic.com/sudoku/BD3ptPBqhf

// Normal sudoku rules apply. In cages, digits must sum to the small clue in
// the top left corner of the cage (where given). Digits cannot repeat within
// a cage -> Cage(total, ...cells) where printed, AllDifferent(...cells) for
// the two drawn cages with no printed total. Digits in white circles must
// appear in one of the four cells surrounding the circle -> Quad, anchored
// at the top-left cell of each circle's 2x2 block. No givens.

// Cage cell lists and printed totals transcribed from the drawn cages.
const cages = [
  new Cage(22, 'R2C2', 'R3C2', 'R4C2', 'R2C3', 'R2C4'),
  new Cage(21, 'R6C8', 'R7C8', 'R8C8', 'R8C7', 'R8C6'),
  new Cage(17, 'R6C7', 'R7C7', 'R7C6'),
  new Cage(11, 'R3C3', 'R4C3', 'R3C4'),
  new Cage(14, 'R3C6', 'R3C7', 'R4C7'),
  new Cage(20, 'R6C3', 'R7C3', 'R7C4'),
  new Cage(12, 'R5C1', 'R5C2'),
  new Cage(12, 'R8C5', 'R9C5'),
];

// Two drawn cages carry no printed total: distinct-digits-only, no sum
// constraint.
const noTotalCages = [
  new AllDifferent('R3C8', 'R4C8', 'R4C9', 'R3C9'),
  new AllDifferent('R6C1', 'R7C1', 'R7C2', 'R6C2'),
];

// White circles (overlays with numeric `text`), each at the shared corner of
// a 2x2 block; `text`'s digits must appear among that block's four cells.
// Quad(topLeftCell, ...values) anchors at the block's top-left cell.
// Cell blocks and digit lists transcribed from the drawn white circles.
const quads = [
  new Quad('R1C4', 1, 2, 5, 9),
  new Quad('R5C8', 1, 2, 5, 9),
  new Quad('R3C6', 4, 5, 6),
  new Quad('R3C3', 3, 4, 5),
  new Quad('R6C3', 6, 7, 8),
  new Quad('R6C6', 5, 6, 7),
];

return [
  new Shape('9x9'),
  ...cages,
  ...noTotalCages,
  ...quads,
];
