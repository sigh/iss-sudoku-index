// Title: Shrug
// Author: zetamath
// Video: https://www.youtube.com/watch?v=igIyFjbZDPc
// Source: https://app.crackingthecryptic.com/sudoku/hTbTbQ2g7F

// Normal sudoku rules apply (standard 3x3 boxes, default row/col/box
// all-different). Each drawn line must be broken into one or more
// contiguous, non-overlapping strings of cells that each sum to 10; digits
// may repeat freely on a line, including within one string. That is exactly
// SumLine(10, ...): "the line can be divided into segments that each sum to
// the given sum." No extra distinctness is added along the lines.
//
// Every line is drawn twice, once in white and once in a lighter grey
// directly on top with the same cell path -- a cosmetic outline duplicate,
// not a second clue -- so each is encoded once. A 19th `lines` entry carries
// styling but no coordinates and draws nothing, so it is not a clue.

return [
  new Shape('9x9'),
  new Given('R9C4', 7),

  new SumLine(10, 'R7C1', 'R7C2', 'R8C3', 'R7C3', 'R6C3'),
  new SumLine(10, 'R1C1', 'R1C2', 'R1C3', 'R2C2', 'R3C1', 'R3C2', 'R3C3'),
  new SumLine(10, 'R6C4', 'R7C4', 'R7C5', 'R7C6', 'R6C6'),
  new SumLine(10, 'R4C3', 'R5C4', 'R6C5', 'R5C6', 'R4C7'),
  new SumLine(10, 'R3C4', 'R4C4', 'R4C5', 'R4C6', 'R3C6'),
  // Closed loop (way-points repeat the start cell): use the 'LOOP' marker
  // rather than repeating the first cell, so the wrap-around segment is
  // also a valid partition boundary/run.
  new SumLine(10, 'R2C4', 'R1C5', 'R2C6', 'R2C5', 'LOOP'),
  new SumLine(10, 'R1C9', 'R1C8', 'R1C7', 'R2C8', 'R3C9', 'R3C8', 'R3C7'),
  new SumLine(10, 'R4C8', 'R5C9', 'R6C8'),
  new SumLine(10, 'R7C7', 'R8C6', 'R9C7', 'R8C8', 'R8C9'),
];
