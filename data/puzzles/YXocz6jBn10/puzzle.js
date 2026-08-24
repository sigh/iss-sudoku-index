// Title: Squaredoku
// Author: David Alderson
// Video: https://www.youtube.com/watch?v=YXocz6jBn10
// Source: https://app.crackingthecryptic.com/sudoku/NBPTrGPN9L

// Normal sudoku rules apply (standard 3x3 boxes, no widening needed).
//
// Each cage adds to a different square number, and can contain no more than
// two instances of any digit. None of the cages carry a printed total, and
// the largest is 16 cells -- more cells than there are digits -- so "no
// total" cannot mean the usual killer-cage all-different here; the "no more
// than two instances" clause is the actual repeat rule for these cages, and
// no AllDifferent is added over them.
//
// Cage geometry: the source's 8th cage entry lists R6C1,R6C2,R7C1,R7C2 plus
// a disconnected R9C1 (skipping R8C1). Every other decoded cage is a literal
// square (one 4x4, three 3x3, one 2x2, two 1x1) matching the title, and
// cages elsewhere in this puzzle are always one orthogonally-connected
// block. Read as two cages that a single source entry merged: a plain 2x2
// (R6C1,R6C2,R7C1,R7C2), and a 1-cell cage at R9C1 that sits beside the
// already-separately-listed 1-cell cages at R9C2 and R9C3 -- three singleton
// "square" cages in a row under the 2x2 block. This restores every one of
// the resulting 9 cages to a literal square (sides 1,1,1,2,2,3,3,3,4); the
// as-listed reading leaves exactly one cage that is both non-square and
// disconnected.
//
// "Different square number" (cross-cage distinctness) is encoded: a small
// selector Var per cage holds that cage's square root (1-9, so it fits the
// grid's own value range with no shape widening), tied to the cage's actual
// Sum via one Or/And per feasible root, with AllDifferent over the 9
// selectors -- distinct roots means distinct squares.
//
// A blue dot joins a pair of cells that sum to a square number. "Not all
// dots are given" is stated explicitly, so the given dots are a positive-only
// clue set: no negative/Strict constraint is added over undotted pairs.

const givens = [
  ['R2C7', 1], ['R4C4', 1], ['R4C5', 4], ['R5C7', 4],
  ['R6C3', 4], ['R8C4', 9], ['R8C8', 1],
];

// Cage cell lists, transcribed from the drawn cage outlines. Cages 0-3 and 7
// are direct transcriptions (unaffected by the split, see the header
// comment). Cages 4 and 8 below are the two pieces of the merged 5-cell
// source entry.
const cages = [
  // cages[0]: the central 4x4 block, rows 2-5 / cols 2-5.
  ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R3C2', 'R3C3', 'R3C4', 'R3C5',
    'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R5C2', 'R5C3', 'R5C4', 'R5C5'],
  // cages[1]: rows 1-3 / cols 6-8 (offset from the real box grid).
  ['R1C6', 'R1C7', 'R1C8', 'R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8'],
  // cages[2]: rows 6-8 / cols 6-8 (offset from the real box grid).
  ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'],
  // cages[3]: rows 6-8 / cols 3-5 (offset from the real box grid).
  ['R6C3', 'R6C4', 'R6C5', 'R7C3', 'R7C4', 'R7C5', 'R8C3', 'R8C4', 'R8C5'],
  // cages[4]: 2x2 block, the connected half of the merged source entry.
  ['R6C1', 'R6C2', 'R7C1', 'R7C2'],
  // cages[5]: single cell.
  ['R9C2'],
  // cages[6]: single cell.
  ['R9C3'],
  // cages[7]: a 2x2 block that happens to sit inside one real box.
  ['R4C8', 'R4C9', 'R5C8', 'R5C9'],
  // cages[8]: single cell, the detached half of the merged source entry.
  ['R9C1'],
];

