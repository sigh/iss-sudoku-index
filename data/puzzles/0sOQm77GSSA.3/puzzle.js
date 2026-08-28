// Title: Jan 15, 2022: Counting Cages
// Author: clover!
// Video: https://www.youtube.com/watch?v=0sOQm77GSSA
// Source: https://tinyurl.com/2vvuzzb2

// Standard 9x9 sudoku (rows, columns, 3x3 boxes all-different) plus 8 givens.
// Each drawn cage carries no printed total; instead a cage of N cells must
// contain the digits 1 through N, each exactly once. ContainExact(values,
// ...cells) forces every listed value to appear exactly as many times as it
// is repeated in the list; with N required values across N cells the cells
// are forced into a bijection onto 1..N, which is exactly the rule (and also
// implies the cage's digits are distinct, so no separate AllDifferent).

const givens = [
  new Given('R3C2', 1), new Given('R3C8', 6),
  new Given('R7C2', 2), new Given('R7C3', 5),
  new Given('R7C7', 9), new Given('R7C8', 3),
  new Given('R8C4', 7), new Given('R8C6', 2),
];

// Cage cell lists, transcribed from the killercage array in source order.
const cages = [
  ['R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7'],
  ['R2C5', 'R3C5'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C5'],
  ['R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R7C4', 'R7C6'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C8', 'R4C8', 'R5C7', 'R5C8'],
  ['R8C4', 'R8C6', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'],
  ['R2C3', 'R2C4', 'R3C1', 'R3C2', 'R3C3', 'R4C1', 'R5C1'],
];

const requiredDigits = n => Array.from({ length: n }, (_, i) => i + 1).join('_');

return [
  new Shape('9x9'),
  ...givens,
  ...cages.map(cells => new ContainExact(requiredDigits(cells.length), ...cells)),
];
