// Title: XXXO
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=vsTcSz7HlT0
// Source: https://tinyurl.com/567hx8p3

// Classic sudoku: standard row, column and box all-different (the ISS
// default). The payload carries no lines, cages, or other overlays, so the
// only rule to encode is the given digits below (transcribed from the
// puzzle's drawn grid, row-major).
return [
  new Shape('9x9'),
  new Given('R1C2', 1), new Given('R1C3', 2), new Given('R1C6', 7), new Given('R1C7', 8),
  new Given('R2C4', 1), new Given('R2C5', 2), new Given('R2C9', 3),
  new Given('R3C1', 6), new Given('R3C9', 4),
  new Given('R4C1', 5), new Given('R4C5', 4), new Given('R4C8', 3),
  new Given('R5C2', 8), new Given('R5C5', 9), new Given('R5C8', 4),
  new Given('R6C2', 7), new Given('R6C5', 8), new Given('R6C9', 2),
  new Given('R7C1', 8), new Given('R7C9', 1),
  new Given('R8C1', 7), new Given('R8C5', 5), new Given('R8C6', 6),
  new Given('R9C3', 4), new Given('R9C4', 3), new Given('R9C7', 5), new Given('R9C8', 6),
];
