// Title: Stuck in Bakpao's Puzzle Mine
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=q9emJvhqMxk
// Source: https://tinyurl.com/yvr2scaa

// Normal Sudoku. Red cells have the digit of their position (1--9, row-major)
// within their 3x3 box; because all possible cells are highlighted, every other
// cell excludes its own position digit.
const givens = [
  ['R2C5', 9], ['R2C6', 7], ['R2C7', 3], ['R2C8', 1], ['R3C7', 2],
  ['R4C7', 4], ['R6C3', 6], ['R7C3', 5], ['R8C2', 9], ['R8C3', 7],
  ['R8C4', 3], ['R8C5', 1],
];

// Red highlights drawn in the source payload.
const red = new Set([
  'R1C2', 'R1C3', 'R2C2', 'R3C1', 'R3C2', 'R4C4', 'R4C5', 'R4C6',
  'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6', 'R7C8', 'R7C9',
  'R8C8', 'R9C7', 'R9C8',
]);
const cells = Array.from({ length: 9 }, (_, row) =>
  Array.from({ length: 9 }, (_, col) => {
    const cell = makeCellId(row + 1, col + 1);
    const position = (row % 3) * 3 + (col % 3) + 1;
    return [cell, position];
  }),
).flat();

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cells.map(([cell, position]) => red.has(cell)
    ? new Given(cell, position)
    : new Given(cell, ...[1, 2, 3, 4, 5, 6, 7, 8, 9].filter(value => value !== position))),
];
