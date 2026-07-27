// Title: Inverted Killer
// Author: NurglesGift
// Video: https://www.youtube.com/watch?v=4ac5tj7Rsy8
// Source: https://sudokupad.app/n39davprm6

// Rules encoded:
// - Normal sudoku rules apply (rows, columns, boxes -- the default baseline).
// - R6C6 is given as 3.
// - The grid is partitioned into 33 cages. Digits cannot repeat within a
//   cage (AllDifferent). Each cage's stated total is the sum of its digits
//   with its own highest digit counted as negative instead of positive:
//   total = (sum of all digits in the cage) - 2 * (max digit in the cage).
//   No native class expresses this "invert the max" arithmetic directly.
//   For a 2-cell cage {a, b} the identity collapses algebraically:
//   a + b - 2*max(a, b) = min(a, b) - max(a, b) = -|a - b|, i.e. the two
//   digits differ by exactly -target. That is WhiteDot's exact semantics
//   (consecutive digits) when -target === 1, so those cages use WhiteDot;
//   every other 2-cell cage uses a Pair with the equivalent difference
//   relation (no native "differ by k>1" class exists). A 3-cell cage has
//   no such two-term simplification, so it keeps the general AllDifferent
//   plus an NFA tracking the running sum and max across its cells,
//   accepting once sum - 2*max === target (order-independent, so cells are
//   read in the source's own order).

// Cage table transcribed from the source's cage list: [target, cells].
// Every cage total in the source is already the signed (post-inversion)
// value, so it is used directly as each relation's target.
const cages = [
  [-2, ['R1C5', 'R1C6', 'R2C6']],
  [0, ['R6C8', 'R6C9', 'R7C9']],
  [-3, ['R6C6', 'R6C7', 'R7C6']],
  [0, ['R7C3', 'R8C3', 'R9C3']],
  [-2, ['R7C2', 'R8C2', 'R9C2']],
  [-1, ['R5C1', 'R6C1', 'R7C1']],
  [-2, ['R5C2', 'R6C2', 'R6C3']],
  [-6, ['R4C1', 'R4C2']],
  [0, ['R3C3', 'R4C3', 'R5C3']],
  [-4, ['R3C1', 'R3C2']],
  [0, ['R1C1', 'R1C2', 'R2C1']],
  [-1, ['R2C2', 'R2C3']],
  [0, ['R1C3', 'R1C4', 'R2C4']],
  [-1, ['R1C7', 'R1C8']],
  [0, ['R2C7', 'R3C6', 'R3C7']],
  [-1, ['R2C5', 'R3C4', 'R3C5']],
  [-1, ['R4C5', 'R4C6', 'R4C7']],
  [-3, ['R4C4', 'R5C4']],
  [-2, ['R6C4', 'R6C5']],
  [-4, ['R5C5', 'R5C6']],
  [-4, ['R8C1', 'R9C1']],
  [-5, ['R1C9', 'R2C8', 'R2C9']],
  [-2, ['R3C8', 'R3C9']],
  [-6, ['R4C9', 'R5C9']],
  [-2, ['R4C8', 'R5C7', 'R5C8']],
  [-4, ['R8C9', 'R9C9']],
  [-3, ['R8C8', 'R9C8']],
  [-8, ['R8C7', 'R9C7']],
  [-2, ['R7C7', 'R7C8']],
  [-5, ['R7C4', 'R7C5']],
  [-6, ['R8C4', 'R9C4']],
  [-1, ['R8C5', 'R8C6']],
  [-2, ['R9C5', 'R9C6']],
];

// Difference-relation Pair keys, cached per required difference so repeated
// targets (e.g. the several 2-cell cages totalling -2) share one key.
const diffKeyCache = new Map();
function diffPairKey(diff) {
  if (!diffKeyCache.has(diff)) {
    diffKeyCache.set(diff, Pair.fnToKey((a, b) => Math.abs(a - b) === diff, 9));
  }
  return diffKeyCache.get(diff);
}

function invertedTwoCellCage(target, cells) {
  const diff = -target;
  const relation = diff === 1
    ? new WhiteDot(...cells)
    : new Pair(diffPairKey(diff), `differ by ${diff}`, ...cells);
  return [new AllDifferent(...cells), relation];
}

// State is {sum, max} over the digits seen so far (both start at 0, below
// any real digit, so the first cell always raises max). Accept once every
// cage cell has been consumed and sum - 2*max hits the cage's target.
// Without a bound, the compiler explores runs of unbounded length and sum
// climbs forever, so maxDepth is set to the cage's own cell count (3 for
// every cage reaching this function), keeping sum <= 27 and max <= 9 and
// the compiled state space tiny.
function invertedThreeCellCageNFA(target) {
  return NFA.encodeSpec({
    startState: { sum: 0, max: 0 },
    transition: ({ sum, max }, value) => (
      { sum: sum + value, max: Math.max(max, value) }
    ),
    accept: ({ sum, max }) => sum - 2 * max === target,
    maxDepth: 3,
  }, 9);
}

function invertedThreeCellCage(target, cells) {
  return [
    new AllDifferent(...cells),
    new NFA(
      invertedThreeCellCageNFA(target), `inverted cage (${target})`, ...cells),
  ];
}

function invertedCage(target, cells) {
  return cells.length === 2
    ? invertedTwoCellCage(target, cells)
    : invertedThreeCellCage(target, cells);
}

return [
  new Shape('9x9'),
  new Given('R6C6', 3),
  ...cages.flatMap(([target, cells]) => invertedCage(target, cells)),
];
