// Title: The Sudoku IQ Test
// Author: Prowling Tiger
// Video: https://www.youtube.com/watch?v=6HXLB8V85C8
// Source: https://cracking-the-cryptic.web.app/sudoku/NP224HdrF4

// Normal sudoku rules apply (the default Shape('9x9') baseline: rows,
// columns and 3x3 boxes all-different, 1-9). No digits are given.
//
// Killer cages: 17 drawn cages, each with a printed total and no repeated
// digit within the cage. An 18th `cages` payload entry carries no cells (a
// metadata stub) and is omitted. Cage cells are not all-different from cells
// outside the same cage -- only within it -- and cages cover 59 of the 81
// cells; the remaining 22 carry no cage rule at all, only ordinary sudoku.
//
// Exception (the puzzle's whole gimmick, per the rules' own worked example --
// [9,3,4] totals 7, not 16): a 9 placed in a cage contributes 0 to that
// cage's total instead of 9. This is a pure function of each cell's own
// digit, not a hidden/solver-determined property, so it needs no auxiliary
// Var -- a custom NFA reads each cage's cells in order, accumulating
// `value === 9 ? 0 : value`, and accepts only when the running total equals
// the cage's printed total after the last cell.

// One NFA state per attainable running total, capped at the cage's own
// target (branches that overshoot are killed immediately since no later
// step can reduce the total); state count is bounded well under the 4096
// compile limit for cages this small (<=6 cells, totals <=24).
function killerSumSpec(target) {
  return {
    startState: 0,
    transition: (sum, value) => {
      const next = sum + (value === 9 ? 0 : value);
      return next > target ? undefined : next;
    },
    accept: (sum) => sum === target,
  };
}

// Cell lists and totals transcribed from the payload's `cages` array
// (0-indexed [row, col] pairs converted to R#C# here).
const cages = [
  { cells: ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R2C2'], total: 17 },
  { cells: ['R1C3', 'R1C4', 'R2C4'], total: 11 },
  { cells: ['R3C3', 'R3C4', 'R3C5', 'R2C5'], total: 19 },
  { cells: ['R1C5', 'R1C6'], total: 6 },
  { cells: ['R3C6', 'R3C7'], total: 3 },
  { cells: ['R1C8', 'R1C9', 'R2C9'], total: 12 },
  { cells: ['R2C8', 'R3C8', 'R4C8', 'R4C9'], total: 10 },
  { cells: ['R5C8', 'R6C8', 'R6C9', 'R5C9'], total: 9 },
  { cells: ['R4C7', 'R5C7', 'R6C7', 'R7C7'], total: 18 },
  { cells: ['R7C8', 'R8C8', 'R8C9', 'R9C9'], total: 18 },
  { cells: ['R7C5', 'R7C6'], total: 13 },
  { cells: ['R8C5', 'R9C5', 'R8C6', 'R9C6'], total: 16 },
  { cells: ['R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C4', 'R8C4'], total: 24 },
  { cells: ['R8C1', 'R9C1', 'R9C2'], total: 9 },
  { cells: ['R6C1', 'R6C2', 'R5C2'], total: 14 },
  { cells: ['R4C4', 'R5C4'], total: 15 },
  { cells: ['R5C6', 'R4C6', 'R4C5', 'R5C5'], total: 14 },
];

// A 2-cell cage's total is a plain two-cell relation, so it uses Pair
// (per lint_constraints.js guidance) rather than a one-machine-per-cage NFA;
// larger cages still need the NFA's running total.
const contribution = (v) => (v === 9 ? 0 : v);
const twoCellTotal = (target) =>
  Pair.fnToKey((a, b) => contribution(a) + contribution(b) === target, 9);

const cageConstraints = cages.flatMap(({ cells, total }, i) => [
  new AllDifferent(...cells),
  cells.length === 2
    ? new Pair(
        twoCellTotal(total),
        `Cage ${i} (9-exclusion total ${total})`,
        ...cells)
    : new NFA(
        NFA.encodeSpec(killerSumSpec(total), 9),
        `Cage ${i} (9-exclusion total ${total})`,
        ...cells),
]);

return [
  new Shape('9x9'),
  ...cageConstraints,
];
