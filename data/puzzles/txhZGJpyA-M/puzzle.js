// Title: Foggy Greater Than Tens Negative
// Author: pagedo
// Video: https://www.youtube.com/watch?v=txhZGJpyA-M
// Source: https://sudokupad.app/5ms0l7yqq0

// Normal sudoku (rows/columns/boxes) plus, over the marked adjacent-cell
// edges below: GreaterThan (bulb cell's digit > locator cell's digit) and
// X (the two digits sum to 10). "All Xs are given" (rules text), so every
// orthogonally-adjacent pair not listed in X_PAIRS is constrained to not
// sum to 10 -- including the GreaterThan-marked pairs, since a pair that
// also summed to 10 would have been drawn as an X instead.
//
// Fog/reveal state is solving UI, not a rule on the completed grid; omitted.
//
// GT_PAIRS and X_PAIRS are transcribed from the drawn edge marks, each a
// short two-point path between adjacent cell centres. A cell-pair with
// exactly one such path is a greater-than sign (the path's first point is
// the bulb, the greater cell). A cell-pair with two paths, one in each
// direction, is an X mark -- this is what the rules mean by "the
// X and the greater-than sign have been deliberately set to be exactly the
// same when partially covered by fog": a lone chevron (one path) reads the
// same under fog whether or not an opposing chevron (making it an X) is the
// part still hidden.

const shape = new Shape('9x9');
const graph = cellGraph();

const givens = [
  new Given('R4C5', 5),
  new Given('R5C4', 7),
  new Given('R5C6', 6),
  new Given('R7C8', 4),
  new Given('R8C6', 3),
];

// [bulb, locator]: bulb cell's digit > locator cell's digit.
const GT_PAIRS = [
  ['R1C1', 'R1C2'], ['R1C1', 'R2C1'], ['R1C3', 'R1C2'], ['R1C3', 'R1C4'],
  ['R1C3', 'R2C3'], ['R1C5', 'R1C6'], ['R2C1', 'R3C1'], ['R2C2', 'R2C1'],
  ['R2C2', 'R3C2'], ['R2C3', 'R2C4'], ['R2C5', 'R2C4'], ['R2C5', 'R3C5'],
  ['R2C6', 'R2C5'], ['R2C7', 'R2C6'], ['R2C9', 'R2C8'], ['R3C2', 'R3C1'],
  ['R3C3', 'R2C3'], ['R3C3', 'R3C2'], ['R3C3', 'R3C4'], ['R3C3', 'R4C3'],
  ['R3C4', 'R3C5'], ['R3C6', 'R2C6'], ['R4C1', 'R3C1'], ['R4C1', 'R5C1'],
  ['R4C2', 'R3C2'], ['R4C3', 'R5C3'], ['R4C4', 'R3C4'], ['R4C4', 'R4C3'],
  ['R4C5', 'R3C5'], ['R4C5', 'R4C6'], ['R4C5', 'R5C5'], ['R5C2', 'R4C2'],
  ['R5C2', 'R5C1'], ['R5C2', 'R5C3'], ['R5C2', 'R6C2'], ['R5C4', 'R5C3'],
  ['R5C4', 'R5C5'], ['R5C6', 'R5C5'], ['R5C6', 'R5C7'], ['R5C6', 'R6C6'],
  ['R5C7', 'R4C7'], ['R5C8', 'R4C8'], ['R5C8', 'R5C7'], ['R5C8', 'R5C9'],
  ['R5C9', 'R4C9'], ['R6C1', 'R5C1'], ['R6C5', 'R5C5'], ['R6C8', 'R5C8'],
  ['R6C8', 'R7C8'], ['R6C9', 'R5C9'], ['R7C5', 'R6C5'], ['R7C5', 'R8C5'],
  ['R7C8', 'R7C9'], ['R8C5', 'R8C4'], ['R8C5', 'R8C6'], ['R8C5', 'R9C5'],
  ['R8C6', 'R8C7'], ['R8C6', 'R9C6'], ['R8C8', 'R7C8'], ['R8C8', 'R8C7'],
  ['R8C8', 'R8C9'], ['R8C8', 'R9C8'],
];
const greaterThans = GT_PAIRS.map(([bulb, locator]) => new GreaterThan(bulb, locator));

// Orthogonally-adjacent cell pairs whose digits sum to 10.
const X_PAIRS = [
  ['R1C4', 'R1C5'], ['R2C2', 'R2C3'], ['R3C8', 'R3C9'], ['R4C6', 'R5C6'],
  ['R5C7', 'R6C7'], ['R6C1', 'R6C2'], ['R7C6', 'R8C6'], ['R7C7', 'R7C8'],
  ['R9C1', 'R9C2'],
];
const xs = X_PAIRS.map(([a, b]) => new X(a, b));

// "All Xs are given": every adjacent pair not in X_PAIRS must not sum to 10.
// Every such pair is a shifted copy of one of two templates (rightward or
// downward by one cell), so each direction is one Replicate over the
// left/top cells whose pair isn't in X_PAIRS, instead of ~135 individual
// Pair constraints.
const xKeySet = new Set(X_PAIRS.map(([a, b]) => [a, b].sort().join('-')));
const notXKey = Pair.fnToKey((a, b) => a + b !== 10, 9);

const rightOrigins = [];
const downOrigins = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const cell = makeCellId(r, c);
    if (c <= 8) {
      const right = makeCellId(r, c + 1);
      if (!xKeySet.has([cell, right].sort().join('-'))) rightOrigins.push(cell);
    }
    if (r <= 8) {
      const down = makeCellId(r + 1, c);
      if (!xKeySet.has([cell, down].sort().join('-'))) downOrigins.push(cell);
    }
  }
}

const negatives = [
  graph.makeReplicate([new Pair(notXKey, 'not-X', 'R1C1', 'R1C2')], rightOrigins),
  graph.makeReplicate([new Pair(notXKey, 'not-X', 'R1C1', 'R2C1')], downOrigins),
];

return [shape, ...givens, ...greaterThans, ...xs, ...negatives];
