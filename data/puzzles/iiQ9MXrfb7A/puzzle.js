// Title: Antidote
// Author: shye
// Video: https://www.youtube.com/watch?v=iiQ9MXrfb7A
// Source: https://app.crackingthecryptic.com/sudoku/JdR6PQFn3g

// Normal Sudoku rules apply. The drawn blue / diagonal has no repeated digit.
return [
  new Shape('9x9'),
  new Given('R1C1', 8), new Given('R1C3', 3), new Given('R1C4', 7),
  new Given('R1C5', 6), new Given('R2C2', 2), new Given('R2C7', 6),
  new Given('R3C1', 1), new Given('R3C4', 5), new Given('R3C8', 7),
  new Given('R4C1', 5), new Given('R4C3', 8), new Given('R5C1', 9),
  new Given('R5C9', 7), new Given('R6C7', 4), new Given('R6C9', 6),
  new Given('R7C2', 8), new Given('R7C6', 9), new Given('R7C9', 3),
  new Given('R8C3', 9), new Given('R8C8', 2), new Given('R9C5', 8),
  new Given('R9C6', 4), new Given('R9C7', 1),
  new Diagonal(1),
];
