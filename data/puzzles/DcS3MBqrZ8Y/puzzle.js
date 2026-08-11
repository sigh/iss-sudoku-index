// Title: Code - 63
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=DcS3MBqrZ8Y
// Source: https://app.crackingthecryptic.com/sudoku/dQRm7HfTfM

// Normal sudoku (standard boxes). Each 2-cell cage sums to its stated total,
// with digits distinct (all 9 cages sit inside a single box, so Cage's
// distinctness is redundant with sudoku but stated outright as drawn).
// Each purple line is a 2-cell "set of consecutive digits" -> Renban, whose
// own semantics ("consecutive and non-repeating") match the rule verbatim.
// Black dots: 1:2 ratio. White dot: consecutive. "Not all possible dots are
// given" means no negative dot constraint is added elsewhere.
// Thermometer: strictly increasing from the bulb (R5C5, marked by the grey
// circle underlay).
// The two outside diagonal clues sum to 23 each. Both diagonals are broken
// (not full-grid) diagonals recovered from each arrow's own 45-degree ray;
// "digits may repeat along such diagonals if allowed by other rules" means
// plain Sum, not Cage -- no extra distinctness is added beyond what
// boxes/rows/cols already give some of the diagonal cells.

const cages = [
  [11, 'R3C2', 'R3C3'],
  [11, 'R3C5', 'R3C6'],
  [11, 'R3C8', 'R3C9'],
  [11, 'R6C2', 'R6C3'],
  [13, 'R6C5', 'R6C6'],
  [11, 'R6C8', 'R6C9'],
  [11, 'R9C2', 'R9C3'],
  [11, 'R9C5', 'R9C6'],
  [13, 'R9C8', 'R9C9'],
];

const renbanLines = [
  ['R1C4', 'R2C4'],
  ['R2C5', 'R1C6'],
  ['R1C7', 'R2C7'],
  ['R2C8', 'R1C9'],
  ['R4C7', 'R5C7'],
  ['R5C8', 'R4C9'],
  ['R5C1', 'R4C1'],
  ['R5C2', 'R4C3'],
  ['R8C1', 'R7C1'],
  ['R8C2', 'R7C3'],
  ['R8C4', 'R7C4'],
  ['R8C5', 'R7C6'],
];

const blackDots = [
  ['R1C1', 'R2C1'],
  ['R4C4', 'R5C4'],
  ['R7C7', 'R8C7'],
];

const diagonalA = ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'];
const diagonalB = ['R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
  new Thermo('R5C5', 'R6C4'),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  new WhiteDot('R9C4', 'R9C5'),
  new Sum(23, ...diagonalA),
  new Sum(23, ...diagonalB),
];
