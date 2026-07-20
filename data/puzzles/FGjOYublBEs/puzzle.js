// Title: A Process of Elimination
// Author: trufflebear
// Video: https://www.youtube.com/watch?v=FGjOYublBEs
// Source: https://sudokupad.app/mmayk15ji7

// Each colour uses every distinct pair for one common total. The pair count
// restricts a three-cage colour to totals 7, 8, 12, or 13, and the four-cage
// green set to 9, 10, or 11. Combining the omitted-digit and circle rules leaves
// the four feasible ordered (red, blue, green) total cases listed below.
const redCages = [
  ['R2C9', 'R3C9'],
  ['R2C4', 'R2C5'],
  ['R2C7', 'R2C8'],
];
const blueCages = [
  ['R9C5', 'R9C6'],
  ['R5C6', 'R6C6'],
  ['R3C3', 'R3C4'],
];
const greenCages = [
  ['R8C7', 'R9C7'],
  ['R4C7', 'R5C7'],
  ['R6C3', 'R6C4'],
  ['R1C4', 'R1C5'],
];

const circleCells = [
  'R1C1', 'R1C2', 'R1C3', 'R2C5', 'R2C6', 'R2C8', 'R3C1',
  'R3C4', 'R3C8', 'R3C9', 'R4C1', 'R4C8', 'R4C9', 'R5C3',
  'R5C5', 'R5C7', 'R6C1', 'R6C2', 'R6C3', 'R7C3', 'R7C4',
  'R7C5', 'R7C7', 'R7C9', 'R8C2', 'R8C3', 'R8C4', 'R8C5',
  'R8C6', 'R8C8', 'R9C2', 'R9C4', 'R9C5', 'R9C7', 'R9C9',
];

const whiteDots = [
  ['R2C7', 'R2C8'],
  ['R8C7', 'R8C8'],
  ['R9C8', 'R9C9'],
  ['R8C9', 'R9C9'],
  ['R2C1', 'R2C2'],
  ['R8C2', 'R9C2'],
  ['R7C5', 'R7C6'],
  ['R7C8', 'R8C8'],
].map(([a, b]) => new WhiteDot(a, b));

const colourCase = (redTotal, blueTotal, greenTotal, omittedDigits) => new And([
  ...redCages.map(cells => new Cage(redTotal, ...cells)),
  ...blueCages.map(cells => new Cage(blueTotal, ...cells)),
  ...greenCages.map(cells => new Cage(greenTotal, ...cells)),
  // Every omitted digit must occur in the circles. CountingCircles then gives
  // exactly digit N copies of N; these seven counts total all 35 circle cells.
  new ContainAtLeast(omittedDigits.join('_'), ...circleCells),
]);

const colourTotalCases = new Or([
  colourCase(7, 13, 10, [1, 2, 3, 5, 7, 8, 9]),
  colourCase(13, 7, 10, [1, 2, 3, 5, 7, 8, 9]),
  colourCase(8, 12, 10, [1, 2, 4, 5, 6, 8, 9]),
  colourCase(12, 8, 10, [1, 2, 4, 5, 6, 8, 9]),
]);

return [
  new Shape('9x9'),
  new CountingCircles(...circleCells),
  new AllDifferent(...redCages.flat()),
  new AllDifferent(...blueCages.flat()),
  new AllDifferent(...greenCages.flat()),
  ...whiteDots,
  colourTotalCases,
];
