// Title: Christmas Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=RToyNMs8sFQ
// Source: https://tinyurl.com/2p8bmphb

// Rules encoded here:
//   Normal sudoku rules apply. Two drawn polylines thread through seven
//   circled cells (each circle already a plain Sudoku given). Every stretch
//   of line between two circled cells it visits consecutively is "a line
//   that connects two circles": its interior digits must all be different
//   from one another, and each must be strictly less than the digit in both
//   of that stretch's circles.

const shape = new Shape('9x9');

// Given digits (source: grid[][].value).
const givens = [
  ['R1C3', 3], ['R1C5', 4], ['R1C7', 8], ['R2C2', 1], ['R2C8', 7],
  ['R3C1', 2], ['R3C3', 7], ['R3C7', 3], ['R3C9', 9], ['R5C1', 8],
  ['R5C2', 6], ['R5C8', 5], ['R5C9', 7], ['R6C4', 7], ['R6C6', 6],
  ['R7C3', 5], ['R7C7', 9], ['R8C1', 9], ['R8C9', 8], ['R9C4', 4],
  ['R9C6', 9],
];

// Circled cells (source: circle[], one circle per entry).
const circles = new Set([
  'R1C5', 'R3C7', 'R3C3', 'R5C2', 'R5C8', 'R8C9', 'R8C1',
]);

// Drawn polylines (source: line[].lines), each threading through several
// circled cells, not just its two listed ends.
const polylines = [
  ['R1C5', 'R2C6', 'R3C7'],
  ['R3C7', 'R3C6', 'R4C7', 'R5C8', 'R5C7', 'R5C6', 'R6C7', 'R7C8', 'R8C9',
   'R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1', 'R7C2',
   'R6C3', 'R5C4', 'R5C3', 'R5C2', 'R4C3', 'R3C4', 'R3C3', 'R2C4', 'R1C5'],
];

// Split each polyline at every circled cell it passes through, so each
// resulting stretch runs circle -> ... -> circle: that stretch is "a line
// that connects two circles" per the rules text.
const stretches = polylines.flatMap(line => {
  const circleIdx = line.flatMap((cell, i) => circles.has(cell) ? [i] : []);
  const parts = [];
  for (let k = 0; k + 1 < circleIdx.length; k++) {
    const from = circleIdx[k];
    const to = circleIdx[k + 1];
    parts.push({
      circleA: line[from],
      circleB: line[to],
      interior: line.slice(from + 1, to),
    });
  }
  return parts;
});

// fn(a, b) applies with the first-listed cell as `a` (Pair's consecutive-pair
// convention), so pairing a stretch's circle first makes this "circle digit
// greater than interior digit".
const circleGreater = Pair.fnToKey(
  (circleVal, interiorVal) => circleVal > interiorVal, shape);

const stretchConstraints = stretches.flatMap(({ circleA, circleB, interior }) => [
  ...(interior.length > 1 ? [new AllDifferent(...interior)] : []),
  ...interior.flatMap(cell => [
    new Pair(circleGreater, 'circle-gt', circleA, cell),
    new Pair(circleGreater, 'circle-gt', circleB, cell),
  ]),
]);

return [
  shape,
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...stretchConstraints,
];
