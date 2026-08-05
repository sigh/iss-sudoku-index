// Title: The Snake
// Author: Derektionary
// Video: https://www.youtube.com/watch?v=9b3cV5gBCUw
// Source: https://app.crackingthecryptic.com/sudoku/tndhn8j8mB

// Normal Sudoku rules apply. The green line is a whisper line; the two blue
// diagonals contain 1-9 once each; the `<` sign points to the smaller digit.
// Green-line cells transcribed from the drawn green path, in path order.
const snake = [
  'R9C1', 'R8C1', 'R8C2', 'R8C3', 'R7C3', 'R6C4', 'R6C3', 'R6C2',
  'R6C1', 'R5C2', 'R4C1', 'R3C2', 'R2C2', 'R2C3', 'R2C4', 'R3C5',
  'R3C6', 'R3C7', 'R2C8', 'R3C9', 'R4C8', 'R4C9', 'R5C9', 'R6C9',
  'R6C8', 'R6C7', 'R5C6', 'R4C5', 'R4C4',
];

return [
  new Shape('9x9'),
  new Whisper(5, ...snake),
  new Diagonal(1),
  new Diagonal(-1),
  // The drawn `<` on the R9C7/R9C8 edge points to R9C7.
  new GreaterThan('R9C8', 'R9C7'),
];
