// Title: Landing zone
// Author: Mr Durman
// Video: https://www.youtube.com/watch?v=sqVyjudGSLM
// Source: https://tinyurl.com/j7jefsmy
//
// Normal sudoku rules apply. In cages, digits must sum to the small clue in
// the top left corner of the cage (if given). Digits along arrows sum to the
// digit in that arrow's circle. Only one of the eight drawn cages carries a
// printed total; the other seven are distinct-digit-only regions per the
// ruleset's "if given" qualifier, encoded as AllDifferent.

return [
  new Shape('9x9'),

  // Givens (R1C1,R2C5,R2C8,R3C1,R4C2,R5C1,R5C5,R5C8,R6C5,R7C1,R8C9,R9C4).
  new Given('R1C1', 8),
  new Given('R2C5', 5),
  new Given('R2C8', 1),
  new Given('R3C1', 2),
  new Given('R4C2', 5),
  new Given('R5C1', 9),
  new Given('R5C5', 1),
  new Given('R5C8', 3),
  new Given('R6C5', 6),
  new Given('R7C1', 4),
  new Given('R8C9', 4),
  new Given('R9C4', 7),

  // Killer cages (killercage array). Only cage #7 (R1C1,R1C2,R2C1,R2C2)
  // carries a printed total (25); the other seven have no total, so per the
  // ruleset only their distinct-digit membership applies.
  new Cage(25, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new AllDifferent('R1C4', 'R1C5', 'R1C6', 'R2C5'),
  new AllDifferent('R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new AllDifferent('R4C1', 'R5C1', 'R6C1'),
  new AllDifferent('R4C9', 'R5C9', 'R6C9'),
  new AllDifferent('R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new AllDifferent('R8C5', 'R9C4', 'R9C5', 'R9C6'),
  new AllDifferent('R8C8', 'R8C9', 'R9C8', 'R9C9'),

  // Arrows (arrow array): bulb cell first, then the arm cells in drawn
  // order. Arrow #2 (source index) has one bulb (R8C5) feeding two separate
  // arms drawn as two lines from the same circle, so it is two Arrow
  // constraints that share their bulb cell.
  new Arrow('R4C6', 'R3C6', 'R2C6', 'R1C7'),
  new Arrow('R4C4', 'R3C4', 'R2C4', 'R1C3'),
  new Arrow('R8C5', 'R7C4', 'R6C4', 'R6C3'),
  new Arrow('R8C5', 'R7C6', 'R6C6', 'R6C7'),
  new Arrow('R6C2', 'R5C2', 'R4C2', 'R4C3'),
  new Arrow('R6C8', 'R5C8', 'R4C8', 'R4C7'),
];
