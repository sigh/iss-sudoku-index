// Title: Low-key Kropki
// Author: Supercritical Pitchfork
// Video: https://www.youtube.com/watch?v=GGS764OA5jM
// Source: https://app.crackingthecryptic.com/sudoku/f3m6QN7Gj2

// Normal Sudoku rules apply. R1C9 is a fortress cell, higher than each bordering
// white cell. All Kropki dots are given; none are drawn, so no unmarked adjacent
// pair is consecutive or in a 2:1 ratio.
return [
  new Shape('9x9'),
  new Given('R4C1', 8),
  new Given('R5C2', 4),
  new Given('R6C1', 2),
  new Given('R6C3', 5),
  new Given('R7C4', 8),
  new Given('R8C5', 4),
  // The grey square drawn at R1C9 borders R1C8 and R2C9.
  new GreaterThan('R1C9', 'R1C8'),
  new GreaterThan('R1C9', 'R2C9'),
  new StrictKropki(),
];
