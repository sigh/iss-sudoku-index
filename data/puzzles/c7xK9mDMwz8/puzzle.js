// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=c7xK9mDMwz8
// Source: https://cracking-the-cryptic.web.app/sudoku/pBm3J4h4RG

// Normal Sudoku rules apply. All the grey cells contain even digits.
//
// The source payload carries no rules text; the ruleset comes from the video
// description, which links this exact source URL and states "All the grey
// cells contain even numbers."
//
// There is no dedicated Odd/Even class: a parity clue is a candidate
// restriction, encoded as a multi-value Given.

return [
  new Shape('9x9'),

  // Givens, from the payload's cell values.
  new Given('R1C1', 1),
  new Given('R1C6', 9),
  new Given('R1C7', 5),
  new Given('R1C9', 7),
  new Given('R2C2', 2),
  new Given('R3C3', 3),
  new Given('R3C7', 1),
  new Given('R3C9', 4),
  new Given('R4C4', 4),
  new Given('R4C9', 3),
  new Given('R5C5', 5),
  new Given('R6C1', 8),
  new Given('R6C6', 6),
  new Given('R7C1', 6),
  new Given('R7C3', 8),
  new Given('R7C7', 7),
  new Given('R8C8', 8),
  new Given('R9C1', 4),
  new Given('R9C3', 2),
  new Given('R9C4', 5),
  new Given('R9C9', 9),

  // Grey cells, from the payload's 10 underlay fills, restricted to the even
  // digits.
  new Given('R2C4', 2, 4, 6, 8),
  new Given('R3C5', 2, 4, 6, 8),
  new Given('R4C2', 2, 4, 6, 8),
  new Given('R4C6', 2, 4, 6, 8),
  new Given('R5C3', 2, 4, 6, 8),
  new Given('R5C7', 2, 4, 6, 8),
  new Given('R6C4', 2, 4, 6, 8),
  new Given('R6C8', 2, 4, 6, 8),
  new Given('R7C5', 2, 4, 6, 8),
  new Given('R8C6', 2, 4, 6, 8),
];
