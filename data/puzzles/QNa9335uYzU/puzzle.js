// Title: X-ray
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=QNa9335uYzU
// Source: https://sudokupad.app/2gk2npegiz

// Rules encoded:
// - Standard sudoku (Shape('9x9') gives the default row/column/box
//   all-different groups; the payload has no givens).
// - Twelve drawn cages, none carrying a printed total: all-different only.
// - Nine circled cells, one per row/column/box, whose digits form a complete
//   set of 1-9. Modeled as a permutation: CC[r] (Var, 1-9) is the column of
//   row r's circle. AllDifferent(CC) gives "one per column". "One per box"
//   is then exactly the extra condition that, within each row-band of 3
//   rows, the 3 CC values fall in 3 different column-bands -- since the
//   permutation already keeps them in distinct columns, forcing distinct
//   column-bands per band is necessary and sufficient for one circle per
//   box (3 rows, 3 bands, bijective either way). RD[r] (Var, 1-9)
//   dereferences the grid digit at (r, CC[r]) via ValueIndexing; requiring
//   AllDifferent(RD) is the "complete set of 1-9" clause.
// - For each X mark, A is the circled digit of the X's row (RD[r]) and B the
//   circled digit of the X's column. B needs the row that column's circle
//   sits in: CR[c] (Var, 1-9) is pinned, via ValueIndexing against the
//   constant KC[c] = c, to the unique r with CC[r] = c (unique because CC is
//   a bijection). CD[c] then dereferences the grid digit at (CR[c], c).
// - Each X mark's cage total (A*B, never printed) is enforced by one NFA
//   reading [RD[r], CD[c], ...cage cells]: it multiplies the first two
//   values into a target, then subtracts every following cage cell,
//   accepting iff the running remainder lands on exactly 0. A cage with two
//   X marks (cages 2, 6, 11 below) gets one such NFA per mark, which also
//   forces the two marks' A*B products to agree (same cage, same total).

function rowCells(r) {
  const cells = [];
  for (let c = 1; c <= 9; c++) cells.push(makeCellId(r, c));
  return cells;
}
function colCells(c) {
  const cells = [];
  for (let r = 1; r <= 9; r++) cells.push(makeCellId(r, c));
  return cells;
}

// The twelve drawn cages (no printed total), transcribed from the puzzle art:
const cages = [
  ['R4C1', 'R5C1', 'R6C1'],
  ['R4C2', 'R4C3', 'R5C2', 'R6C2'],
  ['R5C3', 'R6C3'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C5', 'R4C6', 'R5C5'],
  ['R5C6', 'R6C5', 'R6C6'],
  ['R4C7', 'R5C7', 'R6C7'],
  ['R4C8', 'R4C9', 'R5C8', 'R6C8'],
  ['R5C9', 'R6C9'],
  ['R1C3', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R8C7', 'R9C6', 'R9C7'],
  ['R7C3', 'R7C4', 'R8C1', 'R8C2', 'R8C3'],
];

// The fifteen drawn X marks as [row, col, cage index into `cages`],
// transcribed from the puzzle art.
const xMarks = [
  [5, 1, 0], [5, 2, 1], [5, 3, 2], [5, 4, 3], [5, 5, 4],
  [5, 6, 5], [5, 7, 6], [5, 8, 7], [5, 9, 8],
  [6, 5, 5], [4, 3, 1], [9, 6, 10], [8, 7, 10], [1, 3, 9], [8, 2, 11],
];

const CC = new Var('CC', 'circle column per row', 9);   // CC[r] = column of row r's circle
const RD = new Var('RD', 'row circle digit', 9);        // RD[r] = digit at (r, CC[r])
const CR = new Var('CR', 'circle row per column', 9);   // CR[c] = row of column c's circle
const CD = new Var('CD', 'column circle digit', 9);     // CD[c] = digit at (CR[c], c)
const KC = new Var('KC', 'column index constant', 9);   // KC[c] fixed to c

const colBand = v => Math.floor((v - 1) / 3);
const boxBandKey = PairX.fnToKey((a, b) => colBand(a) !== colBand(b), 9);
const rowBands = [[1, 2, 3], [4, 5, 6], [7, 8, 9]];

const xTargetNFA = NFA.encodeSpec({
  // {phase:'A'}: waiting for the row-circle digit.
  // {phase:'B', a}: got A, waiting for the column-circle digit.
  // {phase:'sum', remaining}: got A*B as the target; each further value read
  // is a cage cell, subtracted from the remainder. Reject as soon as the
  // remainder would go negative (cage already oversums the target).
  startState: { phase: 'A' },
  transition: (state, value) => {
    if (state.phase === 'A') return { phase: 'B', a: value };
    if (state.phase === 'B') return { phase: 'sum', remaining: state.a * value };
    const remaining = state.remaining - value;
    if (remaining < 0) return undefined;
    return { phase: 'sum', remaining };
  },
  accept: (state) => state.phase === 'sum' && state.remaining === 0,
}, 9);

return [
  new Shape('9x9'),

  ...cages.map(cells => new AllDifferent(...cells)),

  CC, RD, CR, CD, KC,
  ...Array.from({ length: 9 }, (_, i) => new Given(KC.cell(i + 1), i + 1)),

  new AllDifferent(...CC.cells()),
  ...rowBands.map(band =>
    new PairX(boxBandKey, 'circle columns land in distinct box-bands',
      ...band.map(r => CC.cell(r)))),

  ...Array.from({ length: 9 }, (_, i) => {
    const r = i + 1;
    return new ValueIndexing(RD.cell(r), CC.cell(r), ...rowCells(r));
  }),
  new AllDifferent(...RD.cells()),

  ...Array.from({ length: 9 }, (_, i) => {
    const c = i + 1;
    return new ValueIndexing(KC.cell(c), CR.cell(c), ...CC.cells());
  }),
  ...Array.from({ length: 9 }, (_, i) => {
    const c = i + 1;
    return new ValueIndexing(CD.cell(c), CR.cell(c), ...colCells(c));
  }),

  ...xMarks.map(([r, c, cageIdx]) =>
    new NFA(xTargetNFA, 'X target = row-circle x col-circle',
      RD.cell(r), CD.cell(c), ...cages[cageIdx])),
];
