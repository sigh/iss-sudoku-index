// Title: Sneaky Killers
// Author: Scojo
// Video: https://www.youtube.com/watch?v=SiMG6L3vkhg
// Source: https://app.crackingthecryptic.com/sudoku/gP3MLq8HTr

// Normal sudoku, standard 3x3 boxes (drawn regions match the default tiling,
// so no explicit Region constraint is needed). No givens.
//
// Every cage below is a killer-style cage with all-different cells and no
// printed total (a cage's own total is unknown). 15 white dots are drawn on
// borders between two cages (not two cells): each one means the two cages'
// (unknown) totals differ by X, one shared unknown X for every dot. 9 grid
// cells are not part of any drawn cage; that is the cage list as drawn, not
// an omission.
//
// A no-total cage with no other constraint is exactly AllDifferent(cells);
// single-cell cages (I, J, K, M, R, S, U) add no local constraint at all and
// are listed only because a dot references them.

const cages = {
  A: ['R1C7', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9'],
  B: ['R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R3C6'],
  C: ['R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'],
  D: ['R4C3', 'R5C1', 'R5C2', 'R5C3'],
  E: ['R3C2', 'R3C3'],
  F: ['R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C6', 'R6C7'],
  G: ['R5C4', 'R6C4', 'R6C5'],
  H: ['R6C1', 'R6C2', 'R6C3'],
  I: ['R7C1'],
  J: ['R7C2'],
  K: ['R7C3'],
  L: ['R8C1', 'R8C2'],
  M: ['R9C1'],
  N: ['R9C2', 'R9C3', 'R9C4'],
  O: ['R8C3', 'R8C4', 'R8C5', 'R9C5'],
  P: ['R7C4', 'R7C5', 'R7C6', 'R7C7', 'R8C6'],
  Q: ['R8C7', 'R9C6', 'R9C7'],
  R: ['R7C8'],
  S: ['R7C9'],
  T: ['R8C9', 'R9C9'],
  U: ['R9C8'],
  V: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C1', 'R2C2', 'R2C3'],
};

// Cage-cell all-different constraints (skip single-cell cages: no-op).
const cageConstraints = Object.values(cages)
  .filter(cells => cells.length > 1)
  .map(cells => new AllDifferent(...cells));

// The 15 drawn white-dot cage pairs (cage-letter pairs, each naming the two
// cages the drawn dot sits between).
const dotPairs = [
  ['V', 'B'], ['B', 'A'], ['A', 'C'], ['D', 'C'], ['E', 'D'],
  ['H', 'G'], ['G', 'F'], ['R', 'S'], ['U', 'T'], ['O', 'Q'],
  ['K', 'O'], ['P', 'R'], ['H', 'I'], ['M', 'N'], ['J', 'L'],
];

// Shared unknown X: "the value of X is the same for every white dot, but
// must be deduced". A single 1-cell Var, domain 1-9 (Var domain follows the
// Shape's alphabet). Every cage has at most 9 cells and cage totals are
// bounded by the all-different digit range, so any true X value fits well
// inside 1-9 -- no widened Shape is needed.
const xVar = new Var('X', 'shared cage-total difference', 1);
const x = xVar.cell(1);

// |total(cageA) - total(cageB)| = X, as an Or of the two signed equalities.
// EqualSum enforces its segments to have equal sums, so folding X in as an
// extra member of one segment expresses total(cageA) = total(cageB) + X (and
// symmetrically for the other sign) without any coefficient arithmetic.
const dotConstraints = dotPairs.map(([a, b]) => new Or([
  new EqualSum(cages[a], [...cages[b], x]),
  new EqualSum([...cages[a], x], cages[b]),
]));

return [
  new Shape('9x9'),
  ...cageConstraints,
  xVar,
  ...dotConstraints,
];
