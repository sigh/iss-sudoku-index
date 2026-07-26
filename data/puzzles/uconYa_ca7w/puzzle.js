// Title: Stay in Your Box
// Author: Marty Sears and Justin Vitanza
// Video: https://www.youtube.com/watch?v=uconYa_ca7w
// Source: https://sudokupad.app/j0e1hqfsp4

// Normal sudoku only. The puzzle's core mechanic -- an invisible 9-cell
// "index line" discovered per box, a hidden diamond at one end of it, and an
// indexing rule keyed to a digit's position along that line -- is omitted.
// It requires ordering/position along a solver-discovered path, which is not
// expressible in ISS (see the omitted_rules note). Only the drawn black and
// green spots are encoded below; they are independent of the line/indexing
// mechanic.
//
// SPOTS: a black spot between two orthogonally adjacent cells is a Kropki
// 1:2 ratio (BlackDot). A green spot between two orthogonally adjacent cells
// is a difference of at least 5 (Whisper(5) over just the pair). Cell pairs
// are read from the drawn edge overlays, grouped by their fill colour
// (green vs. black).

return [
  new Shape('9x9'),

  // Black spots (1:2 ratio), 3 total.
  new BlackDot('R5C9', 'R6C9'),
  new BlackDot('R4C4', 'R5C4'),
  new BlackDot('R4C2', 'R5C2'),

  // Green spots (difference >= 5), 6 total.
  new Whisper(5, 'R1C1', 'R1C2'),
  new Whisper(5, 'R1C5', 'R1C6'),
  new Whisper(5, 'R5C2', 'R5C3'),
  new Whisper(5, 'R4C7', 'R5C7'),
  new Whisper(5, 'R7C5', 'R7C6'),
  new Whisper(5, 'R7C8', 'R8C8'),
];
