// Title: Dec 1, 2021: Product Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=tT3tiN5GBvQ
// Source: https://tinyurl.com/3a636mdf

// Normal sudoku rules apply. The value in a white circle is the product of
// the digits in the two cells adjacent to that circle. There is no exhaustive
// clue: the rules do not state that every product-2 (or ratio-style) relation
// is marked, so a Pair predicate keyed to each circle's own value, applied
// only at the drawn cell pairs, is the faithful reading -- unmarked adjacent
// pairs are unconstrained.

const shape = new Shape('9x9');

// Cell pairs and their printed product, transcribed from the payload's
// `circle` array (each entry: two orthogonally adjacent cells + a value).
const circles = [
  [['R1C2', 'R1C3'], 2],
  [['R2C3', 'R2C4'], 3],
  [['R3C4', 'R3C5'], 6],
  [['R4C3', 'R4C4'], 3],
  [['R5C4', 'R5C5'], 8],
  [['R5C5', 'R5C6'], 2],
  [['R6C6', 'R6C7'], 5],
  [['R7C5', 'R7C6'], 3],
  [['R8C6', 'R8C7'], 6],
  [['R1C6', 'R1C7'], 35],
  [['R9C3', 'R9C4'], 32],
  [['R9C7', 'R9C8'], 2],
  [['R6C2', 'R6C3'], 63],
  [['R4C7', 'R4C8'], 48],
  [['R3C6', 'R3C7'], 24],
  [['R7C3', 'R7C4'], 45],
  [['R1C9', 'R2C9'], 28],
  [['R8C1', 'R9C1'], 7],
  [['R4C1', 'R5C1'], 15],
  [['R5C9', 'R6C9'], 27],
];

// One Pair key per distinct printed product; the predicate checks the
// unordered product of the two cells against that value.
const keyForValue = new Map();
for (const [, value] of circles) {
  if (!keyForValue.has(value)) {
    keyForValue.set(value, Pair.fnToKey((a, b) => a * b === value, shape));
  }
}

const productDots = circles.map(([[a, b], value]) =>
  new Pair(keyForValue.get(value), `product ${value}`, a, b));

return [shape, ...productDots];
