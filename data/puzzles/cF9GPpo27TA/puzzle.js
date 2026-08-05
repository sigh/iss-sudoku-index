// Title: Can't Teach An Old Dog...
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=cF9GPpo27TA
// Source: https://app.crackingthecryptic.com/sudoku/Fm8N6pB2mn

// Normal sudoku rules apply. The given digits are transcribed from the grid.
return [
  new Shape('9x9'),
  new Given('R1C1', 5), new Given('R1C2', 4), new Given('R1C8', 6), new Given('R1C9', 9),
  new Given('R2C1', 7), new Given('R2C4', 1), new Given('R2C9', 5),
  new Given('R3C5', 3),
  new Given('R4C2', 2), new Given('R4C6', 4),
  new Given('R5C3', 6), new Given('R5C7', 4),
  new Given('R6C4', 9), new Given('R6C8', 2),
  new Given('R7C5', 5),
  new Given('R8C1', 8), new Given('R8C6', 1), new Given('R8C9', 6),
  new Given('R9C1', 4), new Given('R9C2', 7), new Given('R9C8', 3), new Given('R9C9', 8),
];
