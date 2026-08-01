// Title: Difference Fences
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=GvhkWBhq2q0
// Source: https://app.crackingthecryptic.com/17rhp0owyb

// Normal Sudoku rules and the digits printed in each populated circle.
// The Difference Fence segment and total rules are omitted: the outlined source
// strokes do not declare each fence's cell-pair membership or total association.
return [
  new Shape('9x9'),
  // The populated circle/quad marks in the drawing.
  new Quad('R2C2', 2, 1),
  new Quad('R4C1', 1, 9),
  new Quad('R1C5', 1, 7),
  new Quad('R2C8', 1, 5),
  new Quad('R4C8', 1, 8),
  new Quad('R7C2', 1, 2),
];
