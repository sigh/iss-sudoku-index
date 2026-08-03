// Title: July 28, 2023: 2-Digit Primes
// Author: clover!
// Video: https://www.youtube.com/watch?v=vsTcSz7HlT0
// Source: https://tinyurl.com/5t2994j

// Normal sudoku rules apply. Every pair of digits joined by a gray line forms
// a two-digit prime, read top-to-bottom for a vertical pair or left-to-right
// for a horizontal pair (rules worked example: R3C2-R3C3 and R2C3-R3C3 are
// each a two-digit prime). All 18 lines in the payload are drawn in the same
// gray (#CCCCCC), so every drawn line encodes this rule. A bent (L-shaped)
// line applies the rule to each of its two straight segments separately, each
// read in that segment's own direction.

// Two-digit primes usable with digits 1-9 (no zero digit): the tens digit is
// the first ("earlier") cell of an ordered pair, the units digit the second.
const isTwoDigitPrime = (tens, units) => {
  const n = 10 * tens + units;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return n > 10;
};
const primeKey = Pair.fnToKey(isTwoDigitPrime, 9);

// Drawn gray-line paths, exactly as listed in the puzzle's line data.
const grayLines = [
  ['R3C6', 'R3C7', 'R3C8'],
  ['R2C7', 'R3C7', 'R4C7'],
  ['R6C3', 'R7C3', 'R8C3'],
  ['R7C2', 'R7C3', 'R7C4'],
  ['R2C3', 'R3C3', 'R4C3'],
  ['R3C2', 'R3C3', 'R3C4'],
  ['R6C7', 'R7C7', 'R8C7'],
  ['R7C6', 'R7C7', 'R7C8'],
  ['R2C1', 'R1C1', 'R1C2'],
  ['R9C8', 'R9C9', 'R8C9'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R2C4', 'R1C4', 'R1C5'],
  ['R9C5', 'R9C6', 'R8C6'],
  ['R4C1', 'R4C2', 'R5C2'],
  ['R5C8', 'R6C8', 'R6C9'],
  ['R4C5', 'R4C6'],
  ['R6C4', 'R6C5'],
];

// Split each line into its straight segments (consecutive cells in the drawn
// path) and orient each pair the way the rule reads it -- smaller row first
// when the segment is vertical (top-to-bottom), smaller column first when
// horizontal (left-to-right) -- independent of which end the path happened
// to list first.
const primeConstraints = [];
for (const line of grayLines) {
  for (let i = 0; i + 1 < line.length; i++) {
    const a = parseCellId(line[i]);
    const b = parseCellId(line[i + 1]);
    const [first, second] = a.row === b.row
      ? (a.col < b.col ? [line[i], line[i + 1]] : [line[i + 1], line[i]])
      : (a.row < b.row ? [line[i], line[i + 1]] : [line[i + 1], line[i]]);
    primeConstraints.push(new Pair(primeKey, '', first, second));
  }
}

return [
  new Shape('9x9'),

  new Given('R1C1', 7),
  new Given('R1C4', 4),
  new Given('R1C6', 2),
  new Given('R1C9', 1),
  new Given('R2C5', 1),
  new Given('R3C3', 1),
  new Given('R3C7', 7),
  new Given('R4C1', 6),
  new Given('R4C6', 1),
  new Given('R4C9', 5),
  new Given('R5C2', 1),
  new Given('R5C8', 7),
  new Given('R6C1', 2),
  new Given('R6C4', 8),
  new Given('R6C9', 3),
  new Given('R7C3', 7),
  new Given('R7C7', 1),
  new Given('R8C5', 7),
  new Given('R9C1', 1),
  new Given('R9C4', 6),
  new Given('R9C6', 9),
  new Given('R9C9', 7),

  ...primeConstraints,
];
