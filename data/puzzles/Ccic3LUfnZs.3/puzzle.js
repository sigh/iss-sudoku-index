// Title: Consecutive Circles Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Ccic3LUfnZs
// Source: https://app.crackingthecryptic.com/sudoku/j7qqn66P3L

// Normal sudoku rules apply. Each marked circle must contain a sequence of
// consecutive digits; the starting point and direction are unknown.
//
// The payload's underlays are two circle sizes. A `.5/.5` center sits on one
// cell; a whole-number center sits on a grid corner and spans the
// surrounding 2x2 block -- exactly double the small circle's bounding box,
// matching the doubled cell span (single-cell diagonal vs 2x2-block
// diagonal). The two large circles cover R2C2-R3C3 and R7C7-R8C8 (each a
// set of 4 cells, encoded below with Renban: consecutive, any order, since
// the rule gives no cell-to-cell adjacency order and states the
// start/direction are unknown).
//
// OMITTED: the two small circles (R3C7, R7C3) cover exactly one cell each,
// too small to hold a multi-digit "sequence," and nothing else in the
// payload indicates which neighbour cell(s), if any, they pair with; left
// unencoded rather than guessed.

return [
  new Shape('9x9'),

  // Givens, from the payload's cells array.
  new Given('R1C1', 1), new Given('R1C4', 2),
  new Given('R2C6', 5), new Given('R2C8', 8),
  new Given('R4C1', 3), new Given('R4C4', 1), new Given('R4C6', 6), new Given('R4C8', 7),
  new Given('R6C2', 8), new Given('R6C4', 7), new Given('R6C6', 9), new Given('R6C9', 4),
  new Given('R8C2', 5), new Given('R8C4', 6),
  new Given('R9C6', 1), new Given('R9C9', 9),

  // The two 2x2 consecutive-circle blocks.
  new Renban('R2C2', 'R2C3', 'R3C2', 'R3C3'),
  new Renban('R7C7', 'R7C8', 'R8C7', 'R8C8'),
];
