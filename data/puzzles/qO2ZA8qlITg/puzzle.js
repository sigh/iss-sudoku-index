// Title: Dominoes Apartment!
// Author: Halen McKenzie
// Video: https://www.youtube.com/watch?v=qO2ZA8qlITg
// Source: https://app.crackingthecryptic.com/JRLqn2jQpJ

// Place 1-8 in each row, column, and 2x4 box. Black dots have a 1:2 ratio;
// white dots are consecutive; Xs sum to 10; and Vs sum to 5. The rules say
// not all dots are given, so no negative Kropki rule is added.
// Dot and XV coordinates are transcribed from the drawn edge marks.
const whiteDots = [
  ['R4C5', 'R5C5'], ['R4C1', 'R5C1'], ['R5C2', 'R5C3'],
  ['R7C3', 'R7C4'], ['R5C5', 'R6C5'], ['R3C7', 'R3C8'],
];
const blackDots = [
  ['R3C1', 'R3C2'], ['R5C3', 'R6C3'], ['R2C3', 'R3C3'],
  ['R1C3', 'R2C3'], ['R7C4', 'R7C5'], ['R7C4', 'R8C4'],
  ['R8C5', 'R8C6'], ['R5C8', 'R6C8'], ['R1C7', 'R2C7'],
  ['R3C6', 'R3C7'], ['R8C1', 'R8C2'],
];
const vs = [['R3C1', 'R4C1'], ['R3C2', 'R4C2']];
const xs = [['R8C4', 'R8C5'], ['R5C2', 'R6C2']];

return [
  new Shape('8x8'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...vs.map(cells => new V(...cells)),
  ...xs.map(cells => new X(...cells)),
];
