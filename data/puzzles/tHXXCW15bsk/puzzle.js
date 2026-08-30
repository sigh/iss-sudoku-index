// Title: Anti Knight Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=tHXXCW15bsk
// Source: https://cracking-the-cryptic.web.app/sudoku/9TDrQ7MTFQ

// The source payload carries no rules text (empty/absent, as this ctc-app
// source is known to do) and draws no geometry beyond the 20 givens and the
// standard nine 3x3 boxes: no lines, cages, arrows, or overlays. Only normal
// Sudoku (each row, column and 3x3 box holds 1-9 once each) is encoded here.
// The video's own title names an "Anti Knight" variant, but a title is not a
// rules source, so that constraint is omitted rather than guessed.

return [
  new Shape('9x9'),

  // Givens, transcribed from the source payload's cell array.
  new Given('R1C1', 6),
  new Given('R1C8', 8),
  new Given('R1C9', 9),
  new Given('R3C3', 1),
  new Given('R3C4', 2),
  new Given('R3C5', 3),
  new Given('R4C3', 4),
  new Given('R4C4', 5),
  new Given('R4C5', 6),
  new Given('R5C3', 7),
  new Given('R5C4', 8),
  new Given('R5C5', 9),
  new Given('R6C7', 4),
  new Given('R7C6', 2),
  new Given('R8C1', 3),
  new Given('R8C8', 1),
  new Given('R8C9', 2),
  new Given('R9C1', 7),
  new Given('R9C8', 4),
  new Given('R9C9', 5),

  // The drawn regions are the default nine 3x3 boxes (just listed in a
  // different order), so no explicit region constraint is needed -- ISS
  // applies row/column/box all-different by default.
];
