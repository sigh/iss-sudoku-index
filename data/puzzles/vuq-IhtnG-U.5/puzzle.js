// Title: Ceci n'est pas un cliche.
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=vuq-IhtnG-U
// Source: https://tinyurl.com/ytuarbaf

// Normal Sudoku Rules Apply. No cages, lines, or other variant geometry are
// present in the payload; this is a classic sudoku with default row, column,
// and 3x3 box all-different constraints.
return [
  new Shape('9x9'),

  // Givens, transcribed from the payload's grid array.
  new Given('R1C1', 7), new Given('R1C5', 5), new Given('R1C9', 4),
  new Given('R2C4', 6), new Given('R2C5', 7), new Given('R2C6', 3),
  new Given('R3C3', 1), new Given('R3C7', 2),
  new Given('R4C2', 2), new Given('R4C8', 7),
  new Given('R5C1', 5), new Given('R5C2', 3), new Given('R5C8', 8), new Given('R5C9', 9),
  new Given('R6C2', 6), new Given('R6C8', 4),
  new Given('R7C3', 4), new Given('R7C7', 3),
  new Given('R8C4', 1), new Given('R8C5', 2), new Given('R8C6', 9),
  new Given('R9C1', 6), new Given('R9C5', 8), new Given('R9C9', 1),
];
