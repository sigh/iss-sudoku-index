// Title: Mean World Syndrome
// Author: Miky
// Video: https://www.youtube.com/watch?v=gvi2UEgEjDE
// Source: https://app.crackingthecryptic.com/sudoku/493Jt84qfp

// Normal sudoku rules apply. Circled digits must be the mean (average) of
// any arrows that leave the circle: for each arrow leaving a circle, the
// circle's digit equals the mean of the digits on that arrow's arm. Black
// dots hold a 1:2 ratio; white dots hold consecutive digits; not all
// possible dots are drawn (an undrawn edge carries no information, so no
// negative dot constraint is added).
//
// Each circle-mean arrow is encoded as a linear Sum: the arm cells sum to
// (arm length) times the circle's value. `Sum(0, ...armCells, [circle, -n])`
// enforces armSum - n*circle = 0, i.e. circle = mean(armCells). Circle R5C7
// has three arrows leaving it, so it gets three independent Sum constraints.
const meanArrows = [
  // [circleCell, ...armCells]
  ['R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'],
  ['R6C9', 'R5C9', 'R4C9'],
  ['R3C9', 'R2C9', 'R1C9'],
  ['R1C7', 'R1C6', 'R1C5'],
  ['R1C4', 'R1C3', 'R1C2'],
  ['R3C1', 'R4C1', 'R5C1'],
  ['R6C1', 'R7C1', 'R8C1'],
  ['R5C7', 'R6C6', 'R6C5', 'R6C4'],
  ['R5C7', 'R4C6', 'R4C5'],
  ['R5C7', 'R5C8', 'R6C8'],
  ['R1C8', 'R2C7', 'R3C7'],
  ['R2C4', 'R3C4', 'R4C3'],
  ['R5C3', 'R6C2', 'R7C3'],
  ['R8C3', 'R8C4', 'R8C5', 'R7C5'],
];

const meanSums = meanArrows.map(([circle, ...arm]) =>
  new Sum(0, ...arm, [circle, -arm.length]));

return [
  new Shape('9x9'),
  new Given('R7C7', 2),

  ...meanSums,

  // Black dots (1:2 ratio); white dot (consecutive). Not all possible dots
  // are given, so absence of a dot is not encoded.
  new BlackDot('R7C9', 'R8C9'),
  new BlackDot('R1C1', 'R2C1'),
  new BlackDot('R9C2', 'R9C3'),
  new WhiteDot('R9C5', 'R9C6'),
];
