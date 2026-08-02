// Title: Aug 30, 2023: XV
// Author: Freddie Hand
// Video: https://www.youtube.com/watch?v=kxQ8kZVi7l4
// Source: https://tinyurl.com/3a3eeb4h

// Normal Sudoku. All orthogonally adjacent pairs summing to 10 or 5 are,
// respectively, X- or V-marked; the listed marks are therefore exhaustive.
return [
  new Shape('9x9'),
  new Given('R1C5', 2), new Given('R1C7', 3), new Given('R2C6', 3),
  new Given('R3C1', 6), new Given('R3C2', 3), new Given('R3C5', 8), new Given('R3C7', 1),
  new Given('R5C4', 6), new Given('R5C6', 7),
  new Given('R7C3', 5), new Given('R7C5', 6), new Given('R7C8', 4), new Given('R7C9', 7),
  new Given('R8C4', 1), new Given('R9C3', 6), new Given('R9C5', 4),

  // Drawn X and V marks, transcribed from the source payload.
  new X('R1C2', 'R1C3'), new X('R9C6', 'R9C7'), new X('R4C3', 'R4C4'), new X('R6C5', 'R6C6'),
  new V('R1C3', 'R1C4'), new V('R9C7', 'R9C8'), new V('R4C4', 'R4C5'), new V('R6C6', 'R6C7'),
  new StrictXV(),
];
