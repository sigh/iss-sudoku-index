// Title: Once and For All
// Author: 99%Sneaky
// Video: https://www.youtube.com/watch?v=arwrroERaz0
// Source: https://sudokupad.app/tjl67sygqk

// Every clue family is globally all-different in addition to its local rule.
const greySquares = ['R2C2', 'R2C8', 'R8C2', 'R8C8'];
const greyCircles = ['R1C5', 'R5C1', 'R5C5', 'R5C9', 'R9C5'];
const whiteDotPairs = [
  ['R2C6', 'R2C7'],
  ['R3C8', 'R4C8'],
  ['R1C2', 'R1C3'],
  ['R7C5', 'R7C6'],
];
const blackDotPairs = [
  ['R3C2', 'R4C2'],
  ['R8C3', 'R8C4'],
  ['R6C8', 'R7C8'],
];
const orangeLines = [
  ['R2C3', 'R3C2'],
  ['R2C7', 'R3C8'],
  ['R7C8', 'R8C7'],
  ['R7C2', 'R8C3'],
];

return [
  new Shape('9x9'),
  new Given('R3C7', 3),
  new Given('R6C7', 7),
  new Given('R7C3', 3),

  ...greySquares.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...greyCircles.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...whiteDotPairs.map(cells => new WhiteDot(...cells)),
  ...blackDotPairs.map(cells => new BlackDot(...cells)),
  ...orangeLines.map(cells => new Whisper(4, ...cells)),

  new AllDifferent(...greySquares),
  new AllDifferent(...greyCircles),
  new AllDifferent(...whiteDotPairs.flat()),
  new AllDifferent(...blackDotPairs.flat()),
  new AllDifferent(...orangeLines.flat()),
];
