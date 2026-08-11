// Title: The Trident
// Author: GBPack
// Video: https://www.youtube.com/watch?v=sOSrJCXdSCQ
// Source: https://app.crackingthecryptic.com/sudoku/NBPBDTP64f

// Normal sudoku rules apply (standard 9x9, standard 3x3 boxes). Digits
// cannot repeat within the cage. Digits along an arrow sum to the digit in
// that arrow's circle. White dots separate cells containing consecutive
// digits; not all possible dots are given, so no anti-consecutive inference
// is drawn from an unmarked pair.
//
// The one cage is drawn in a trident shape (three prongs, a crossbar, and a
// staff) and carries no printed total, so only the no-repeat clause applies
// (Cage with sum '' behaves as AllDifferent with no Sum constraint).
return [
  new Shape('9x9'),

  // Trident-shaped cage, no total given.
  new Cage('', 'R4C3', 'R5C3', 'R5C4', 'R4C5', 'R5C5', 'R6C5', 'R5C6', 'R5C7', 'R4C7'),

  // Arrows: bulb cell first, then arm cells.
  new Arrow('R1C2', 'R2C3', 'R3C3'),
  new Arrow('R2C6', 'R2C5', 'R3C5'),
  new Arrow('R4C8', 'R3C7', 'R2C7'),
  new Arrow('R6C8', 'R6C7', 'R7C7', 'R8C7'),
  new Arrow('R8C6', 'R8C5', 'R7C5'),
  new Arrow('R9C2', 'R8C3', 'R7C3', 'R6C3'),
  new Arrow('R4C1', 'R5C2', 'R6C1'),

  // White dots.
  new WhiteDot('R2C8', 'R2C9'),
  new WhiteDot('R7C2', 'R7C3'),
  new WhiteDot('R3C1', 'R3C2'),
];
