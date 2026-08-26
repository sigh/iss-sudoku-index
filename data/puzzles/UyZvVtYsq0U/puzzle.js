// Title: Summetry
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=UyZvVtYsq0U
// Source: https://sudokupad.app/o4u3kz1764

// Standard sudoku rules (rows, columns, boxes).
//
// Shading rule: `YinYang()` gives exactly the stated shading global -- a
// two-value overlay ('YY'), each shade orthogonally connected, no monochrome
// 2x2. Central symmetry is added on top: each cell and its 180-degree
// rotational partner take the same YY value.
//
// Cage rule: cage digits are all-different (a no-total cage), each cage
// holds at least one shaded and one unshaded cell, and its unshaded digits'
// sum equals its shaded digits' product. That last clause ties an unknown
// 2-coloring to a nonlinear arithmetic check, so it is built as an
// enumeration over every admissible shaded/unshaded split of the cage (every
// non-empty, non-full subset): one branch per split fixes that split's YY
// values, then checks sum(unshaded) == product(shaded) with a small NFA that
// accumulates the unshaded sum first, then multiplies the shaded digits
// into it, pruning (dead branch) the instant the running product exceeds
// the fixed sum target -- since a product only grows, once it passes the
// target it can never return to equality.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const yy = graph.makeOverlay('YY');

// Central symmetry: cell (r, c) and its 180-degree partner (10-r, 10-c) take
// the same shading. The center cell (R5C5) maps to itself and needs no pair.
const symmetryPairs = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const pr = 10 - r, pc = 10 - c;
    if (pr < r || (pr === r && pc <= c)) continue; // each pair once
    symmetryPairs.push([makeCellId(r, c), makeCellId(pr, pc)]);
  }
}
const symmetryRules = symmetryPairs.map(
  ([a, b]) => new SameValues(2, ...yy.at([a, b])));

// One NFA per admissible shaded/unshaded split (mask) of a cage: cells whose
// mask bit is 0 are read first (their digits summed into `sum`), then cells
// whose bit is 1 are read (their digits multiplied into `product`, dead the
// moment it exceeds `sum`). `mask` ranges over 1 .. 2^n-2 so both shades are
// non-empty, per the rule's "at least one shaded and one unshaded" clause.
function splitSumProductNFA(cells, mask) {
  const n = cells.length;
  const unshadedIdx = [], shadedIdx = [];
  for (let i = 0; i < n; i++) (mask & (1 << i) ? shadedIdx : unshadedIdx).push(i);
  const orderedCells = [
    ...unshadedIdx.map(i => cells[i]),
    ...shadedIdx.map(i => cells[i]),
  ];
  const nUnshaded = unshadedIdx.length;
  const spec = NFA.encodeSpec({
    startState: { phase: 'sum', seen: 0, sum: 0, product: 1 },
    transition: (state, value) => {
      if (state.phase === 'sum') {
        const seen = state.seen + 1;
        const sum = state.sum + value;
        return seen === nUnshaded
          ? { phase: 'product', seen: 0, sum, product: 1 }
          : { phase: 'sum', seen, sum, product: 1 };
      }
      const product = state.product * value;
      if (product > state.sum) return undefined; // product only grows: dead
      return { phase: 'product', seen: 0, sum: state.sum, product };
    },
    accept: (state) => state.phase === 'product' && state.product === state.sum,
  }, 9);
  return new NFA(spec, 'cage_shade_sum_product', ...orderedCells);
}

// Enumerate every non-empty, non-full shaded/unshaded split of one cage: an
// `And` of the split's YY `Given`s plus the matching sum/product NFA, `Or`ed
// over all such splits.
function cageShadeSumProductRule(cells) {
  const n = cells.length;
  const cellsYY = yy.at(cells);
  const branches = [];
  for (let mask = 1; mask < (1 << n) - 1; mask++) {
    const shadeGivens = cells.map((_, i) =>
      new Given(cellsYY[i], (mask & (1 << i)) ? SHADED : UNSHADED));
    branches.push(new And([...shadeGivens, splitSumProductNFA(cells, mask)]));
  }
  return new Or(branches);
}

// Cages, cells in reading order.
const cages = {
  A: ['R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5', 'R7C5', 'R8C5'],
  B: ['R1C4', 'R1C5', 'R1C6', 'R2C5'],
  C: ['R1C1', 'R1C2', 'R2C1', 'R2C2'],
  D: ['R2C6', 'R2C7', 'R2C8'],
  E: ['R3C1', 'R3C2', 'R3C3', 'R4C1'],
  F: ['R5C8', 'R6C8', 'R7C8', 'R8C8'],
  G: ['R6C2', 'R6C3', 'R7C2', 'R8C2'],
  H: ['R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8', 'R4C9', 'R5C7'],
  I: ['R7C6', 'R8C6', 'R9C6', 'R9C7'],
};

const cageRules = Object.values(cages).flatMap(cells => [
  new AllDifferent(...cells),
  cageShadeSumProductRule(cells),
]);

return [
  new Shape('9x9'),
  new YinYang(),
  ...symmetryRules,
  ...cageRules,
];
