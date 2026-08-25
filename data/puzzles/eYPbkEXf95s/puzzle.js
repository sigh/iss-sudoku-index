// Title: Give me an X ... !
// Author: Andy Petersen
// Video: https://www.youtube.com/watch?v=eYPbkEXf95s
// Source: https://app.crackingthecryptic.com/sudoku/Gn9FmJ4q23

// Normal sudoku rules apply (9x9, default boxes). An X on the border between
// two orthogonally neighbouring cells means that pair sums to 10; a V means
// the pair sums to 5. "All Xs and Vs are given" is an exhaustiveness clause:
// every orthogonally neighbouring pair with no drawn mark is constrained to
// sum to neither 10 nor 5. The source payload carries no line/arrow/overlay/
// underlay/bgimage geometry at all, so no marks are drawn anywhere in it;
// under the exhaustiveness clause read literally against that, every
// neighbouring pair in the grid is unmarked and so forbidden from summing to
// 5 or 10. StrictXV is ISS's native class for exactly this global negative
// (only explicitly marked pairs satisfy XV sums; here there are zero marked
// pairs, so no pair may sum to 5 or 10).
return [
  new Shape('9x9'),

  // Givens, transcribed from the source's per-cell values.
  new Given('R1C1', 8),
  new Given('R1C3', 5),
  new Given('R2C2', 1),
  new Given('R2C5', 3),
  new Given('R3C4', 8),
  new Given('R3C9', 1),
  new Given('R4C1', 6),
  new Given('R5C2', 2),
  new Given('R5C8', 4),
  new Given('R6C7', 8),
  new Given('R7C1', 4),
  new Given('R7C4', 6),
  new Given('R8C5', 2),
  new Given('R8C8', 3),
  new Given('R9C7', 6),

  new StrictXV(),
];
