// Title: The Mods Are Asleep
// Author: SSG
// Video: https://www.youtube.com/watch?v=8mn-G1G0fqA
// Source: https://app.crackingthecryptic.com/sudoku/7tF7DBtJn2

// Normal sudoku rules apply. Digits along an arrow must sum to the digit in
// that arrow's circle (Arrow: bulb cell first, then arm cells). Each purple
// line is a non-repeating set of consecutive digits in any order (Renban).
//
// Arrows 3 and 4 share one circled cell (R6C6): two separate arms fan out
// from it, each arm's own sum equalling the shared circled digit; R5C5 is
// the first cell on both arms. A thin grey stroke duplicating arrow 5's
// first leg (R7C8-R6C9) is a decorative render artifact, not a clue -- it
// matches no rules-defined mark type and adds no cells beyond the arrow.

const arrows = [
  new Arrow('R1C3', 'R1C2', 'R2C1', 'R3C1'),
  new Arrow('R2C6', 'R3C6', 'R4C6'),
  new Arrow('R6C6', 'R5C5', 'R4C5'),
  new Arrow('R6C6', 'R5C5', 'R6C5', 'R6C4'),
  new Arrow('R7C8', 'R6C9', 'R5C9'),
  new Arrow('R7C2', 'R6C3', 'R5C3', 'R4C3'),
  new Arrow('R9C4', 'R9C3', 'R9C2'),
];

const renbans = [
  new Renban('R1C3', 'R2C3', 'R3C3'),
  new Renban('R2C4', 'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R4C4', 'R5C4'),
  new Renban('R5C3', 'R5C2', 'R5C1', 'R4C1', 'R4C2', 'R4C3', 'R3C4'),
  new Renban('R1C6', 'R1C7'),
  new Renban('R2C7', 'R3C6'),
  new Renban('R3C8', 'R4C7', 'R5C6'),
  new Renban('R2C9', 'R3C9', 'R4C9'),
  new Renban('R6C8', 'R6C7', 'R7C6', 'R8C6', 'R9C6'),
  new Renban('R7C7', 'R8C7', 'R9C7', 'R9C8', 'R8C8'),
  new Renban('R7C8', 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Renban('R8C2', 'R9C2', 'R9C1', 'R8C1', 'R7C1'),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...renbans,
];
