// Title: August 2, 2022: Between
// Author: clover!
// Video: https://www.youtube.com/watch?v=5US7HIamSKI
// Source: https://tinyurl.com/3w7w6n7u

// Normal sudoku rules apply. Also, digits along a line must be strictly
// between the digits in the circles at the two ends of that line -- Between
// covers exactly this: it is the endpoint-vs-interior "strictly between"
// relation, repeats allowed, no requirement that every strictly-between
// digit appear. Line direction carries no meaning (fpuzzles `betweenline`
// cell order is not a direction), so either listed endpoint may be the low
// or the high circle.

// Givens, from the drawn grid.
const givens = [
  new Given('R1C7', 1),
  new Given('R2C1', 5), new Given('R2C3', 2), new Given('R2C5', 6), new Given('R2C9', 4),
  new Given('R4C1', 1), new Given('R4C5', 3), new Given('R4C9', 6),
  new Given('R5C4', 4), new Given('R5C6', 1),
  new Given('R6C1', 2), new Given('R6C5', 5), new Given('R6C9', 7),
  new Given('R8C1', 4), new Given('R8C5', 9), new Given('R8C7', 6), new Given('R8C9', 3),
  new Given('R9C3', 7),
];

// Between-line paths, drawn cell by cell. Each line's first and last cell
// is circled; interior cells are unmarked.
const betweenLines = [
  ['R4C1', 'R3C2', 'R4C3', 'R3C4', 'R4C5', 'R3C6', 'R4C7', 'R3C8', 'R4C9'],
  ['R6C1', 'R7C2', 'R6C3', 'R7C4', 'R6C5', 'R7C6', 'R6C7', 'R7C8', 'R6C9'],
  ['R2C1', 'R1C2', 'R2C3'],
  ['R8C7', 'R9C8', 'R8C9'],
  ['R9C3', 'R9C2', 'R8C1'],
  ['R1C7', 'R2C8', 'R2C9'],
  ['R2C3', 'R1C4', 'R2C5'],
  ['R8C5', 'R9C6', 'R8C7'],
  ['R5C4', 'R5C3', 'R5C2'],
  ['R5C6', 'R5C7', 'R5C8'],
];

return [
  new Shape('9x9'),
  ...givens,
  ...betweenLines.map(cells => new Between(...cells)),
];
