// Title: Sum Addition Required
// Author: Go Easy!
// Video: https://www.youtube.com/watch?v=9QQxjYMh0E8
// Source: https://app.crackingthecryptic.com/sudoku/hLNfTNNMr9

// Normal Sudoku rules apply (standard 3x3 boxes, no givens).
//
// Cage digits may repeat, so each cage uses Sum rather than Cage. Each cage
// carries two possible totals (its printed top-left and bottom-right corner
// numbers); the rule requires the cage's digits to add up to one of the two,
// encoded as an Or of the two Sum readings.
//
// Marked-diagonal digits must not repeat (AllDifferent) and must add to the
// outside total (Sum). Each diagonal is a 5-cell run from an edge-midpoint
// cell to an adjacent edge-midpoint cell, snapped from the drawn arrow
// waypoints and cross-checked against the direction implied by the other
// three diagonals (each pair shares its edge-midpoint endpoint).
//
// Grey arrows use the built-in Arrow class, bulb (circled) cell first: the
// circle carries no printed number, so "the number in its attached circle"
// is the digit the solver places in that cell, per the standard sudoku
// arrow-clue reading.
//
// Thermometers use Thermo, bulb (solid grey circle) cell first.

// Each cage is transcribed from one drawn cage: the first total is printed
// at its top-left corner, the second at its bottom-right corner overlay.
const cages = [
  { totals: [14, 19], cells: ['R1C1', 'R1C2', 'R1C3'] },
  {
    totals: [69, 79],
    cells: [
      'R3C1', 'R3C2', 'R3C3', 'R4C1', 'R4C2', 'R4C3',
      'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R6C3',
      'R7C1', 'R7C2', 'R7C3',
    ],
  },
  { totals: [13, 23], cells: ['R9C1', 'R9C2', 'R9C3'] },
  { totals: [24, 34], cells: ['R7C4', 'R7C5', 'R7C6', 'R8C4', 'R8C5'] },
  { totals: [17, 27], cells: ['R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'] },
  { totals: [15, 35], cells: ['R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6'] },
  {
    totals: [50, 60],
    cells: [
      'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9',
      'R3C7', 'R3C8', 'R3C9', 'R4C7', 'R4C8', 'R4C9',
    ],
  },
  {
    totals: [68, 78],
    cells: [
      'R6C7', 'R6C8', 'R6C9', 'R7C7', 'R7C8', 'R7C9',
      'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9',
    ],
  },
];
const cageRules = cages.map(({ totals: [a, b], cells }) => new Or([
  new Sum(a, ...cells),
  new Sum(b, ...cells),
]));

// Each diagonal is transcribed from one drawn diagonal arrow plus its
// paired outside circle total.
const diagonals = [
  { total: 29, cells: ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'] },
  { total: 15, cells: ['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'] },
  { total: 17, cells: ['R9C5', 'R8C4', 'R7C3', 'R6C2', 'R5C1'] },
  { total: 21, cells: ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'] },
];
const diagonalRules = diagonals.flatMap(({ total, cells }) => [
  new AllDifferent(...cells),
  new Sum(total, ...cells),
]);

// Each arrow is transcribed from one drawn grey arrow, circled cell first.
const arrows = [
  ['R3C2', 'R3C3', 'R3C4'],
  ['R7C2', 'R7C3', 'R7C4'],
];
const arrowRules = arrows.map(cells => new Arrow(...cells));

// Each thermometer is transcribed from one drawn grey line, bulb (solid
// grey circle overlay) cell first.
const thermos = [
  ['R2C4', 'R1C4', 'R1C5', 'R1C6'],
  ['R4C9', 'R4C8', 'R4C7'],
  ['R6C1', 'R5C1', 'R4C1'],
  ['R6C3', 'R5C3', 'R4C3'],
  ['R6C2', 'R5C2', 'R4C2'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R6C9', 'R6C8', 'R6C7'],
  ['R8C6', 'R9C6', 'R9C5', 'R9C4'],
];
const thermoRules = thermos.map(cells => new Thermo(...cells));

return [
  new Shape('9x9'),
  ...cageRules,
  ...diagonalRules,
  ...arrowRules,
  ...thermoRules,
];
