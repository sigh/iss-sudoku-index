// Title: Don't repeat yourself
// Author: DedaKosta
// Video: https://www.youtube.com/watch?v=ePwRXcM5cPs
// Source: https://sudokupad.app/fx2o4cl240

// Every cell touched by clues of one type must have a different digit.
const whiteDots = [
  ['R9C8', 'R9C9'],
  ['R2C6', 'R3C6'],
  ['R3C8', 'R4C8'],
  ['R8C2', 'R9C2'],
];
const blackDots = [
  ['R4C2', 'R5C2'],
  ['R6C8', 'R7C8'],
  ['R1C4', 'R2C4'],
];
const cageCells = [
  'R2C7', 'R2C8', 'R2C9',
  'R7C4', 'R8C4', 'R9C4',
  'R6C1', 'R7C1', 'R7C2',
];
const pinkLines = [
  ['R5C3', 'R5C2', 'R5C1'],
  ['R7C6', 'R8C6', 'R9C6'],
  ['R5C8', 'R5C9', 'R6C9'],
];
const outsideDiagonals = [
  ['R1C1'],
  ['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'],
  ['R9C7', 'R8C8', 'R7C9'],
];
const blueLines = [
  [['R4C2', 'R4C1'], ['R3C1', 'R3C2']],
  [['R6C8', 'R6C7'], ['R7C8', 'R7C9']],
];

const orderedConsecutiveKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) === 1,
  9,
);

return [
  new Shape('9x9'),

  ...whiteDots.map(cells => new WhiteDot(...cells)),
  new AllDifferent(...whiteDots.flat()),

  ...blackDots.map(cells => new BlackDot(...cells)),
  new AllDifferent(...blackDots.flat()),

  // The cross-cage uniqueness rule supplies each cage's non-repetition.
  new Sum(15, 'R2C7', 'R2C8', 'R2C9'),
  new Sum(21, 'R7C4', 'R8C4', 'R9C4'),
  new AllDifferent(...cageCells),

  ...pinkLines.map(cells =>
    new Pair(orderedConsecutiveKey, 'Ordered consecutive', ...cells)),
  new AllDifferent(...pinkLines.flat()),

  // The one-cell diagonal sum is exactly the given R1C1 = 5.
  new Given('R1C1', 5),
  new Sum(20, ...outsideDiagonals[1]),
  new Sum(20, ...outsideDiagonals[2]),
  new AllDifferent(...outsideDiagonals.flat()),

  ...blueLines.map(segments => new EqualSum(...segments)),
  new AllDifferent(...blueLines.flat(2)),
];
