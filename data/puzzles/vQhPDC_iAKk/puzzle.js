// Title: OneUp #11
// Author: Rodolfo Kurchan
// Video: https://www.youtube.com/watch?v=vQhPDC_iAKk
// Source: https://app.crackingthecryptic.com/mRm7qhD3GQ

// Rules text (video description): "Bars divide each row and column into
// segments. Every number between 1 and n must appear in a segment of length
// n (which can be a 1-cell segment)."
//
// Reading: the bars are wall-chain dividers (each drawn line is a single
// wall unit separating one adjacent cell pair). They split every row into
// horizontal runs and every column into vertical runs. A run of length L
// must contain each of 1..L exactly once: L cells, L required distinct
// values, so no other value can fit in the run. A row or column with no bar
// is a single run of length 8, i.e. a plain 1-8 permutation for that line.
// This is a Raw grid (no implicit row/column all-different): a bar splits a
// line into more than one run whenever the runs are shorter than 8, and each
// run separately repeats 1..L (e.g. row 2 below has two length-3 runs, each
// needing its own 1,2,3 -- so 1, 2 and 3 each occur twice in that row).
//
// This reading was checked by hand against all 8 givens (every given digit
// lies within [1, L] for both the row-run and column-run containing it) with
// no contradiction found.

const shape = new Shape('8x8', '', 'Raw');

// Bars, transcribed from the drawn wall geometry (each entry is one wall
// unit blocking exactly one row-adjacency or one column-adjacency):
const bars = [
  [[1, 5], [2, 5]], // #0
  [[2, 6], [2, 7]], // #1
  [[3, 6], [4, 6]], // #2
  [[3, 4], [3, 5]], // #3
  [[2, 3], [2, 4]], // #4
  [[4, 2], [4, 3]], // #5
  [[5, 4], [5, 5]], // #6
  [[4, 1], [5, 1]], // #7
  [[4, 8], [5, 8]], // #8
  [[6, 3], [7, 3]], // #9
  [[6, 6], [7, 6]], // #10
  [[8, 7], [8, 8]], // #11
];

// Row cut points: for row r, the set of columns c such that a bar separates
// column c from column c+1 in that row. Column cut points: the symmetric
// structure for columns.
const rowCuts = new Map(); // row -> Set(col)
const colCuts = new Map(); // col -> Set(row)
for (const [[r1, c1], [r2, c2]] of bars) {
  if (r1 === r2) {
    // Same row, adjacent columns: a vertical bar splitting that row.
    if (!rowCuts.has(r1)) rowCuts.set(r1, new Set());
    rowCuts.get(r1).add(Math.min(c1, c2));
  } else {
    // Same column, adjacent rows: a horizontal bar splitting that column.
    if (!colCuts.has(c1)) colCuts.set(c1, new Set());
    colCuts.get(c1).add(Math.min(r1, r2));
  }
}

// Split the 1..8 line into runs at the given cut points (a cut at k means
// "after position k").
const runsFromCuts = (cuts) => {
  const points = [0, ...[...cuts].sort((a, b) => a - b), 8];
  const runs = [];
  for (let i = 0; i + 1 < points.length; i++) {
    const start = points[i] + 1, end = points[i + 1];
    runs.push(Array.from({length: end - start + 1}, (_, k) => start + k));
  }
  return runs;
};

// One ContainExact("1_2_..._L", ...cells) per run: the run's L cells must
// between them hold each of 1..L exactly once.
const runConstraint = (cells) => {
  const values = cells.map((_, i) => i + 1).join('_');
  return new ContainExact(values, ...cells);
};

const rowRuns = [];
for (let r = 1; r <= 8; r++) {
  for (const run of runsFromCuts(rowCuts.get(r) || [])) {
    rowRuns.push(runConstraint(run.map(c => makeCellId(r, c))));
  }
}

const colRuns = [];
for (let c = 1; c <= 8; c++) {
  for (const run of runsFromCuts(colCuts.get(c) || [])) {
    colRuns.push(runConstraint(run.map(r => makeCellId(r, c))));
  }
}

// Givens, transcribed from the source payload.
const givens = [
  new Given('R1C2', 6),
  new Given('R2C5', 2),
  new Given('R3C1', 4),
  new Given('R4C7', 5),
  new Given('R5C5', 3),
  new Given('R6C4', 7),
  new Given('R6C7', 4),
  new Given('R8C3', 1),
];

return [shape, ...givens, ...rowRuns, ...colRuns];
