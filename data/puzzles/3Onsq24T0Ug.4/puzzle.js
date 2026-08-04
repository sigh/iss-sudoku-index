// Title: Makodoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=3Onsq24T0Ug
// Source: https://tinyurl.com/ytmybcyh

// Normal sudoku rules apply.
// A small circle on the shared edge of two orthogonally adjacent cells marks
// either "+" (the two cells sum to less than 10) or "X" (the two cells
// multiply to a product less than 10). Not every adjacent pair meeting one
// of these conditions is marked, so absence of a mark carries no
// information -- this is not a Kropki-style negative constraint, hence the
// generic `Pair` class rather than `StrictKropki`.

// Binary relation keys, built once and shared by every clue of that type.
const sumKey = Pair.fnToKey((a, b) => a + b < 10, 9);
const productKey = Pair.fnToKey((a, b) => a * b < 10, 9);

// Cell-pair edges transcribed from the payload's `circle` array: each entry
// gives a two-cell `cells` list (the marked edge) and a `value` of "+" or
// "X". Every pair here is orthogonally adjacent, matching the drawn mark.
const sumEdges = [
  ['R5C4', 'R5C5'],
  ['R4C5', 'R5C5'],
  ['R5C5', 'R5C6'],
  ['R5C5', 'R6C5'],
  ['R3C5', 'R4C5'],
  ['R5C6', 'R5C7'],
  ['R4C3', 'R5C3'],
  ['R3C4', 'R3C5'],
  ['R6C7', 'R7C7'],
  ['R7C6', 'R7C7'],
  ['R1C8', 'R1C9'],
  ['R9C8', 'R9C9'],
  ['R8C1', 'R9C1'],
  ['R8C5', 'R8C6'],
];

const productEdges = [
  ['R6C5', 'R7C5'],
  ['R5C3', 'R5C4'],
  ['R3C3', 'R4C3'],
  ['R3C3', 'R3C4'],
  ['R1C1', 'R2C1'],
  ['R1C1', 'R1C2'],
  ['R5C7', 'R6C7'],
  ['R7C5', 'R7C6'],
  ['R1C9', 'R2C9'],
  ['R8C9', 'R9C9'],
  ['R9C1', 'R9C2'],
  ['R7C2', 'R7C3'],
  ['R3C7', 'R3C8'],
  ['R2C4', 'R2C5'],
];

return [
  new Shape('9x9'),

  new Given('R1C2', 9),
  new Given('R1C8', 7),
  new Given('R2C1', 5),
  new Given('R2C6', 2),
  new Given('R2C9', 3),
  new Given('R3C5', 6),
  new Given('R3C7', 5),
  new Given('R5C3', 4),
  new Given('R5C7', 8),
  new Given('R7C3', 9),
  new Given('R7C5', 2),
  new Given('R8C1', 6),
  new Given('R8C4', 9),
  new Given('R8C9', 7),
  new Given('R9C2', 4),
  new Given('R9C8', 6),

  ...sumEdges.map(([a, b]) => new Pair(sumKey, 'Sum < 10', a, b)),
  ...productEdges.map(([a, b]) => new Pair(productKey, 'Product < 10', a, b)),
];
