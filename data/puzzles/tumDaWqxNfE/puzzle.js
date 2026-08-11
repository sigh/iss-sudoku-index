// Title: German Whisper Cages
// Author: Emre Kolotoglu
// Video: https://www.youtube.com/watch?v=tumDaWqxNfE
// Source: https://app.crackingthecryptic.com/sudoku/Mgf82DnnBH

// Normal sudoku rules apply (default Shape row/column/box regions).
// "In cages, digits cannot repeat" -- AllDifferent per cage (a single-cell
// cage needs no local constraint) -- "and sum to the cage total" -- no cage
// total number is printed anywhere in the payload, so a cage's total is an
// unlabeled quantity, not a given. "The cage totals of two cages that share
// an edge must differ by at least 5" is the puzzle's only numeric rule: a
// German-Whisper-style (>=5) difference applied between neighbouring cage
// sums instead of between neighbouring cells, which is the pun in the title.
// 8 grid cells belong to no cage (R1C7, R1C9, R2C9, R7C7, R7C8, R7C9, R9C8,
// R9C9) and carry only ordinary sudoku constraints.
//
// Each cage's total has no given value, so it is modelled as an auxiliary
// quantity: a Var pair per cage holds the total in base 10 (H = tens digit,
// L = ones digit), tied to the cage's own cells with a coefficient Sum. A
// <=8-cell cage of distinct 1-9 digits totals at most 44, so two base-10
// digits (each 0-9) are always enough. The grid alphabet is widened to 0-9
// so the tens/ones Vars have a 0 low end; every playable grid cell then gets
// an explicit Given restricting it back to the true 1-9 digit set.
//
// The >=5 comparison is between two 2-digit composite numbers, which no
// native class states directly (Whisper compares single grid/Var values, not
// H*10+L pairs), so it is one small reusable NFA per adjacent cage pair, run
// over that pair's 4 digit cells [H_i, L_i, H_j, L_j]: it accumulates the
// running numeric difference step by step and accepts iff the final
// difference's absolute value is >= 5.
//
// Cage adjacency (which pairs of cages share a grid edge) is derived below
// from the cage cell lists via cellGraph().neighbours(), not hand-enumerated.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);

// Provenance: cage cell lists transcribed from the puzzle's drawn cage
// layout (1-indexed [row, col] pairs, in cage-array order).
const cageCellCoords = [
  [[1, 5], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [4, 1]],
  [[5, 1], [6, 1], [6, 2], [6, 3], [5, 3], [5, 4], [4, 4]],
  [[5, 2], [4, 2], [3, 2], [2, 2], [2, 3], [2, 4], [2, 5]],
  [[1, 6], [2, 6], [3, 6], [3, 5], [3, 4], [3, 3], [4, 3]],
  [[1, 8]],
  [[2, 8]],
  [[3, 8], [3, 9]],
  [[2, 7], [3, 7]],
  [[4, 8], [4, 7]],
  [[4, 9], [5, 9], [6, 9], [6, 8], [6, 7]],
  [[5, 8]],
  [[5, 7]],
  [[5, 6]],
  [[5, 5]],
  [[4, 6], [4, 5]],
  [[6, 4], [6, 5], [6, 6]],
  [[7, 1], [8, 1], [9, 1]],
  [[7, 3], [7, 2], [8, 2]],
  [[8, 3], [9, 3], [9, 2]],
  [[7, 4], [8, 4], [9, 4]],
  [[7, 5], [8, 5], [9, 5]],
  [[7, 6], [8, 6], [9, 6]],
  [[8, 7], [9, 7]],
  [[8, 8]],
  [[8, 9]],
];

const cages = cageCellCoords.map(
  coords => coords.map(([r, c]) => makeCellId(r, c)));

// Restrict every grid cell back to the true 1-9 digit set (the shape was
// widened to 0-9 only to give the cage-total tens/ones Vars a 0 low end).
// One shifted-copy template via Replicate, rather than 81 individual Givens.
const digitRestriction = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// One AllDifferent per cage with 2+ cells ("digits cannot repeat"); a
// single-cell cage adds no local constraint of its own.
const cageAllDifferent = cages
  .filter(cells => cells.length > 1)
  .map(cells => new AllDifferent(...cells));

// One tens/ones Var pair per cage, tied to that cage's digit sum.
const totalsH = new Var('H', 'Cage total (tens)', cages.length);
const totalsL = new Var('L', 'Cage total (ones)', cages.length);
const cageTotalTies = cages.map((cells, i) => new Sum(
  0, ...cells, [totalsH.cell(i + 1), -10], [totalsL.cell(i + 1), -1]));

// Cage adjacency: two cages "share an edge" when some cell of one is
// orthogonally adjacent to some cell of the other.
const cageOfCell = new Map();
cages.forEach((cells, i) => cells.forEach(cell => cageOfCell.set(cell, i)));
const adjacentCagePairs = new Set();
for (const cell of graph.cells()) {
  const i = cageOfCell.get(cell);
  if (i === undefined) continue;
  for (const neighbour of graph.neighbours(cell)) {
    const j = cageOfCell.get(neighbour);
    if (j === undefined || j === i) continue;
    adjacentCagePairs.add(i < j ? `${i}_${j}` : `${j}_${i}`);
  }
}

// Reusable NFA: reads [H_i, L_i, H_j, L_j] in that order, accumulating the
// running difference (H_i*10 + L_i) - (H_j*10 + L_j), and accepts iff the
// final difference's absolute value is at least 5. `transition` is not told
// which of the 4 symbols it is reading (the sign and place value differ per
// position), so position is folded into the state as `step`.
const cageDiffSpec = {
  startState: { step: 0, accum: 0 },
  transition: ({ step, accum }, value) => {
    switch (step) {
      case 0: return { step: 1, accum: value * 10 };         // + 10*H_i
      case 1: return { step: 2, accum: accum + value };      // + L_i => X = H_i*10+L_i
      case 2: return { step: 3, accum: accum - value * 10 }; // - 10*H_j
      case 3: return { step: 4, accum: accum - value };      // - L_j => X - Y
    }
  },
  accept: ({ step, accum }) => step === 4 && Math.abs(accum) >= 5,
};

const cageDiffNFA = NFA.encodeSpec(cageDiffSpec, shape);

const cageDiffConstraints = [...adjacentCagePairs].map(key => {
  const [i, j] = key.split('_').map(Number);
  return new NFA(
    cageDiffNFA, 'cage-diff',
    totalsH.cell(i + 1), totalsL.cell(i + 1),
    totalsH.cell(j + 1), totalsL.cell(j + 1));
});

return [
  shape,
  digitRestriction,
  ...cageAllDifferent,
  totalsH,
  totalsL,
  ...cageTotalTies,
  ...cageDiffConstraints,
];
