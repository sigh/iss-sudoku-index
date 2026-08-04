// Title: 4 O'Clock
// Author: Just Kirb
// Video: https://www.youtube.com/watch?v=11ur_FXtSak
// Source: https://app.crackingthecryptic.com/sudoku/nnPMBR9jhR

// Normal sudoku rules apply, 9x9 with standard 3x3 boxes.
// "All dots are given" and no white/black dots are drawn anywhere: this is a
// global negative (StrictKropki), applied over the whole grid since there are
// no WhiteDot/BlackDot instances to exempt.
// The thermo is drawn as a "V" with its bulb at the vertex (R8C8) and two
// separate arms (to R7C9 and to R9C9); each arm is its own Thermo sharing the
// bulb cell, since Thermo binds a strictly-increasing sequence along one cell
// list and cannot branch.
// The grey square at R7C8 marks it even; encoded as a candidate-restricting
// Given, per catalog guidance (no dedicated Odd/Even class).

return [
  new Shape('9x9'),

  new Given('R2C8', 4),
  new Given('R5C5', 4),
  new Given('R8C2', 4),

  new StrictKropki(),

  new Thermo('R8C8', 'R7C9'),
  new Thermo('R8C8', 'R9C9'),

  new Given('R7C8', 2, 4, 6, 8),
];
