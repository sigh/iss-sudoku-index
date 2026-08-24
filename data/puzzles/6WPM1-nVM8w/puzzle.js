// Title: Sharpshooter
// Author: Leyrann
// Video: https://www.youtube.com/watch?v=6WPM1-nVM8w
// Source: https://app.crackingthecryptic.com/sudoku/6bnHjq8P2b

// Normal sudoku rules (default row/column/box) apply. No given digits.
// Cages: sum to the printed total, no repeated digit within a cage.
// Arrows: the first cell listed is the circled cell; the remaining cells
// are the arrow's arm, and their digits sum to the circled digit. The
// Arrow class itself allows repeats along its cells (matching the rules'
// "digits may repeat along an arrow if permitted by other rules" -- any
// non-repeat along an arrow here still comes only from row/column/box or
// from a cage that happens to overlap the arrow, not from the Arrow class).

const cages = [
  new Cage(20, 'R1C7', 'R1C8', 'R1C9', 'R2C8'),
  new Cage(19, 'R3C6', 'R3C7', 'R4C6', 'R5C6', 'R6C6'),
  new Cage(5, 'R5C9', 'R6C9'),
  new Cage(11, 'R9C7', 'R9C8'),
  new Cage(16, 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new Cage(15, 'R7C3', 'R8C3', 'R9C3'),
  new Cage(15, 'R6C1', 'R7C1', 'R8C1'),
  new Cage(18, 'R6C2', 'R6C3', 'R7C2'),
  new Cage(11, 'R3C1', 'R3C2'),
  new Cage(15, 'R1C3', 'R1C4', 'R1C5'),
];

const arrows = [
  new Arrow('R1C9', 'R1C8', 'R1C7'),
  new Arrow('R3C9', 'R4C9', 'R5C9', 'R6C9'),
  new Arrow('R3C7', 'R4C6', 'R5C6', 'R6C6'),
  new Arrow('R1C3', 'R1C4', 'R1C5', 'R2C5'),
  new Arrow('R3C1', 'R2C1', 'R2C2'),
  new Arrow('R4C2', 'R5C2', 'R5C3'),
  new Arrow('R7C2', 'R7C3', 'R8C3'),
  new Arrow('R9C5', 'R8C5', 'R7C5', 'R6C5'),
  new Arrow('R9C8', 'R8C9', 'R7C9'),
  new Arrow('R9C3', 'R8C4'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...arrows,
];
