// Title: Two to Tango
// Author: Scott Strosahl
// Video: https://www.youtube.com/watch?v=zy_jQ8Ckfxo
// Source: https://sudokupad.app/dtjb5r5iwe

// Rules encoded: normal sudoku (default row/column/box all-different) + given
// digits, killer cages (distinct cells summing to the labelled total), and the
// "Tango" rule that no run of 3 orthogonally-consecutive cells in a row or
// column may be all-odd or all-even.
//
// The Tango rule is a regular-language "must never" rule, so it is rejected
// via an NFA rather than accepted via a Regex (no native Regex negation).
// State tracks the parities (0 = even, 1 = odd) of the previous two cells
// seen (null before enough history exists); the transition returns
// `undefined` (reject) exactly when the incoming cell's parity would make
// three consecutive cells share one parity. `accept` is unconditionally true
// because only the transition needs to reject.
const parityRunSpec = NFA.encodeSpec({
  startState: { p1: null, p2: null },
  transition: ({ p1, p2 }, value) => {
    const p = value % 2;
    if (p1 !== null && p2 !== null && p1 === p2 && p2 === p) return undefined;
    return { p1: p2, p2: p };
  },
  accept: () => true,
}, 9);

const noThreeSameParityRuns = [];
for (let r = 1; r <= 9; r++) {
  const row = [];
  for (let c = 1; c <= 9; c++) row.push(makeCellId(r, c));
  noThreeSameParityRuns.push(new NFA(parityRunSpec, 'Parity', ...row));
}
for (let c = 1; c <= 9; c++) {
  const col = [];
  for (let r = 1; r <= 9; r++) col.push(makeCellId(r, c));
  noThreeSameParityRuns.push(new NFA(parityRunSpec, 'Parity', ...col));
}

const givens = [
  new Given('R2C2', 2),
  new Given('R2C5', 4),
  new Given('R2C8', 6),
  new Given('R5C3', 7),
  new Given('R5C5', 8),
  new Given('R5C7', 9),
  new Given('R8C2', 1),
  new Given('R8C5', 3),
  new Given('R8C8', 5),
];

// Cage cells and totals, transcribed from the drawn killer cage outlines.
const cageTable = [
  [['R3C5', 'R4C5'], 11],
  [['R1C5', 'R1C6'], 10],
  [['R1C3', 'R1C4'], 10],
  [['R4C6', 'R4C7'], 10],
  [['R4C8', 'R4C9'], 10],
  [['R6C2', 'R6C3'], 10],
  [['R6C6', 'R6C7'], 10],
  [['R7C6', 'R7C7'], 10],
  [['R7C9', 'R8C9'], 10],
  [['R2C1', 'R3C1'], 11],
  [['R3C3', 'R4C3'], 11],
  [['R1C7', 'R1C8'], 11],
];
const cages = cageTable.map(([cells, sum]) => new Cage(sum, ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  ...noThreeSameParityRuns,
];
