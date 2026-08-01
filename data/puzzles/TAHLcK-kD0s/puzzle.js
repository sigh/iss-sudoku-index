// Title: Pause the video.... Congrats
// Author: apiyo
// Video: https://www.youtube.com/watch?v=TAHLcK-kD0s
// Source: https://app.crackingthecryptic.com/cjjw4ss931

// Normal Sudoku. Digits a knight's move apart differ. Grey thermometers rise
// from their circled ends; purple lines are Renban lines. Each orange
// double-arrow's endpoint circles sum to its intervening cells. The diagonal
// AGADMATOR letters are equal by letter and different between letters; the
// corner M is the difference between R6C6 and R7C7.

const thermometers = [
  ['R1C6', 'R1C7'],
  ['R9C3', 'R9C4'],
  ['R5C5', 'R4C5'],
];

// Purple paths transcribed from the six separately drawn lines.
const renbans = [
  ['R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4'],
  ['R7C6', 'R6C6', 'R5C6', 'R4C6', 'R3C6'],
  ['R2C7', 'R3C7'],
  ['R2C8', 'R3C8'],
  ['R7C2', 'R8C2'],
  ['R7C3', 'R8C3'],
];

// Orange endpoint circles and the cells between them, in drawn path order.
const doubleArrows = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6'],
  ['R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...thermometers.map(cells => new Thermo(...cells)),
  ...renbans.map(cells => new Renban(...cells)),
  ...doubleArrows.map(cells => new DoubleArrow(...cells)),

  // The corner letter has no grid cell, so VM holds its 1-9 digit.
  new Var('M', 'corner M', 1),
  new SameValues(3, 'R3C3', 'R5C5', 'R8C8'), // A cells on the diagonal
  new AllDifferent('R1C1', 'R2C2', 'R3C3', 'R4C4', 'R6C6', 'VM', 'R9C9'),
  // M is the positive difference; either orientation of the two named cells applies.
  new Or([
    new EqualSum(['R6C6'], ['R7C7', 'VM']),
    new EqualSum(['R7C7'], ['R6C6', 'VM']),
  ]),
];
