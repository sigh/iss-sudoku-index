// Title: Almost Was Good Enough
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=iOpRqAgRzb0
// Source: https://tinyurl.com/ye25dd3s

// Normal Sudoku with the source's 24 given digits.
const givens = [
  new Given('R1C2', 9),
  new Given('R2C6', 3), new Given('R2C7', 4), new Given('R2C9', 9),
  new Given('R3C2', 2), new Given('R3C5', 5), new Given('R3C6', 6),
  new Given('R4C2', 1), new Given('R4C3', 4), new Given('R4C4', 6),
  new Given('R4C6', 8), new Given('R5C3', 3), new Given('R5C7', 7),
  new Given('R6C4', 4), new Given('R6C6', 2), new Given('R6C7', 8),
  new Given('R6C8', 5), new Given('R7C4', 2), new Given('R7C5', 1),
  new Given('R7C8', 6), new Given('R8C1', 9), new Given('R8C3', 8),
  new Given('R8C4', 7), new Given('R9C8', 9),
];

return [
  new Shape('9x9'),
  ...givens,
];
