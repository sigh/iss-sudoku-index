// Title: Nov 7, 2021: Difference
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=w-5nFQO26Wk
// Source: https://tinyurl.com/2d9kexjr

// Rules: normal sudoku, plus one given (R9C9=9). A white dot between two
// orthogonally adjacent cells requires the digits in those cells to have an
// absolute difference equal to the number printed in the dot. Only the 31
// drawn dots carry the rule -- the ruleset does not claim every qualifying
// pair is marked, so unmarked adjacent cells are unconstrained.

const shape = new Shape('9x9');

// Difference-1 dots are exactly the Kropki white-dot relation, so they use
// the native WhiteDot class -- one call per drawn edge (not one call over
// all nine cells of the box, which would add WhiteDot to the 4 adjacent
// pairs in that box that have no drawn dot).
const whiteDotPairs = [
  ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R1C3', 'R2C3'],
  ['R2C1', 'R2C2'], ['R2C2', 'R2C3'], ['R2C1', 'R3C1'],
  ['R3C1', 'R3C2'], ['R3C2', 'R3C3'],
];
const whiteDots = whiteDotPairs.map(([a, b]) => new WhiteDot(a, b));

// Remaining difference dots grouped by printed value, each pair orthogonally
// adjacent, encoded with a custom Pair relation (no native class for a
// difference other than 1).
const dotsByValue = {
  2: [
    ['R1C4', 'R1C5'], ['R1C5', 'R1C6'], ['R1C6', 'R2C6'],
    ['R2C4', 'R2C5'], ['R2C4', 'R3C4'], ['R3C4', 'R3C5'],
    ['R3C5', 'R3C6'],
  ],
  3: [
    ['R1C7', 'R2C7'], ['R2C8', 'R3C8'], ['R2C9', 'R3C9'],
  ],
  4: [
    ['R4C1', 'R4C2'], ['R4C3', 'R5C3'], ['R5C1', 'R6C1'],
    ['R6C2', 'R6C3'],
  ],
  5: [
    ['R4C4', 'R4C5'], ['R4C6', 'R5C6'], ['R5C4', 'R6C4'],
    ['R6C5', 'R6C6'],
  ],
  6: [
    ['R4C9', 'R5C9'], ['R5C7', 'R6C7'],
  ],
  7: [
    ['R7C1', 'R8C1'], ['R8C3', 'R9C3'],
  ],
  8: [
    ['R8C5', 'R8C6'],
  ],
};

// One Pair.fnToKey predicate per printed difference value; each edge uses the
// key for its own value so pairs with different dot values are never mixed
// under one relation.
const diffKeys = Object.fromEntries(
  Object.keys(dotsByValue).map(v => [
    v,
    Pair.fnToKey((a, b) => Math.abs(a - b) === Number(v), shape),
  ]));

const dots = Object.entries(dotsByValue).flatMap(([v, pairs]) =>
  pairs.map(([a, b]) => new Pair(diffKeys[v], `difference ${v}`, a, b)));

return [
  shape,
  new Given('R9C9', 9),
  ...whiteDots,
  ...dots,
];
