// Title: Renan Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=-gNGoQCrPps
// Source: https://sudokupad.app/ifq6fsm9l3
//
// Normal sudoku rules apply (default rows/cols/3x3 boxes, matching the
// payload's drawn `regions`). Each of the 7 shaded (grey) regions must
// contain a set of consecutive, non-repeating digits -- Renban.

return [
  new Shape('9x9'),

  new Given('R1C3', 9),
  new Given('R2C2', 4),
  new Given('R3C1', 8),
  new Given('R3C5', 3),
  new Given('R3C9', 6),
  new Given('R4C4', 2),
  new Given('R4C8', 4),
  new Given('R5C3', 1),
  new Given('R5C7', 8),
  new Given('R7C5', 4),
  new Given('R7C9', 3),
  new Given('R8C4', 7),
  new Given('R8C8', 6),
  new Given('R9C3', 8),
  new Given('R9C7', 4),

  // 7 shaded regions recovered from the payload's grey underlays, grouped by
  // orthogonal adjacency. Renban is set-based (any order), so cell order
  // within each does not matter.
  new Renban('R2C3', 'R3C2', 'R3C3', 'R3C4', 'R4C3'),
  new Renban('R1C6', 'R2C6', 'R3C6', 'R3C7', 'R3C8'),
  new Renban('R6C1', 'R6C2', 'R6C3', 'R7C3', 'R8C3'),
  new Renban('R5C5', 'R5C6', 'R6C5', 'R6C6'),
  new Renban('R8C5', 'R8C6', 'R9C6'),
  new Renban('R8C9', 'R9C8', 'R9C9'),
  new Renban('R5C8', 'R6C8', 'R6C9'),
];
