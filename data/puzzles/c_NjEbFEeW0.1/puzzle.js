// Title: Renban/Quadruples Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=c_NjEbFEeW0
// Source: https://app.crackingthecryptic.com/sudoku/3qG93JFb6M

// Normal sudoku rules (default rows/columns/3x3 boxes). Circles show digits
// that must each appear in at least one of the four touching cells (Quad).
// Grey lines carry a set of consecutive, non-repeating digits in any order
// (Renban). All quads and renban lines are drawn geometry; no rule text is
// omitted.

const quads = [
  new Quad('R1C1', 1, 3),
  new Quad('R4C5', 8),
  new Quad('R5C4', 2),
  new Quad('R3C3', 2, 4),
  new Quad('R5C1', 3, 5),
  new Quad('R7C3', 3, 5),
  new Quad('R6C6', 6, 8),
  new Quad('R2C6', 5, 7),
  new Quad('R4C8', 5, 7),
  new Quad('R8C8', 7, 9),
];

const renbans = [
  new Renban('R2C1', 'R1C1', 'R2C2', 'R1C2'),
  new Renban('R6C1', 'R5C1', 'R6C2', 'R5C2'),
  new Renban('R4C3', 'R3C3', 'R4C4', 'R3C4'),
  new Renban('R3C6', 'R2C6', 'R3C7', 'R2C7'),
  new Renban('R2C8', 'R1C8', 'R2C9', 'R1C9'),
  new Renban('R5C8', 'R4C8', 'R5C9', 'R4C9'),
  new Renban('R9C8', 'R8C8', 'R9C9', 'R8C9'),
  new Renban('R7C6', 'R6C6', 'R7C7', 'R6C7'),
  // Only 3 of quad R4C5's 4 cells lie on this line; R5C5 is the corner
  // shared with the R5C4 quad and is not part of either drawn line.
  new Renban('R4C5', 'R4C6', 'R5C6'),
  new Renban('R5C4', 'R6C4', 'R6C5'),
  new Renban('R8C3', 'R7C3', 'R8C4', 'R7C4'),
  new Renban('R9C1', 'R8C1', 'R9C2', 'R8C2'),
];

return [
  new Shape('9x9'),
  new Given('R1C9', 4),
  new Given('R9C1', 6),
  ...quads,
  ...renbans,
];
