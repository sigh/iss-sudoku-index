// Title: Pentomino Primacy
// Author: Ben Schultz
// Video: https://www.youtube.com/watch?v=XBeH6hhF6MQ
// Source: https://app.crackingthecryptic.com/nGq3pG4JgP

// Rules encoded here, in full:
//   "Each marked region contains the digits 0-4. Across each region boundary,
//    the two digits sum to a prime number. 1 is not prime."
// Nothing is omitted. There are no Sudoku rules: rows, columns and boxes are
// unconstrained and digits repeat freely along them, so the board is a Raw
// 6x10 grid over the alphabet 0-4.
// The strip drawn below the board pairs each digit with a list (0|23, 1|124,
// 2|013, 3|024, 4|13). Those lists are exactly the partners each digit has
// under the prime-sum rule, so the strip is a legend restating that rule and
// is not encoded as a separate clue.

const shape = new Shape('6x10', '0-4', 'Raw');

// The twelve marked regions, transcribed from the drawn region borders: one
// letter per region, row-major from R1C1. Each is a distinct pentomino
// (A = I, B = Y, C = L, D = T, E = X, F = N, G = U, H = F, I = W, J = Z,
// K = V, L = P), which is what the title refers to; the shapes themselves
// carry no rule.
const REGION_MAP = [
  'AAAAABBBBL',
  'CCEGGIIBLL',
  'CEEEGHIILL',
  'CDEGGHHIJK',
  'CDFFHHJJJK',
  'DDDFFFJKKK',
];

// The drawn givens, same layout; '.' is an empty cell.
const GIVEN_MAP = [
  '.12..1....',
  '.....1...0',
  '..........',
  '0.2......3',
  '.........4',
  '4..2..3...',
];

const ROWS = REGION_MAP.length;
const COLS = REGION_MAP[0].length;
// 1-based row/column indices, matching R/C cell numbering.
const range = (n) => [...Array(n).keys()].map(i => i + 1);
const labelAt = (r, c) => REGION_MAP[r - 1][c - 1];
const givenAt = (r, c) => GIVEN_MAP[r - 1][c - 1];

const regionCells = new Map();
range(ROWS).forEach(r => range(COLS).forEach(c => {
  const label = labelAt(r, c);
  if (!regionCells.has(label)) regionCells.set(label, []);
  regionCells.get(label).push(makeCellId(r, c));
}));

// Every region is 5 cells and the alphabet is the 5 values 0-4, so
// AllDifferent over a region is exactly "contains the digits 0-4".
const regions = [...regionCells.values()].map(cells => new AllDifferent(...cells));

const givens = range(ROWS).flatMap(r => range(COLS).flatMap(c => {
  const ch = givenAt(r, c);
  return ch === '.' ? [] : [new Given(makeCellId(r, c), Number(ch))];
}));

// Two digits from 0-4 sum to something in 0-8; the primes in that range are
// 2, 3, 5 and 7 (1 is excluded by the rules' own note).
const PRIME_SUMS = new Set([2, 3, 5, 7]);
const primeSumKey = Pair.fnToKey((a, b) => PRIME_SUMS.has(a + b), shape);

// A region boundary is crossed by exactly the orthogonally adjacent cell pairs
// whose two cells carry different region letters, so the pairs are derived from
// REGION_MAP rather than listed by hand.
const boundaryPairs = range(ROWS).flatMap(r => range(COLS).flatMap(
  c => [[0, 1], [1, 0]].flatMap(([dr, dc]) => {
    const r2 = r + dr;
    const c2 = c + dc;
    if (r2 > ROWS || c2 > COLS) return [];
    if (labelAt(r2, c2) === labelAt(r, c)) return [];
    return [new Pair(primeSumKey, 'prime-sum', makeCellId(r, c), makeCellId(r2, c2))];
  })));

return [shape, ...regions, ...givens, ...boundaryPairs];
