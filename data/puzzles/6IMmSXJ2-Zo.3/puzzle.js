// Title: Myself
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=6IMmSXJ2-Zo
// Source: https://tinyurl.com/ykubt5vy

// Normal sudoku. Each listed white dot requires its cells to differ by its label.

// Givens transcribed from the source grid.
const givens = [
  ['R1C4', 1], ['R2C4', 2], ['R3C4', 3],
  ['R4C7', 2], ['R4C8', 5], ['R4C9', 8],
  ['R6C1', 7], ['R6C2', 4], ['R6C3', 1],
  ['R7C6', 4], ['R8C6', 5], ['R9C6', 6],
];

// White dots labelled 3 transcribed from the source difference clues.
const differenceThreeDots = [
  [3, 'R1C4', 'R1C5'], [3, 'R2C4', 'R2C5'],
  [3, 'R3C4', 'R3C5'], [3, 'R7C6', 'R7C5'],
  [3, 'R8C5', 'R8C6'], [3, 'R9C5', 'R9C6'],
];
// White dots without a nonstandard label are consecutive.
const whiteDots = [
  [1, 'R2C7', 'R3C7'], [1, 'R2C7', 'R2C8'],
  [1, 'R2C9', 'R2C8'], [1, 'R1C9', 'R2C9'],
  [1, 'R4C7', 'R5C7'], [1, 'R5C8', 'R4C8'],
  [1, 'R4C9', 'R5C9'], [1, 'R6C1', 'R5C1'],
  [1, 'R5C2', 'R6C2'], [1, 'R5C3', 'R6C3'],
  [1, 'R8C1', 'R7C1'], [1, 'R8C1', 'R8C2'],
  [1, 'R8C3', 'R8C2'], [1, 'R9C3', 'R8C3'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...differenceThreeDots.map(([difference, first, second]) => new Pair(
    Pair.fnToKey((a, b) => Math.abs(a - b) === difference, 9),
    `difference ${difference}`,
    first,
    second,
  )),
  ...whiteDots.map(([, first, second]) => new WhiteDot(first, second)),
];
