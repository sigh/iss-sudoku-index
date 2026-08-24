// Title: Crack the Cages
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=YGlH2Ddznc0
// Source: https://app.crackingthecryptic.com/sudoku/fjrpMdgLr6

// Normal sudoku rules (default 9x9 rows/cols/boxes). Digits do not repeat
// within a cage: AllDifferent per cage, independent of how it is split.
// Each cage is split into two non-empty sections: one whose digits sum to
// the cage's printed total, the other whose digits multiply to that same
// total. The rules text does not require either section to be a contiguous
// sub-shape of the cage, and no divider is drawn inside any cage, so a
// section is modelled as any non-empty subset of the cage's cells -- the
// unconstrained reading, not a narrowed one.
//
// Which cells fall in the sum section versus the product section is
// solver-discovered, so each cage is one NFA that nondeterministically
// assigns every cell it reads to the running sum or the running product:
// `transition` branches into both options per cell (the array return is a
// set of next states, i.e. an OR over both assignments), pruning a branch
// as soon as its running total would exceed the cage's number (sums and
// products are monotonic non-decreasing over digits 1-9, so an overshoot
// can never recover). `accept` requires both running totals to land exactly
// on the cage number and both sections to be non-empty (`sawSum`/`sawProduct`).
// Some grid cells belong to no cage at all and carry no cage constraint.

function splitCageNFA(total) {
  return NFA.encodeSpec({
    startState: { s: 0, p: 1, sawSum: false, sawProduct: false },
    transition({ s, p, sawSum, sawProduct }, value) {
      const next = [];
      const s2 = s + value;
      if (s2 <= total) next.push({ s: s2, p, sawSum: true, sawProduct });
      const p2 = p * value;
      if (p2 <= total) next.push({ s, p: p2, sawSum, sawProduct: true });
      return next;
    },
    accept({ s, p, sawSum, sawProduct }) {
      return s === total && p === total && sawSum && sawProduct;
    },
  }, 9);
}

// Cage cell lists transcribed from the puzzle's drawn cage outlines and
// printed totals; some grid cells are drawn outside every cage outline and
// so carry no cage constraint at all.
const cages = [
  { total: 30, cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'] },
  { total: 20, cells: ['R3C1', 'R2C1', 'R2C2', 'R2C3', 'R3C3'] },
  { total: 10, cells: ['R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8'] },
  { total: 30, cells: ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'] },
  { total: 20, cells: ['R3C2', 'R4C2', 'R4C1', 'R5C1', 'R5C2', 'R4C3'] },
  { total: 21, cells: ['R3C4', 'R3C5', 'R4C5', 'R5C5', 'R4C4', 'R6C5'] },
  { total: 16, cells: ['R3C7', 'R3C8', 'R4C8', 'R5C8'] },
  { total: 15, cells: ['R5C3', 'R6C3', 'R7C3', 'R7C2', 'R6C2'] },
  { total: 18, cells: ['R5C4', 'R6C4', 'R7C4', 'R8C4', 'R8C3', 'R8C2'] },
  { total: 14, cells: ['R6C1', 'R7C1', 'R8C1', 'R9C1'] },
  { total: 18, cells: ['R6C6', 'R6C7', 'R7C7', 'R7C8', 'R7C6'] },
  { total: 12, cells: ['R8C5', 'R8C6', 'R8C7', 'R8C8'] },
  { total: 28, cells: ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C7', 'R9C6', 'R9C8', 'R9C9'] },
];

const cageConstraints = cages.flatMap(({ total, cells }) => [
  new AllDifferent(...cells),
  new NFA(splitCageNFA(total), '', ...cells),
]);

return [
  new Shape('9x9'),
  ...cageConstraints,
];
