// Title: That's Three In The Corner
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=jAtVtoRCW00
// Source: https://tinyurl.com/xh8jvks

// Normal sudoku rules apply. Cells separated by a black dot must have the
// ratio given; cells separated by a white dot must have the difference
// given. Every dot in the payload carries its own printed value (mostly 3,
// one white dot carries 5), so each dot is encoded with its own value rather
// than a single fixed-value predicate.

// Generic ratio/difference predicates, parameterised per dot value. Both
// relations are symmetric in the pair, so cell order does not matter.
const ratioKey = (k) => Pair.fnToKey((a, b) => a === k * b || b === k * a, 9);
const diffKey = (k) => Pair.fnToKey((a, b) => Math.abs(a - b) === k, 9);

// Black dots (ratio), from the payload's `ratio` array; every entry is value 3.
const blackDots = [
  ['R1C7', 'R1C8'],
  ['R2C9', 'R2C8'],
  ['R9C2', 'R9C3'],
  ['R8C1', 'R8C2'],
  ['R4C4', 'R5C4'],
  ['R8C5', 'R8C6'],
  ['R6C9', 'R7C9'],
];

// White dots (difference), from the payload's `difference` array; every entry
// is value 3 except R4C1-R4C2, which is value 5.
const whiteDots = [
  [['R1C8', 'R2C8'], 3],
  [['R3C9', 'R2C9'], 3],
  [['R9C2', 'R8C2'], 3],
  [['R8C1', 'R7C1'], 3],
  [['R7C1', 'R6C1'], 3],
  [['R9C3', 'R9C4'], 3],
  [['R1C6', 'R1C7'], 3],
  [['R3C9', 'R4C9'], 3],
  [['R4C5', 'R4C4'], 3],
  [['R5C6', 'R6C6'], 3],
  [['R6C6', 'R6C5'], 3],
  [['R6C3', 'R6C4'], 3],
  [['R4C6', 'R3C6'], 3],
  [['R6C2', 'R7C2'], 3],
  [['R2C7', 'R2C6'], 3],
  [['R2C4', 'R2C5'], 3],
  [['R9C5', 'R9C6'], 3],
  [['R4C1', 'R4C2'], 5],
  [['R1C4', 'R1C3'], 3],
  [['R1C3', 'R1C2'], 3],
  [['R1C4', 'R2C4'], 3],
  [['R8C8', 'R9C8'], 3],
  [['R3C6', 'R3C7'], 3],
];

const ratio3 = ratioKey(3);
const blackConstraints = blackDots.map(
  ([a, b]) => new Pair(ratio3, '', a, b));

const diffKeyCache = new Map();
const whiteConstraints = whiteDots.map(([[a, b], k]) => {
  if (!diffKeyCache.has(k)) diffKeyCache.set(k, diffKey(k));
  return new Pair(diffKeyCache.get(k), '', a, b);
});

return [
  new Shape('9x9'),

  new Given('R1C1', 3),
  new Given('R3C4', 3),
  new Given('R4C3', 3),
  new Given('R6C7', 3),
  new Given('R7C6', 3),
  new Given('R9C9', 3),

  ...blackConstraints,
  ...whiteConstraints,
];
