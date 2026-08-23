// Title: CTC Tribute
// Author: Lizzy01
// Video: https://www.youtube.com/watch?v=MAxNNVEs7cE
// Source: https://app.crackingthecryptic.com/sudoku/M83Hj6DRQh
//
// Normal sudoku rules apply (default row/column/box all-different). Along
// (blue) thermometers, digits increase from the bulb end: Thermo. Digits
// along an arrow sum to the digit in that arrow's circle: Arrow. In cages,
// digits sum to the small clue in the top-left cell and cannot repeat within
// the cage: Cage. Arrows 4 and 5 share one drawn bulb circle (two separate
// arms), so they are two independent Arrow constraints on the same bulb cell.

return [
  new Shape('9x9'),

  // Cages: cell list + sum, from the payload's `cages` array (title/author/
  // rules/empty stub entries excluded).
  new Cage(35, 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1', 'R3C2', 'R3C3'),
  new Cage(31, 'R4C1', 'R4C2', 'R4C3', 'R5C2', 'R6C2'),
  new Cage(36, 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R9C2', 'R9C3', 'R9C4'),
  new Cage(14, 'R5C4', 'R5C5'),
  new Cage(10, 'R9C8', 'R9C9'),

  // Thermometers: bulb cell first, strictly increasing thereafter.
  new Thermo('R1C3', 'R1C2'),
  new Thermo('R8C8', 'R7C9', 'R8C9'),

  // Arrows: bulb (sum) cell first, then arm cells.
  new Arrow('R2C2', 'R2C3', 'R2C4', 'R2C5'),
  new Arrow('R3C4', 'R4C4', 'R5C3', 'R6C4'),
  new Arrow('R4C6', 'R3C7', 'R2C7', 'R1C7'),
  new Arrow('R4C9', 'R5C9', 'R6C9'),
  new Arrow('R4C9', 'R3C8', 'R2C9'),
  new Arrow('R7C6', 'R6C7', 'R5C7'),
  new Arrow('R8C6', 'R8C5', 'R8C4'),
  new Arrow('R9C6', 'R8C7', 'R8C8'),
];
