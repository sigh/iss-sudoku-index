// Title: Choose your fav. cage total
// Author: Sumanta (ANU)
// Video: https://www.youtube.com/watch?v=63CHpW3HPno
// Source: https://app.crackingthecryptic.com/M7JdLN3P98

// Normal Sudoku rules apply. One total from 7, 8, 12, and 13 is chosen, and
// every drawn two-cell cage sums to that same total. Thermometers increase from
// their grey circular bulbs; white dots join consecutive digits.
// The cell pairs below are transcribed from the sixteen outlined cages.
const cages = [
  ['R1C1', 'R2C1'], ['R1C2', 'R2C2'], ['R1C3', 'R1C4'],
  ['R3C1', 'R4C1'], ['R4C2', 'R4C3'], ['R5C3', 'R6C3'],
  ['R6C4', 'R6C5'], ['R7C5', 'R8C5'], ['R8C6', 'R8C7'],
  ['R8C9', 'R9C9'], ['R8C8', 'R9C8'], ['R7C8', 'R6C8'],
  ['R5C8', 'R5C7'], ['R5C6', 'R4C6'], ['R3C6', 'R3C5'],
  ['R2C4', 'R3C4'],
];

const chosenTotal = new Or([7, 8, 12, 13].map(total => new And(
  cages.map(cells => new Sum(total, ...cells))
)));

// These ordered paths are transcribed from the grey bulb-and-line drawings.
const thermos = [
  new Thermo('R1C4', 'R2C4', 'R3C4', 'R4C3'),
  new Thermo('R2C8', 'R3C8', 'R4C8'),
  new Thermo('R5C6', 'R5C7', 'R6C8'),
  new Thermo('R6C6', 'R7C7'),
  new Thermo('R8C3', 'R8C4'),
  new Thermo('R6C3', 'R6C4'),
];

// These adjacent pairs are transcribed from the four white dots.
const whiteDots = [
  new WhiteDot('R2C1', 'R2C2'),
  new WhiteDot('R3C6', 'R4C6'),
  new WhiteDot('R6C5', 'R7C5'),
  new WhiteDot('R8C8', 'R8C9'),
];

return [
  new Shape('9x9'),
  chosenTotal,
  ...thermos,
  ...whiteDots,
];
