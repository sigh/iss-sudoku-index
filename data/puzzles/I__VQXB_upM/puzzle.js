// Title: Set for Success
// Author: Hannah
// Video: https://www.youtube.com/watch?v=I__VQXB_upM
// Source: https://app.crackingthecryptic.com/rs13m71s1o

// Normal Sudoku rules apply. Arrow arms sum to their circles, and white dots
// join orthogonally adjacent consecutive digits.
const arrows = [
  new Arrow('R4C9', 'R3C8', 'R2C8', 'R2C7'),
  new Arrow('R3C2', 'R2C1', 'R1C1'),
  new Arrow('R3C4', 'R4C5', 'R5C5', 'R6C5'),
  new Arrow('R6C2', 'R7C1', 'R8C1', 'R9C1'),
  new Arrow('R6C9', 'R7C8', 'R7C7'),
];

// White-dot pairs transcribed from the nine white edge marks.
const whiteDots = [
  ['R3C8', 'R4C8'], ['R2C6', 'R3C6'], ['R4C4', 'R4C5'],
  ['R2C3', 'R2C4'], ['R1C3', 'R2C3'], ['R4C1', 'R4C2'],
  ['R9C1', 'R9C2'], ['R8C3', 'R8C4'], ['R8C7', 'R9C7'],
];

return [
  new Shape('9x9'),
  new Given('R3C9', 9),
  new Given('R5C9', 4),
  new Given('R8C5', 4),
  ...arrows,
  ...whiteDots.map(pair => new WhiteDot(...pair)),
];
