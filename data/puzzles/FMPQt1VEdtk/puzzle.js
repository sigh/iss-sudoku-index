// Title: Studying The Solving Of A Sudoku Genius
// Author: oku-yama
// Video: https://www.youtube.com/watch?v=FMPQt1VEdtk

// Rules: standard sudoku (Shape('9x9') supplies the row/column/box groups).
// No online source exists for this puzzle -- the video description names
// only "a championship puzzle from Nikoli.com" with no link, and the
// on-screen viewer (labelled "Extra" / "Author : oku-yama") has no source
// URL either. The 24 givens below are transcribed from the archived video
// frames' pristine starting grid (t=35s and t=90s are pixel-identical, so
// no digit has been placed yet by the presenter).
return [
  new Shape('9x9'),

  new Given('R2C2', 1),
  new Given('R2C4', 2),
  new Given('R2C6', 3),
  new Given('R2C8', 4),
  new Given('R3C3', 4),
  new Given('R3C5', 5),
  new Given('R3C7', 6),
  new Given('R4C2', 7),
  new Given('R4C4', 4),
  new Given('R4C6', 2),
  new Given('R4C8', 1),
  new Given('R5C3', 8),
  new Given('R5C7', 5),
  new Given('R6C2', 9),
  new Given('R6C4', 8),
  new Given('R6C6', 5),
  new Given('R6C8', 6),
  new Given('R7C3', 7),
  new Given('R7C5', 6),
  new Given('R7C7', 4),
  new Given('R8C2', 2),
  new Given('R8C4', 1),
  new Given('R8C6', 4),
  new Given('R8C8', 3),
];
