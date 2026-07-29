// Title: Inner Harmony
// Author: Allagem
// Video: https://www.youtube.com/watch?v=sKE0fYErsmY
// Source: https://app.crackingthecryptic.com/b7jGb3bhDJ

// Standard Sudoku. Each grey line is strictly increasing in either drawn
// direction. The white dot is consecutive and the black dot is a 1:2 ratio.

const lines = [
  ['R2C3', 'R1C3', 'R1C4', 'R2C4'],
  ['R1C5', 'R1C6', 'R2C6', 'R2C5'],
  ['R3C2', 'R3C1', 'R4C1', 'R5C1', 'R6C1'],
  ['R3C5', 'R3C4', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8'],
  ['R3C8', 'R3C9', 'R4C9', 'R5C9', 'R6C9'],
  ['R6C3', 'R6C4', 'R6C5', 'R6C6', 'R7C6', 'R7C5'],
  ['R7C2', 'R8C2', 'R8C3', 'R7C3'],
  ['R8C5', 'R8C4', 'R9C4', 'R9C5'],
  ['R7C8', 'R7C7', 'R8C7', 'R8C8'],
];

const eitherDirection = lines.map(cells => new Or([
  new Thermo(...cells),
  new Thermo(...[...cells].reverse()),
]));

return [
  new Shape('9x9'),
  ...eitherDirection,
  new WhiteDot('R5C1', 'R5C2'),
  new BlackDot('R5C7', 'R5C8'),
];
