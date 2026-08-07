// Title: A Symmetry
// Author: Twototenth
// Video: https://www.youtube.com/watch?v=2G9pMM1EyyY
// Source: https://app.crackingthecryptic.com/sudoku/m4mpd4BFp3

// Normal sudoku rules apply (default 3x3 boxes; the payload's `regions` array
// lists exactly the nine default boxes, so no explicit Region constraints are
// needed). Digits along an arrow sum to the digit in that arrow's circle.
// Digits may not repeat along the drawn diagonal (only one diagonal is drawn,
// so only one Diagonal direction is constrained -- the anti-diagonal carries
// no line and is left unconstrained).
//
// Two circles (R8C2, R2C8) each anchor two separate arms -- transcribed as
// two independent Arrow constraints sharing the same bulb cell, since each
// arm is its own "arrow" summing to that shared circle per the rules text.

return [
  new Shape('9x9'),

  new Given('R4C6', 9),
  new Given('R6C4', 8),

  // Main diagonal R1C1-R9C9 (the only diagonal drawn). direction=-1 draws
  // top-left to bottom-right per Diagonal's ARGUMENT_CONFIG (the "\" option).
  new Diagonal(-1),

  // Arrows: bulb/control cell first, then arm cells in order away from the
  // bulb. Cell lists transcribed from the drawn arrow waypoints and circle
  // underlays.
  new Arrow('R1C3', 'R2C4', 'R2C5', 'R2C6'),
  new Arrow('R3C1', 'R4C2', 'R5C2', 'R6C2'),
  new Arrow('R6C7', 'R7C6', 'R6C5'),
  new Arrow('R4C3', 'R3C4', 'R4C5'),
  new Arrow('R8C2', 'R9C3', 'R9C4'),
  new Arrow('R8C2', 'R7C2', 'R6C1'),
  new Arrow('R9C7', 'R8C6', 'R8C5', 'R8C4'),
  new Arrow('R7C9', 'R6C8', 'R5C8', 'R4C8'),
  new Arrow('R2C8', 'R1C7', 'R1C6'),
  new Arrow('R2C8', 'R3C8', 'R4C9'),
];
