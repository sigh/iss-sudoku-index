// Title: Olympics
// Author: Civil
// Video: https://www.youtube.com/watch?v=iXSHQDLj5OI
// Source: https://app.crackingthecryptic.com/sudoku/hnMJTRhdrT

// Normal sudoku rules apply (default 9x9 boxes -- the source's own regions are the
// nine standard 3x3 blocks). Two givens: R1C5=8, R9C9=7.
//
// Black dots (2:1 ratio) sit on the 16 drawn edges. "All possible black dots are
// given" is exhaustive for black dots specifically (the rules never mention white
// dots at all), so every other orthogonally-adjacent pair in the grid is
// constrained to NOT be a 2:1 ratio -- not full StrictKropki, which would also
// forbid unmarked consecutive pairs the rules never restrict.
//
// Colored-area Olympic-year rule. The qualifying years are derived straight from
// the rules' own formula (every 4 years from 1896, skipping the cancelled
// 1916/1940/1944 Games -- stated in the video description), keeping only years
// with no zero digit and no repeated digit: the rules' own two exclusions, worked
// as 1904 (a zero) and 1912 (a repeated 1) respectively. That leaves 13 years.
// "The years are depicted in orthogonally adjacent consecutive digits" and the
// rules never fix which end of that run is read first, so both traversal
// directions of every colored-cell path are candidates (Or over the reading).
// "All years are present" becomes: for each year, some directed length-4 path of
// colored cells holds its digits in order. "All digits in the colored cells are
// part of at least one Olympic year" becomes: for each colored cell, some such
// matching path passes through it. "Not all possible combinations ... are
// depicting Olympic years" licenses no extra constraint -- it only says a
// leftover adjacent run need not avoid coincidentally matching, so nothing beyond
// presence + coverage encodes that sentence.

const graph = cellGraph('9x9');

// Drawn chocolate/brown underlay cells (35 cells).
const coloredCells = [
  'R1C2', 'R1C3', 'R1C4', 'R1C5',
  'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7',
  'R3C6', 'R3C7', 'R3C8', 'R3C9',
  'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8',
  'R5C1', 'R5C2',
  'R6C1', 'R6C2', 'R6C3', 'R6C4',
  'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5',
  'R7C8', 'R7C9',
  'R8C3', 'R8C8', 'R8C9',
];
const coloredSet = new Set(coloredCells);

// Drawn black-dot overlay edges (16 edge-centered marks).
const dotEdges = [
  ['R2C2', 'R2C3'], ['R1C4', 'R2C4'], ['R2C6', 'R3C6'], ['R3C8', 'R4C8'],
  ['R3C9', 'R4C9'], ['R4C8', 'R4C9'], ['R7C8', 'R8C8'], ['R8C7', 'R9C7'],
  ['R9C6', 'R9C7'], ['R8C4', 'R8C5'], ['R6C6', 'R7C6'], ['R5C6', 'R6C6'],
  ['R5C4', 'R6C4'], ['R5C1', 'R5C2'], ['R8C2', 'R8C3'], ['R8C3', 'R9C3'],
];
const dotEdgeKey = (a, b) => [a, b].sort().join('_');
const dotEdgeSet = new Set(dotEdges.map(([a, b]) => dotEdgeKey(a, b)));

// Every grid-adjacent edge, derived from the graph rather than hand-listed, so
// the "all other edges" negation below is computed, not transcribed. Kept as
// two offset groups (rightward, downward) so the negation can be one
// `Replicate` per group instead of 128 separate `Pair`s.
const rightEdges = [];
const downEdges = [];
for (const cell of graph.cells()) {
  const right = graph.step(cell, 0, 1);
  if (right) rightEdges.push([cell, right]);
  const down = graph.step(cell, 1, 0);
  if (down) downEdges.push([cell, down]);
}
const undrawnRightStarts = rightEdges
  .filter(([a, b]) => !dotEdgeSet.has(dotEdgeKey(a, b))).map(([a]) => a);
const undrawnDownStarts = downEdges
  .filter(([a, b]) => !dotEdgeSet.has(dotEdgeKey(a, b))).map(([a]) => a);

const notBlackDotKey = Pair.fnToKey((a, b) => a !== b * 2 && b !== a * 2, 9);

// One Replicate per offset: the template pair at the group's first (row-major
// earliest) cell, shifted onto every other undrawn edge of that direction.
const notBlackDotReplicates = [
  [undrawnRightStarts, [0, 1]],
  [undrawnDownStarts, [1, 0]],
].map(([starts, [dRow, dCol]]) => {
  const origin = starts[0];
  return new Replicate(
    [new Pair(
      notBlackDotKey, 'not black dot', origin, graph.step(origin, dRow, dCol))],
    Replicate.encodeTargetCells(starts, origin, graph),
    origin,
  );
});

// Qualifying Olympic years: computed from the rules' own formula, see header.
const cancelledGames = new Set([1916, 1940, 1944]);
const olympicYearDigits = [];
for (let y = 1896; y <= 2020; y += 4) {
  if (cancelledGames.has(y)) continue;
  const digits = String(y).split('').map(Number);
  if (digits.includes(0)) continue;
  if (new Set(digits).size !== digits.length) continue;
  olympicYearDigits.push(digits);
}

// Every directed simple path of exactly 4 orthogonally-adjacent colored cells,
// within the colored area only (both directions, per the header note).
const neighboursInArea = new Map(coloredCells.map(
  cell => [cell, graph.neighbours(cell).filter(n => coloredSet.has(n))]));
const colorPaths = [];
for (const start of coloredCells) {
  const extend = (path) => {
    if (path.length === 4) {
      colorPaths.push(path);
      return;
    }
    for (const next of neighboursInArea.get(path[path.length - 1])) {
      if (!path.includes(next)) extend([...path, next]);
    }
  };
  extend([start]);
}

// Every (path, year) pair whose 4 cells could hold that year's digits in order.
const yearMatches = [];
for (const path of colorPaths) {
  for (const digits of olympicYearDigits) {
    yearMatches.push({ path, digits });
  }
}
const matchConstraint = (m) =>
  new And(m.path.map((cell, i) => new Given(cell, m.digits[i])));

const yearPresenceConstraints = olympicYearDigits.map(digits => new Or(
  yearMatches.filter(m => m.digits === digits).map(matchConstraint)));

const cellCoverageConstraints = coloredCells.map(cell => new Or(
  yearMatches.filter(m => m.path.includes(cell)).map(matchConstraint)));

return [
  new Shape('9x9'),
  new Given('R1C5', 8),
  new Given('R9C9', 7),
  ...dotEdges.map(([a, b]) => new BlackDot(a, b)),
  ...notBlackDotReplicates,
  ...yearPresenceConstraints,
  ...cellCoverageConstraints,
];
