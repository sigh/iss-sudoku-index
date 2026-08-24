// Title: Nonogram Sudoku
// Author: Marvin Kannhauser
// Video: https://www.youtube.com/watch?v=TxAbo4YT6yg
// Source: https://app.crackingthecryptic.com/sudoku/78Mb3dbbH3

// Standard sudoku (rows/columns/boxes, unchanged -- the payload's regions are
// exactly the nine 3x3 boxes) plus a nonogram overlay on top:
//
// - Nonogram: some cells are "coloured". The clue lists below are each row's
//   and column's run lengths in cell order (col 1->9 for rows, row 1->9 for
//   columns), read outward-to-inward as printed on the grid's outside clue
//   lanes -- the standard nonogram convention that the printed clue sequence
//   lists runs in the same order as the cells they occupy.
// - "Coloured cells are either higher than each neighbour or lower than each
//   neighbour, and have no consecutive neighbours (a neighbour is a cell
//   sharing an edge)": every coloured cell is a strict local extremum among
//   its orthogonal neighbours, and additionally differs from every neighbour
//   by at least 2 (folding in the "no consecutive neighbours" clause, since a
//   neighbour is always a different digit already by row/column sudoku).
//
// A 3-valued Var overlay ('VS') encodes, per cell: NONE (not coloured), HI
// (coloured, higher than every neighbour), LO (coloured, lower than every
// neighbour). "Coloured" for the nonogram run-length clues is HI or LO.

const NONE = 1, HI = 2, LO = 3;

const graph = cellGraph('9x9');
const state = graph.makeOverlay('VS');

// Row/column run-length clues, transcribed from the grid's outside clue
// lanes (col 1->9 for a row, row 1->9 for a column).
const rowClues = {
  1: [4, 1, 1], 2: [1, 1], 3: [3, 2, 1],
  4: [6], 5: [2, 1, 1], 6: [3, 1, 1],
  7: [4], 8: [3], 9: [4],
};
const colClues = {
  1: [3, 1], 2: [1, 1, 2], 3: [1, 1, 2],
  4: [1, 1], 5: [5, 1], 6: [1, 2, 3],
  7: [1, 3], 8: [2, 1, 1], 9: [1, 2, 2, 1],
};

// A coloured cell is state HI or LO ('[23]'); an uncoloured cell is NONE
// ('1'). Runs are separated by one-or-more uncoloured cells, with optional
// uncoloured runs at each end.
const runPattern = (runs) =>
  '1*' + runs.map(n => `[${HI}${LO}]{${n}}`).join('1+') + '1*';

const rowRegexes = Object.entries(rowClues).map(([r, runs]) =>
  new Regex(runPattern(runs), ...state.row(Number(r))));
const colRegexes = Object.entries(colClues).map(([c, runs]) =>
  new Regex(runPattern(runs), ...state.column(Number(c))));

// Per orthogonal edge (A, B): if A is HI, A must beat B by >= 2; if A is LO,
// B must beat A by >= 2; NONE at A imposes nothing from A's side. Checked
// symmetrically for B. Scans [stateA, valA, stateB, valB] for one edge.
// State values outside {HI, LO} collapse to NONE, matching the Given-imposed
// domain {NONE, HI, LO} but keeping the compiled state count small.
const edgeSpec = NFA.encodeSpec({
  startState: { step: 0 },
  transition: (st, value) => {
    if (st.step === 0) {
      const s = (value === HI || value === LO) ? value : NONE;
      return { step: 1, stateA: s };
    }
    if (st.step === 1) {
      return { step: 2, stateA: st.stateA, valA: value };
    }
    if (st.step === 2) {
      const s = (value === HI || value === LO) ? value : NONE;
      return { step: 3, stateA: st.stateA, valA: st.valA, stateB: s };
    }
    // step 3: value is valB.
    const { stateA, valA, stateB } = st;
    const valB = value;
    if (stateA === HI && valA - valB < 2) return undefined;
    if (stateA === LO && valB - valA < 2) return undefined;
    if (stateB === HI && valB - valA < 2) return undefined;
    if (stateB === LO && valA - valB < 2) return undefined;
    return { step: 4 };
  },
  accept: (st) => st.step === 4,
}, graph.gridGeometry().numValues);

// Every orthogonal edge, once each.
const edges = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const cell = makeCellId(r, c);
    if (c < 9) edges.push([cell, makeCellId(r, c + 1)]);
    if (r < 9) edges.push([cell, makeCellId(r + 1, c)]);
  }
}
const extremumRules = edges.map(([a, b]) =>
  new NFA(edgeSpec, 'coloured-extremum-edge', state.at(a), a, state.at(b), b));

return [
  new Shape('9x9'),

  new Given('R1C7', 3),
  new Given('R2C5', 9),
  new Given('R3C3', 7),
  new Given('R4C1', 5),
  new Given('R4C8', 2),
  new Given('R6C6', 5),
  new Given('R7C5', 6),
  new Given('R7C7', 9),
  new Given('R8C2', 7),

  state.toVar('coloured state'),
  // Every state cell's domain is {NONE, HI, LO}; row/column Regexes and the
  // per-edge NFAs below narrow it further per cell.
  state.makeReplicate(new Given(state.cells()[0], NONE, HI, LO)),

  ...rowRegexes,
  ...colRegexes,
  ...extremumRules,
];
