// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=BmPfBjqzbck
// Source: https://cracking-the-cryptic.web.app/sudoku/4n2QBbdTDP

// No rules text in the payload (no metadata key at all); the video
// description names no rule either. Standard 3x3 box regions --
// Shape('9x9') supplies rows/columns/boxes, matching the 9 whole-box
// regions in the payload. No other clue types (lines, cages, arrows)
// appear in the payload; the puzzle is fully determined by its 27 givens
// below (transcribed from the payload's cell values).

return [
  new Shape('9x9'),

  new Given('R1C6', 8),
  new Given('R1C7', 6),
  new Given('R1C8', 1),
  new Given('R2C2', 1),
  new Given('R2C5', 3),
  new Given('R2C9', 7),
  new Given('R3C5', 7),
  new Given('R3C9', 9),
  new Given('R4C5', 8),
  new Given('R4C9', 4),
  new Given('R5C2', 9),
  new Given('R5C3', 6),
  new Given('R5C4', 1),
  new Given('R5C5', 4),
  new Given('R5C6', 7),
  new Given('R5C7', 3),
  new Given('R5C8', 5),
  new Given('R6C1', 5),
  new Given('R6C5', 6),
  new Given('R7C1', 6),
  new Given('R7C5', 1),
  new Given('R8C1', 9),
  new Given('R8C5', 2),
  new Given('R8C8', 7),
  new Given('R9C2', 8),
  new Given('R9C3', 3),
  new Given('R9C4', 4),
];
