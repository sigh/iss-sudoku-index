// Title: Back to the Ratio
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=HJ3aT7kBtSc
// Source: https://tinyurl.com/4jm5dwwy

// Normal Sudoku rules apply. Digits placed in adjacent cells must satisfy the
// ratios, where given: 24 circles straddle the edge between two orthogonally
// adjacent cells, each labelled with a fraction "p/q" naming that edge's
// ratio. A ratio holds between the two digits in either direction (which
// cell is "p" and which is "q" is not stated) -- e.g. "5/9" allows the
// unordered pair {5, 9}; "1/3" allows {1,3}, {2,6} or {3,9}. Adjacent pairs
// without a circle carry no restriction (rule says "where given").

// 1/2-ratio clues are exactly Kropki's native "one value double the other" --
// use BlackDot for that whole group. Every other ratio has no native class,
// so it goes through a Pair.fnToKey table below.
// Ratio clue table: [cellA, cellB, p, q], transcribed from the source's
// paired edge-position and fraction-label overlays.
const blackDotClues = [
  ['R2C4', 'R3C4'],
  ['R2C2', 'R1C2'],
  ['R7C6', 'R8C6'],
  ['R2C8', 'R2C7'],
];
const otherRatioClues = [
  ['R4C5', 'R4C4', 1, 3],
  ['R4C6', 'R5C6', 5, 7],
  ['R6C6', 'R6C5', 3, 4],
  ['R5C4', 'R6C4', 1, 4],
  ['R2C2', 'R2C3', 1, 3],
  ['R3C2', 'R2C2', 1, 4],
  ['R2C1', 'R2C2', 1, 5],
  ['R7C8', 'R8C8', 5, 9],
  ['R8C8', 'R8C9', 2, 3],
  ['R9C8', 'R8C8', 7, 9],
  ['R8C8', 'R8C7', 8, 9],
  ['R4C7', 'R4C8', 1, 5],
  ['R2C8', 'R2C9', 2, 7],
  ['R2C8', 'R1C8', 2, 3],
  ['R2C8', 'R3C8', 1, 3],
  ['R6C3', 'R6C2', 5, 9],
  ['R7C2', 'R8C2', 3, 5],
  ['R8C3', 'R8C2', 2, 5],
  ['R8C1', 'R8C2', 4, 5],
  ['R8C2', 'R9C2', 5, 8],
];

// One Pair key per distinct (p, q), reused across every clue with that ratio.
// The predicate is symmetric in (a, b) -- unordered digits x, y satisfy the
// ratio p:q when x = p*k, y = q*k for some k, in either assignment.
const keyCache = new Map();
function ratioKey(p, q) {
  const cacheId = `${p}/${q}`;
  if (!keyCache.has(cacheId)) {
    keyCache.set(
      cacheId,
      Pair.fnToKey((a, b) => (a * q === b * p) || (b * q === a * p), 9));
  }
  return keyCache.get(cacheId);
}

return [
  new Shape('9x9'),

  new Given('R3C5', 7),
  new Given('R5C3', 1),
  new Given('R5C5', 2),
  new Given('R5C7', 6),
  new Given('R7C5', 9),

  ...blackDotClues.map(([cellA, cellB]) => new BlackDot(cellA, cellB)),
  ...otherRatioClues.map(([cellA, cellB, p, q]) =>
    new Pair(ratioKey(p, q), `${p}/${q}`, cellA, cellB)),
];
