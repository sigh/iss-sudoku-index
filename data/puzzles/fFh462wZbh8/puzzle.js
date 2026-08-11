// Title: Ball Pit
// Author: Marvin Kannhauser
// Video: https://www.youtube.com/watch?v=fFh462wZbh8
// Source: https://app.crackingthecryptic.com/sudoku/7Qt3HNR2Pj

// Normal sudoku rules apply (default Shape regions/rows/cols/boxes). The
// numbers in white circles must appear in the four surrounding cells (Quad,
// anchored at the 2x2's top-left cell, per its own DESCRIPTION). Cells
// separated by an X sum to 10 (X). Cells separated by a white dot must be
// consecutive (WhiteDot). Not all possible Xs/dots are given, so no negative
// constraint is added to unmarked adjacent pairs.
//
// Quad/dot/X cell tables below are hand-transcribed from the source's own
// overlay coordinates, cross-checked against an independent geometry
// readout of the same payload.

return [
  new Shape('9x9'),

  // Quadruple circles: [topLeftCell, ...requiredValues]
  new Quad('R1C2', 3),
  new Quad('R2C1', 1, 4),
  new Quad('R2C4', 6),
  new Quad('R1C5', 4, 7),
  new Quad('R1C7', 3, 6),
  new Quad('R4C1', 1, 5),
  new Quad('R5C4', 7),
  new Quad('R4C5', 5, 8),
  new Quad('R8C2', 1),
  new Quad('R8C4', 2),
  new Quad('R8C7', 1),
  new Quad('R7C8', 2),
  new Quad('R5C8', 3, 6),
  new Quad('R2C8', 2),

  // White dots: consecutive digits
  new WhiteDot('R1C1', 'R2C1'),
  new WhiteDot('R3C1', 'R3C2'),
  new WhiteDot('R3C3', 'R3C4'),
  new WhiteDot('R6C3', 'R7C3'),
  new WhiteDot('R8C3', 'R9C3'),
  new WhiteDot('R8C1', 'R9C1'),
  new WhiteDot('R4C5', 'R5C5'),
  new WhiteDot('R5C8', 'R5C9'),
  new WhiteDot('R7C8', 'R7C9'),
  new WhiteDot('R9C7', 'R9C8'),
  new WhiteDot('R1C6', 'R2C6'),
  new WhiteDot('R1C7', 'R2C7'),

  // X marks: digits sum to 10
  new X('R3C3', 'R4C3'),
  new X('R6C3', 'R6C4'),
  new X('R3C8', 'R4C8'),
];
