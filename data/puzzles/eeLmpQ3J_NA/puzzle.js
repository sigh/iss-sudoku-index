// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=eeLmpQ3J_NA
// Source: https://cracking-the-cryptic.web.app/sudoku/Lj6T6nTt32

// Normal Sudoku rules apply (rows, columns and boxes). The raw payload
// carries no rules text at all (no metadata object). The only other drawn
// feature -- a 10-cell light-grey shaded polyomino inside/adjacent to box 1,
// which gives the video its title "Find that Shape! Hidden Clone Sudoku" --
// has no rules sentence or legend in the payload to say what the shading
// means (a translated/rotated/reflected clone elsewhere in the grid, or
// something else), so it is not encoded here.
const givens = [
  new Given('R1C1', 1),
  new Given('R1C3', 2),
  new Given('R2C2', 3),
  new Given('R2C6', 2),
  new Given('R2C9', 9),
  new Given('R3C1', 4),
  new Given('R3C5', 3),
  new Given('R3C8', 7),
  new Given('R3C9', 2),
  new Given('R5C3', 3),
  new Given('R5C9', 4),
  new Given('R6C2', 4),
  new Given('R6C8', 2),
  new Given('R6C9', 6),
  new Given('R8C3', 5),
  new Given('R8C6', 4),
  new Given('R8C8', 9),
  new Given('R8C9', 7),
  new Given('R9C2', 9),
  new Given('R9C3', 6),
  new Given('R9C5', 5),
  new Given('R9C6', 7),
  new Given('R9C8', 8),
];

return [
  new Shape('9x9'),
  ...givens,
];
