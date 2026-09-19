// Title: Extra
// Author: T.Karino
// Video: https://www.youtube.com/watch?v=R4SM57ttA_w

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// Givens transcribed from the on-screen grid (external-video-frame-35s.jpg,
// corroborated by external-video-frame-90s.jpg -- both frames show an
// identical, unsolved starting grid).

return [
  new Shape('9x9'),
  new Given('R1C3', 3),
  new Given('R1C4', 1),
  new Given('R2C2', 5),
  new Given('R2C5', 8),
  new Given('R2C7', 9),
  new Given('R3C2', 4),
  new Given('R3C5', 7),
  new Given('R3C8', 6),
  new Given('R4C3', 8),
  new Given('R4C4', 4),
  new Given('R4C9', 7),
  new Given('R6C1', 1),
  new Given('R6C6', 5),
  new Given('R6C7', 3),
  new Given('R7C2', 1),
  new Given('R7C5', 2),
  new Given('R7C8', 4),
  new Given('R8C3', 7),
  new Given('R8C5', 1),
  new Given('R8C8', 8),
  new Given('R9C6', 9),
  new Given('R9C7', 6),
];
