// Title: Cracking 500k
// Author: Nightcrauler
// Video: https://www.youtube.com/watch?v=VNByR4IhwWc
// Source: https://app.crackingthecryptic.com/sudoku/bF4BQdF7GP

// Standard Sudoku, R9C1=5, marked white-dot/X dominoes, odd grey circles,
// purple renban lines, grey thermometers (bulb first), and green whisper lines.
// The rules explicitly say not all dots and Xs are given, so no negative domino
// constraints are added.
const oddCircles = ['R1C9', 'R3C3', 'R9C2', 'R9C3'];
const whispers = [
  ['R1C4', 'R1C5', 'R1C6'],
  ['R1C5', 'R2C5', 'R3C5'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R4C9', 'R4C8', 'R4C7'],
  ['R6C7', 'R6C8', 'R6C9'],
];

return [
  new Shape('9x9'),
  new Given('R9C1', 5),
  ...oddCircles.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  // The two drawn white dots.
  new WhiteDot('R7C5', 'R7C6'),
  new WhiteDot('R7C6', 'R8C6'),
  // The two drawn X marks.
  new X('R8C6', 'R9C6'),
  new X('R8C4', 'R9C4'),
  // Purple line paths transcribed from the drawing.
  new Renban('R4C7', 'R5C7', 'R5C8', 'R5C9', 'R6C9'),
  new Renban('R6C1', 'R5C1', 'R4C1', 'R5C2', 'R4C3', 'R5C3', 'R6C3'),
  // Grey circular bulbs identify the first cell of each thermometer.
  new Thermo('R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'),
  new Thermo('R1C9', 'R1C8', 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9'),
  ...whispers.map(line => new Whisper(5, ...line)),
];
