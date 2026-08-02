// Title: 9/14/23: Anticlone Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=NlyLUsi0lcs
// Source: https://tinyurl.com/yrwyuk3f

// Normal Sudoku with the drawn givens. Identical coloured shapes cannot share
// a digit; each AllDifferent lists every cell from one shape class. Rotated
// copies belong to the same class, as stated in the rules.
return [
  new Shape('9x9'),
  new Given('R1C3', 3), new Given('R1C5', 7), new Given('R1C6', 8), new Given('R1C9', 2),
  new Given('R2C3', 7), new Given('R2C9', 8),
  new Given('R3C3', 1), new Given('R3C4', 2), new Given('R3C8', 9),
  new Given('R4C8', 7),
  new Given('R5C2', 5), new Given('R5C8', 6),
  new Given('R6C2', 7),
  new Given('R7C2', 2), new Given('R7C6', 3), new Given('R7C7', 4),
  new Given('R8C1', 7),
  new Given('R9C1', 4), new Given('R9C4', 5), new Given('R9C5', 6), new Given('R9C7', 2),

  // Pink horizontal 3-cell bars from the drawing.
  new AllDifferent('R3C2', 'R3C3', 'R3C4', 'R5C4', 'R5C5', 'R5C6', 'R7C6', 'R7C7', 'R7C8'),
  // Gold horizontal dominoes from the drawing.
  new AllDifferent('R1C3', 'R1C4', 'R5C1', 'R5C2', 'R5C8', 'R5C9', 'R9C6', 'R9C7'),
  // Pale-gold horizontal 4-cell bars from the drawing.
  new AllDifferent('R1C6', 'R1C7', 'R1C8', 'R1C9', 'R9C1', 'R9C2', 'R9C3', 'R9C4'),
  // Green 2x2 squares from the drawing.
  new AllDifferent('R2C8', 'R2C9', 'R3C8', 'R3C9', 'R7C1', 'R7C2', 'R8C1', 'R8C2'),
  // Purple L triominoes from the drawing; the copies are rotated.
  new AllDifferent('R2C5', 'R3C5', 'R3C6', 'R7C4', 'R7C5', 'R8C5'),
];
