// Title: Miracle Multiplier
// Author: Melody Klein
// Video: https://www.youtube.com/watch?v=7ZkkdqtulT0
// Source: https://cracking-the-cryptic.web.app/sudoku/JQLG4Q92L7

// Normal sudoku rules apply (default Shape('9x9') already gives the payload's
// nine standard 3x3 boxes). Anti-king and anti-knight: identical digits
// cannot be a king's or knight's move apart. Orthogonally adjacent digits
// cannot be consecutive, except on the four purple-marked edges, where they
// must be consecutive instead. The two green cells' digits multiply to give
// the two-digit number read across the two blue cells.
//
// ISS's AntiConsecutive is global and unscoped (no exception list), so the
// anti-consecutive rule is built by hand: every orthogonally adjacent pair in
// the grid gets the anti-consecutive Pair, except the four purple edges,
// which instead get a WhiteDot (consecutive) constraint.

const graph = cellGraph('9x9');
const at = (r, c) => makeCellId(r, c);

// Purple-marked edges: the four drawn purple rounded-rectangle overlays, each
// straddling one vertically adjacent pair of cells.
const purpleEdges = [
  [at(3, 3), at(4, 3)],
  [at(3, 5), at(4, 5)],
  [at(6, 4), at(7, 4)],
  [at(6, 6), at(7, 6)],
];
const purpleKeys = new Set(purpleEdges.map(([a, b]) => [a, b].sort().join('-')));

const antiConsecutiveKey = Pair.fnToKey(
  (a, b) => a !== b + 1 && a !== b - 1, new Shape('9x9'));

// Every plain horizontal edge (all of them: the purple edges are all
// vertical) and every plain vertical edge (all except the four purple
// top-cells), as one Replicate per fixed offset -- 140 identical shifted
// copies of two templates rather than 140 separate Pair constraints.
const horizTargets = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 8; c++) horizTargets.push(at(r, c));
}
const purpleTopCells = new Set(purpleEdges.map(([a]) => a));
const vertTargets = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 9; c++) {
    const cell = at(r, c);
    if (!purpleTopCells.has(cell)) vertTargets.push(cell);
  }
}
const antiConsecutivePairs = [
  graph.makeReplicate(
    new Pair(antiConsecutiveKey, 'anti-consecutive', 'R1C1', 'R1C2'),
    horizTargets),
  graph.makeReplicate(
    new Pair(antiConsecutiveKey, 'anti-consecutive', 'R1C1', 'R2C1'),
    vertTargets),
];

// Green cells multiply to give the two-digit number in the blue cells (tens
// digit first, then units -- the blue cells sit left to right in row 4).
// Order of the two green cells does not matter (multiplication commutes), so
// the transition only needs to track: after cell 1, the first digit; after
// cell 2, the product split into tens/ones (rejecting a one-digit product);
// after the tens cell, the remaining expected ones digit.
const multiplierSpec = NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, value) => {
    if (state.step === 0) return { step: 1, d1: value };
    if (state.step === 1) {
      const product = state.d1 * value;
      if (product < 10 || product > 99) return undefined;
      return { step: 2, tens: Math.floor(product / 10), ones: product % 10 };
    }
    if (state.step === 2) {
      if (value !== state.tens) return undefined;
      return { step: 3, ones: state.ones };
    }
    if (state.step === 3) {
      if (value !== state.ones) return undefined;
      return { step: 4 };
    }
    return undefined;
  },
  accept: state => state.step === 4,
}, 9);

return [
  new Shape('9x9'),
  new Given('R3C4', 4),
  new AntiKing(),
  new AntiKnight(),
  ...purpleEdges.map(([a, b]) => new WhiteDot(a, b)),
  ...antiConsecutivePairs,
  new NFA(multiplierSpec, 'green product = blue 2-digit number',
    at(3, 3), at(3, 4), at(4, 4), at(4, 5)),
];
