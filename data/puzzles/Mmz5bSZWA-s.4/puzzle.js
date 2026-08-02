// Title: I Remember A Time
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=Mmz5bSZWA-s
// Source: https://tinyurl.com/3kusezn2

// Normal Sudoku with the nine drawn givens. Orange circles are 1, 2, or 3;
// blue squares are 4, 5, or 6. The cell lists transcribe the corresponding marks.
const orangeCircles = [
  'R1C1', 'R1C2', 'R1C9', 'R2C1', 'R2C6', 'R2C8', 'R3C5', 'R3C6', 'R3C7',
  'R4C3', 'R4C4', 'R4C5', 'R5C2', 'R5C4', 'R5C9', 'R6C1', 'R6C8', 'R6C9',
  'R7C6', 'R7C7', 'R7C8', 'R8C3', 'R8C5', 'R8C7', 'R9C2', 'R9C3', 'R9C4',
];
const blueSquares = [
  'R1C3', 'R1C4', 'R1C5', 'R2C2', 'R2C4', 'R2C9', 'R3C1', 'R3C8', 'R3C9',
  'R4C6', 'R4C7', 'R4C8', 'R5C3', 'R5C5', 'R5C7', 'R6C2', 'R6C3', 'R6C4',
  'R7C1', 'R7C2', 'R7C9', 'R8C1', 'R8C6', 'R8C8', 'R9C5', 'R9C6', 'R9C7',
];

return [
  new Shape('9x9'),
  new Given('R3C1', 4), new Given('R3C4', 7), new Given('R3C7', 2),
  new Given('R6C1', 1), new Given('R6C4', 5), new Given('R6C7', 8),
  new Given('R9C1', 9), new Given('R9C4', 3), new Given('R9C7', 6),
  ...orangeCircles.map(cell => new Given(cell, 1, 2, 3)),
  ...blueSquares.map(cell => new Given(cell, 4, 5, 6)),
];