// Blue dot edges, transcribed from the drawn edge-centered rounded marks
// (deepskyblue fill).
const blueDots = [
  ['R7C1', 'R8C1'], ['R8C3', 'R9C3'], ['R9C3', 'R9C4'], ['R8C6', 'R9C6'],
  ['R6C9', 'R7C9'], ['R5C8', 'R6C8'], ['R5C4', 'R6C4'], ['R3C3', 'R3C4'],
  ['R3C2', 'R4C2'], ['R2C2', 'R3C2'], ['R1C1', 'R1C2'],
];

// For each cage, the feasible square roots given its cell count and the
// "no more than two instances of a digit" cap: with digits 1-9 capped at two
// uses each, a cage of size n has sum in [minSum(n), maxSum(n)], computed by
// filling the smallest/largest digits twice each. Only square roots whose
// square falls in that range are offered -- this is arithmetic bound-checking
// on the stated cap, not a solved-for deduction (e.g. the 16-cell cage's sum
// must lie in [72, 88], and 9^2 = 81 is the only square in range).
function minMaxSum(n) {
  const doubled = [];
  for (let d = 1; d <= 9; d++) doubled.push(d, d);
  const asc = [...doubled].sort((a, b) => a - b);
  const desc = [...doubled].sort((a, b) => b - a);
  const sum = arr => arr.slice(0, n).reduce((a, b) => a + b, 0);
  return [sum(asc), sum(desc)];
}
function feasibleRoots(n) {
  const [lo, hi] = minMaxSum(n);
  const roots = [];
  for (let r = 1; r <= 9; r++) if (r * r >= lo && r * r <= hi) roots.push(r);
  return roots;
}

// Cross-cage distinctness ("adds to a DIFFERENT square number"): one
// selector Var per cage holding its square root (1-9, fits the grid's own
// value range). AllDifferent over the 9 selectors forces the 9 roots -- and
// therefore the 9 squares, since squaring is injective on positive integers
// -- to be pairwise distinct. Each cage's Or ties one feasible root to the
// matching literal Sum on that cage's own cells.
const cageRoot = new Var('VS', 'CageRoot', cages.length);
const cageSumConstraints = cages.map((cells, i) => new Or(
  feasibleRoots(cells.length).map(r => new And([
    new Sum(r * r, ...cells),
    new Given(cageRoot.cell(i + 1), r),
  ]))
));

// "No more than two instances of any digit" per cage: one small NFA per
// (cage, digit) pair, each tracking only that digit's own running count
// (0, 1, 2) and rejecting a third occurrence. Split per digit rather than one
// combined machine per cage, because a joint per-digit-count state blows past
// the compiled-state cap. Skipped for the three 1-cell cages, where the cap
// can never bind.
function maxTwoOfEachDigit(cells) {
  return Array.from({ length: 9 }, (_, i) => {
    const digit = i + 1;
    const spec = NFA.encodeSpec({
      startState: 0,
      transition: (count, value) => {
        if (value !== digit) return count;
        return count >= 2 ? undefined : count + 1;
      },
      accept: () => true,
    }, 9);
    return new NFA(spec, `cap2-digit${digit}`, ...cells);
  });
}
const repeatCapConstraints = cages
  .filter(cells => cells.length > 1)
  .flatMap(maxTwoOfEachDigit);

// Blue dot: the two cells sum to a square number. Both dot-joined cells are
// orthogonally adjacent, so they always share a row or column and are
// therefore already forced distinct -- sums 3..17 -- but the key is written
// generally over 2..18 in case that ever changes.
const dotKey = Pair.fnToKey((a, b) => [4, 9, 16].includes(a + b), 9);
const dotConstraints = blueDots.map(([a, b]) => new Pair(dotKey, 'blue dot', a, b));

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  cageRoot,
  new AllDifferent(...cageRoot.cells()),
  ...cageSumConstraints,
  ...repeatCapConstraints,
  ...dotConstraints,
];
