// Title: Nov. 28, 2022: Between Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=rV-Z57M3y9I
// Source: https://tinyurl.com/2p9ujch2

// Normal sudoku rules apply. Also, digits along a line must be strictly
// between the digits in the circles at the two ends of that line -- Between
// covers exactly this: it is the endpoint-vs-interior "strictly between"
// relation, repeats allowed, no requirement that every strictly-between
// digit appear. Line direction carries no meaning (fpuzzles `betweenline`
// cell order is not a direction), so either listed endpoint may be the low
// or the high circle.

// Givens, from the drawn grid.
const givens = [
  new Given('R1C1', 4), new Given('R1C2', 6), new Given('R1C3', 8),
  new Given('R1C7', 9), new Given('R1C8', 7), new Given('R1C9', 1),
  new Given('R2C1', 2), new Given('R2C9', 6),
  new Given('R3C1', 3), new Given('R3C9', 8),
  new Given('R4C5', 9),
  new Given('R5C4', 8), new Given('R5C6', 6),
  new Given('R6C5', 7),
  new Given('R7C1', 1), new Given('R7C9', 2),
  new Given('R8C1', 8), new Given('R8C9', 9),
  new Given('R9C1', 9), new Given('R9C2', 3), new Given('R9C3', 2),
  new Given('R9C7', 1), new Given('R9C8', 8), new Given('R9C9', 7),
];

// Between-line paths, drawn cell by cell. Each line's first and last cell
// is circled; interior cells are unmarked.
const betweenLines = [
  ['R5C6', 'R4C7', 'R3C7', 'R2C7', 'R1C6', 'R1C5', 'R1C4', 'R2C3'],
  ['R6C5', 'R7C6', 'R7C7', 'R7C8', 'R6C9', 'R5C9', 'R4C9', 'R3C8'],
  ['R5C4', 'R6C3', 'R7C3', 'R8C3', 'R9C4', 'R9C5', 'R9C6', 'R8C7'],
  ['R4C5', 'R3C4', 'R3C3', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2'],
];

return [
  new Shape('9x9'),
  ...givens,
  ...betweenLines.map(cells => new Between(...cells)),
];
