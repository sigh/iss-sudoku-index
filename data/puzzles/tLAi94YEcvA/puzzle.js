// Title: Key Performance Parameters
// Author: NotThatItMatters
// Video: https://www.youtube.com/watch?v=tLAi94YEcvA
// Source: https://sudokupad.app/fnbj8y7rf2

// Normal sudoku rules apply.
//
// 21 cages, each entirely inside one box (so cage-cell distinctness is
// already implied by the box's own all-different and needs no separate
// constraint). Each cage's own sum must be some prime raised to a positive
// integer power, and no two of the 21 cages may share a sum.
//
// Digits do not repeat on the marked (grey dashed) diagonal, R1C1-R9C9.

// Every cage lies inside exactly one box, so its digits are a subset of that
// box's 1-9, and its total ranges over every integer in
// [minSumOfSize, maxSumOfSize] with no gaps (subset sums of a fixed-size set
// of distinct 1-9 digits are consecutive). A cage's own rule ("sum to a
// prime power") is one Or over its own reachable prime powers.
//
// A raw total can reach 44 (the 8-cell cages), far past ISS's 16-value cap
// on any Var/cell domain, so totals are never materialized directly. Instead
// each cage gets an index Var over "which of its own candidate prime powers
// is the true total" (at most 10 candidates for any cage here); the Or above
// ties the index to the actual sum. Cross-cage distinctness ("no two cages
// share a sum") only has to be checked between cages whose candidate lists
// overlap -- a custom Pair relation over the two index Vars forbids the
// combinations that would pick the same prime power.

const cages = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R2C2'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ['R8C8'],
  ['R4C4', 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5', 'R6C6'],
  ['R6C4'],
  ['R4C6'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R1C7'],
  ['R3C9'],
  ['R2C7', 'R2C8', 'R3C7', 'R3C8'],
  ['R1C6', 'R2C6'],
  ['R1C5', 'R2C4', 'R2C5', 'R3C4', 'R3C5', 'R3C6'],
  ['R4C8', 'R4C9'],
  ['R4C7', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8'],
  ['R7C4', 'R7C6', 'R8C4', 'R8C6', 'R9C4', 'R9C5', 'R9C6'],
  ['R7C5', 'R8C5'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C1', 'R6C1', 'R6C2', 'R6C3'],
  ['R5C2', 'R5C3'],
  ['R7C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3'],
  ['R8C1', 'R8C2', 'R9C2'],
];

function isPrime(n) {
  if (n < 2) return false;
  for (let d = 2; d * d <= n; d++) {
    if (n % d === 0) return false;
  }
  return true;
}

// Every prime power p^k (k >= 1) up to the largest possible cage total (44,
// for an 8-cell cage).
const MAX_POSSIBLE_TOTAL = 44;
const primePowers = [];
for (let p = 2; p <= MAX_POSSIBLE_TOTAL; p++) {
  if (!isPrime(p)) continue;
  for (let v = p; v <= MAX_POSSIBLE_TOTAL; v *= p) primePowers.push(v);
}

// This cage's reachable prime-power totals, given its cell count.
function candidateTotals(size) {
  const min = (size * (size + 1)) / 2;   // smallest `size` distinct digits from 1-9
  const max = (size * (19 - size)) / 2;  // largest `size` distinct digits from 1-9
  return primePowers.filter(v => v >= min && v <= max);
}

const candidates = cages.map(cells => candidateTotals(cells.length));

// The index Var's domain only needs to cover the longest candidate list.
const NUM_VALUES = Math.max(9, ...candidates.map(list => list.length));

function* range(from, to) {
  for (let i = from; i <= to; i++) yield i;
}

// One index Var per cage: index cell holds which entry of that cage's own
// candidates list is its actual total.
const indexVar = new Var('I', 'Cage total index', cages.length);

// Ties each cage's index Var to its actual sum, and (via the Or) forces the
// sum itself to be one of the candidate prime powers.
const cageTies = cages.map((cells, i) => new Or(
  candidates[i].map((total, k) => new And([
    new Sum(total, ...cells),
    new Given(indexVar.cell(i + 1), k + 1),
  ]))
));

// No two cages may land on the same total. Cages of the same size share the
// exact same candidate list (in the same order), so for them "different
// total" is just "different index" -- one AllDifferent per size class.
// Cages of different sizes have different candidate lists, so their indices
// aren't directly comparable; those pairs (when their candidate lists
// actually overlap -- disjoint lists can never collide) get a custom Pair
// relation instead.
const bySize = new Map();
cages.forEach((cells, i) => {
  const size = cells.length;
  if (!bySize.has(size)) bySize.set(size, []);
  bySize.get(size).push(i);
});

const sameSizeDistinctness = [...bySize.values()]
  .filter(idxs => idxs.length > 1)
  .map(idxs => new AllDifferent(...idxs.map(i => indexVar.cell(i + 1))));

const crossSizePairs = [];
for (let i = 0; i < cages.length; i++) {
  for (let j = i + 1; j < cages.length; j++) {
    if (cages[i].length === cages[j].length) continue; // handled above
    const overlap = candidates[i].some(v => candidates[j].includes(v));
    if (overlap) crossSizePairs.push([i, j]);
  }
}

const crossSizeDistinctness = crossSizePairs.map(([i, j]) => {
  const listI = candidates[i];
  const listJ = candidates[j];
  // Forbid picking the same total: true (allowed) unless both indices
  // resolve to the same prime power.
  const relation = (a, b) => listI[a - 1] !== listJ[b - 1];
  const key = Pair.fnToKey(relation, NUM_VALUES);
  return new Pair(
    key, `cage${i}-cage${j}-distinct`,
    indexVar.cell(i + 1), indexVar.cell(j + 1));
});

// Widening the grid for the index Vars widens the main grid's alphabet too;
// replicate one Given(1-9) template onto every real grid cell to hold it to
// the true digit range.
const graph = cellGraph('9x9');
const gridCells = graph.cells();
const gridDigitRange = graph.makeReplicate(
  [new Given(gridCells[0], ...range(1, 9))],
  gridCells);

return [
  new Shape('9x9', NUM_VALUES),
  gridDigitRange,

  new Given('R4C3', 3),
  new Given('R6C5', 7),

  new Diagonal(-1), // main diagonal, R1C1-R9C9

  indexVar,
  ...cageTies,
  ...sameSizeDistinctness,
  ...crossSizeDistinctness,
];
