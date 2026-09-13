// Title: Akari (Light Up)
// Author: Unknown
// Video: https://www.youtube.com/watch?v=huMgnsAIDjw
// Source: http://pzv.jp/p.html?akari/10/10/q.bh2.hbj.pbbblcccn.lb.bh2.q

// Akari (Light Up): place a light bulb in some of the white cells so that
// every white cell ends up lit. A bulb lights its entire row and column,
// stopping at the next black cell or the grid edge. No bulb may light
// another bulb (so two bulbs never share an unbroken row or column run of
// white cells). A numbered black cell must be orthogonally adjacent to
// exactly that many bulbs; an unnumbered black cell carries no count rule.
// This is the standard Light Up ruleset, read from the payload's own genre
// label (metadata.genre "akari" / "Akari (Light Up)"), since the payload
// carries no separate rules text.
//
// Each white grid cell holds 0 (no bulb) or 1 (bulb); black cells are pinned
// to 0 below and carry no puzzle meaning of their own.
//
// Board layout, one row per string, drawn from the puzzle's own grid:
// '-' a white cell, '.' an unnumbered black wall, a digit a numbered black
// wall (its required adjacent-bulb count).
const BOARD = [
  '----------',
  '-.1----2.-',
  '-1------.-',
  '---------1',
  '--1--1----',
  '----2--2--',
  '2---------',
  '-.------1-',
  '-.1----2.-',
  '----------',
];

const ROWS = BOARD.length;
const COLS = BOARD[0].length;

const isWhite = (r, c) => BOARD[r - 1][c - 1] === '-';
const wallNumber = (r, c) => {
  const ch = BOARD[r - 1][c - 1];
  return (ch === '-' || ch === '.') ? null : Number(ch);
};

// Maximal horizontal spans of consecutive white cells (row runs) and the
// same down each column (column runs). A bulb's light fills exactly one
// such run.
const rowRuns = [];
for (let r = 1; r <= ROWS; r++) {
  let run = [];
  for (let c = 1; c <= COLS; c++) {
    if (isWhite(r, c)) {
      run.push(makeCellId(r, c));
    } else if (run.length) {
      rowRuns.push(run);
      run = [];
    }
  }
  if (run.length) rowRuns.push(run);
}
const colRuns = [];
for (let c = 1; c <= COLS; c++) {
  let run = [];
  for (let r = 1; r <= ROWS; r++) {
    if (isWhite(r, c)) {
      run.push(makeCellId(r, c));
    } else if (run.length) {
      colRuns.push(run);
      run = [];
    }
  }
  if (run.length) colRuns.push(run);
}
const rowRunOf = new Map();
for (const run of rowRuns) for (const id of run) rowRunOf.set(id, run);
const colRunOf = new Map();
for (const run of colRuns) for (const id of run) colRunOf.set(id, run);

// Rule: no bulb lights another bulb, i.e. at most one bulb per row/column
// run. A run's cells (each 0/1) sum to 0 or 1 once a 0/1 slack cell absorbs
// the shortfall: Sum(1, ...run, slack) with slack in {0,1} forces
// sum(run) <= 1. Runs of length 1 need no constraint: a single cell can't
// shine on another bulb.
const boundedRuns = [...rowRuns, ...colRuns].filter(run => run.length >= 2);
const runSlacks = new Var('VR', 'at-most-one-bulb run slack', boundedRuns.length);
const noBulbSeesBulb = boundedRuns.map(
  (run, i) => new Sum(1, ...run, runSlacks.cell(i + 1)));

// Rule: every white cell is lit, i.e. its row run or column run holds a
// bulb. Each run already sums to 0 or 1 (above), so "at least one of the two
// runs holds a bulb" is rowRunSum + colRunSum >= 1, i.e. <= 1 short of the
// combined max of 2. A 0/1 slack cell absorbs that shortfall the other way:
// Sum(2, ...rowRun, ...colRun, slack) with slack in {0,1} forces
// rowRunSum + colRunSum >= 1. The cell itself is counted once in each run
// and so appears twice, which is intended: a bulb on the cell itself
// already satisfies both sums.
const whiteCells = [];
for (let r = 1; r <= ROWS; r++) {
  for (let c = 1; c <= COLS; c++) {
    if (isWhite(r, c)) whiteCells.push(makeCellId(r, c));
  }
}
const litSlacks = new Var('VL', 'illumination slack', whiteCells.length);
const everyCellLit = whiteCells.map((id, i) => new Sum(
  2, ...rowRunOf.get(id), ...colRunOf.get(id), litSlacks.cell(i + 1)));

// Rule: a numbered black cell is adjacent to exactly that many bulbs, among
// its orthogonal white neighbours (off-grid and black neighbours don't
// count).
const graph = cellGraph('10x10');
const clueCounts = [];
for (let r = 1; r <= ROWS; r++) {
  for (let c = 1; c <= COLS; c++) {
    const value = wallNumber(r, c);
    if (value === null) continue;
    const id = makeCellId(r, c);
    const whiteNeighbours = graph.neighbours(id).filter(n => {
      const { row, col } = parseCellId(n);
      return isWhite(row, col);
    });
    clueCounts.push(new Sum(value, ...whiteNeighbours));
  }
}

// Black cells hold no bulb state; pin them so they don't add free solutions.
const blackGivens = [];
for (let r = 1; r <= ROWS; r++) {
  for (let c = 1; c <= COLS; c++) {
    if (!isWhite(r, c)) blackGivens.push(new Given(makeCellId(r, c), 0));
  }
}

return [
  new Shape('10x10', '0-1', 'Raw'),
  runSlacks,
  litSlacks,
  ...noBulbSeesBulb,
  ...everyCellLit,
  ...clueCounts,
  ...blackGivens,
];
