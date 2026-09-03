// Title: Choose your fav. cage total
// Author: Sumanta (ANU)
// Video: https://www.youtube.com/watch?v=63CHpW3HPno
// Source: https://app.crackingthecryptic.com/M7JdLN3P98

// Rules:
//   Normal sudoku rules apply.
//   Choose a number out of the four numbers 7, 8, 12, and 13. The sum of the
//     digits in each cage is the number you have chosen.
//   Along a thermometer, digits increase from the bulb to the tip.
//   A white dot connects consecutive digits.
//
// The chosen total is fixed by the solver before solving, and nothing drawn
// says which of the four values it is. The encoding therefore disjoins over the
// four choices, which is weaker than the rule as a solver applies it: it admits
// one completed grid per choosable total instead of the single grid that
// follows once a value has been picked.

// The 16 cages drawn on the board, each a domino, in the payload's order.
const cages = [
  ['R1C1', 'R2C1'],
  ['R1C2', 'R2C2'],
  ['R1C3', 'R1C4'],
  ['R3C1', 'R4C1'],
  ['R4C2', 'R4C3'],
  ['R5C3', 'R6C3'],
  ['R6C4', 'R6C5'],
  ['R7C5', 'R8C5'],
  ['R8C6', 'R8C7'],
  ['R8C9', 'R9C9'],
  ['R8C8', 'R9C8'],
  ['R7C8', 'R6C8'],
  ['R5C8', 'R5C7'],
  ['R5C6', 'R4C6'],
  ['R3C6', 'R3C5'],
  ['R2C4', 'R3C4'],
];

// Sum rather than Cage: the rules state a total and say nothing about repeats
// within a cage. (Every drawn cage lies inside one row or one column, so
// sudoku already keeps its two digits apart.)
const chosenTotal = new Or(
  [7, 8, 12, 13].map(
    total => new And(cages.map(cells => new Sum(total, ...cells)))));

// Thermometers: bulb first, in drawn order. Each is a grey stroke starting at
// the grey bulb circle; steps may be orthogonal or diagonal.
const thermos = [
  new Thermo('R1C4', 'R2C4', 'R3C4', 'R4C3'),
  new Thermo('R2C8', 'R3C8', 'R4C8'),
  new Thermo('R5C6', 'R5C7', 'R6C8'),
  new Thermo('R6C6', 'R7C7'),
  new Thermo('R8C3', 'R8C4'),
  new Thermo('R6C3', 'R6C4'),
];

// The four white dots, each on a shared edge of the two cells it marks.
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
