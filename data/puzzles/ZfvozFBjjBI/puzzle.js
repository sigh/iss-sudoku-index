// Title: Battleships Sudoku
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=ZfvozFBjjBI
// Source: https://app.crackingthecryptic.com/sudoku/pGPJQ3B84P

// Rules encoded here, in full:
//  1. Normal sudoku: 1-9 once per row, column and 3x3 box (the default grid).
//  2. Cages ("land", green): digits sum to the printed total; digits cannot
//     repeat in a cage. A cage with no printed total is all-different only.
//     Single-cell cages add nothing beyond normal sudoku and are not encoded.
//  3. Every other cell is "sea" (blue). There are exactly five ships: straight
//     (horizontal or vertical) lines of orthogonally-connected sea cells, one
//     each of length 2, 4, 5 and two of length 3. Ships occupy sea only, never
//     touch each other (not even diagonally), and each sums to 15 with
//     distinct digits (a cage of sum 15).
//  4. Unambiguous/negative constraint: any straight line of 2-5
//     orthogonally-connected sea cells that sums to 15 must be exactly one of
//     the five ships (not a subset or superset of a real ship); any such line
//     that cannot be one of the five ships cannot sum to 15.
// Nothing is omitted.

const graph = cellGraph('9x9');
const geom = graph.gridGeometry();

// --- Land cages -------------------------------------------------------
// Cell lists and totals transcribed from the puzzle's drawn cages (16 real
// cages; the rest of the payload's cage list is metadata stubs, not cages).
const LAND_CAGES = [
  { sum: 30, cells: ['R2C1', 'R1C1', 'R1C2', 'R1C3'] },
  { sum: null, cells: ['R1C4', 'R1C5', 'R1C6'] },
  { sum: 11, cells: ['R1C7', 'R1C8'] },
  { sum: null, cells: ['R1C9'] },
  { sum: null, cells: ['R2C7'] },
  { sum: 12, cells: ['R2C8', 'R2C9'] },
  { sum: 19, cells: ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R5C8'] },
  { sum: 10, cells: ['R7C9', 'R8C9'] },
  { sum: 12, cells: ['R9C9', 'R9C8'] },
  { sum: 11, cells: ['R8C7', 'R9C7', 'R8C8'] },
  { sum: null, cells: ['R9C6'] },
  { sum: null, cells: ['R8C4', 'R7C4', 'R7C5', 'R6C5'] },
  { sum: null, cells: ['R5C5', 'R5C6'] },
  { sum: 26, cells: ['R8C2', 'R8C1', 'R7C1', 'R6C1'] },
  { sum: null, cells: ['R5C1', 'R4C1', 'R3C1', 'R3C2', 'R2C2'] },
  { sum: 16, cells: ['R4C2', 'R4C3', 'R3C3', 'R3C4'] },
];

// A single-cell cage (with or without a total) constrains nothing beyond the
// default grid, so it needs no constraint object.
const landCageRules = LAND_CAGES
  .filter(({ cells }) => cells.length > 1)
  .map(({ sum, cells }) => sum === null
    ? new AllDifferent(...cells)
    : new Cage(sum, ...cells));

const LAND = new Set(LAND_CAGES.flatMap(c => c.cells));
const SEA = graph.cells().filter(c => !LAND.has(c));
const seaSet = new Set(SEA);
const readingIndex = (cellId) => {
  const { row, col } = parseCellId(cellId);
  return row * 9 + col;
};

// --- Candidate ship windows ---------------------------------------------
// Every maximal straight run of consecutive sea cells (scanning each row,
// then each column), and every length-2..5 sub-window of each run: the set
// of cells any single ship could occupy. `before`/`after` are the sea cells
// immediately beyond the window along the run (null off the run), used by
// the unambiguous-negative-constraint machine below to tell a window that is
// exactly a ship's whole extent from one that is only part of a longer run.
function runsOf(lines) {
  const runs = [];
  for (const line of lines) {
    let i = 0;
    while (i < line.length) {
      if (!seaSet.has(line[i])) { i++; continue; }
      let j = i;
      while (j < line.length && seaSet.has(line[j])) j++;
      runs.push(line.slice(i, j));
      i = j;
    }
  }
  return runs;
}
function windowsOf(run) {
  const out = [];
  for (let len = 2; len <= 5; len++) {
    for (let s = 0; s + len <= run.length; s++) {
      out.push({
        cells: run.slice(s, s + len),
        length: len,
        before: s > 0 ? run[s - 1] : null,
        after: (s + len < run.length) ? run[s + len] : null,
      });
    }
  }
  return out;
}
const runs = [...runsOf(graph.rows()), ...runsOf(graph.columns())];
const windows = runs.flatMap(windowsOf);
const windowsByLength = { 2: [], 3: [], 4: [], 5: [] };
for (const w of windows) windowsByLength[w.length].push(w);

// --- Ship placement: a label per sea cell --------------------------------
// VL: which of the five ships (if any) a sea cell belongs to. Two ships
// share length 3, so they get distinct identities (S3A/S3B) -- a shared
// "length 3" label could not tell two adjacent length-3 ships apart from one
// length-6 run, which the no-touch rule below needs to reject.
const NONE = 1, S2 = 2, S3A = 3, S3B = 4, S4 = 5, S5 = 6;
const label = graph.makeOverlay('VL', SEA);
const labelDomain = label.makeReplicate(
  new Given(label.cells()[0], NONE, S2, S3A, S3B, S4, S5));

// A chosen ship pins its cells' labels and is a sum-15 cage.
const shipConstraints = (cells, id) => [
  ...cells.map(c => new Given(label.at(c), id)),
  new Cage(15, ...cells),
];

const slot2 = new Or(windowsByLength[2].map(w => new And(shipConstraints(w.cells, S2))));
const slot4 = new Or(windowsByLength[4].map(w => new And(shipConstraints(w.cells, S4))));
const slot5 = new Or(windowsByLength[5].map(w => new And(shipConstraints(w.cells, S5))));

// The two length-3 ships are interchangeable, so a plain product of two
// independent Ors would double-count every real placement (swap S3A/S3B) and
// corrupt the solution count. Canonicalise by requiring S3A's window to
// start (in row-major reading order) before S3B's; each real pair of ships is
// then generated exactly once. Windows that share a cell are dropped -- they
// could never both hold (a cell can't carry two labels), so this only
// shrinks the Or.
const w3 = windowsByLength[3];
const slot3Branches = [];
for (const a of w3) {
  for (const b of w3) {
    if (readingIndex(a.cells[0]) >= readingIndex(b.cells[0])) continue;
    if (a.cells.some(c => b.cells.includes(c))) continue;
    slot3Branches.push(new And([
      ...shipConstraints(a.cells, S3A),
      ...shipConstraints(b.cells, S3B),
    ]));
  }
}
const slot3 = new Or(slot3Branches);

// Exactly 17 sea cells (2+3+3+4+5) are ship cells; every other sea cell is
// unlabelled. Without this, a stray sea cell could carry a ship label without
// being part of any chosen window above (nothing else forbids it). VO is a
// 1/2 occupied/free flag Pair-linked to VL, so summing it (occupied counts as
// 1, free as 2) reads off the labelled cell count: total = 2*|SEA| - occupied.
const OCC_ON = 1, OCC_OFF = 2;
const occ = graph.makeOverlay('VO', SEA);
const occDomain = occ.makeReplicate(new Given(occ.cells()[0], OCC_ON, OCC_OFF));
const occKey = Pair.fnToKey((l, o) => (l !== NONE) === (o === OCC_ON), geom);
const occLink = SEA.map(c => new Pair(occKey, 'ship-occupied', label.at(c), occ.at(c)));
const SHIP_CELL_TOTAL = 2 + 3 + 3 + 4 + 5;
const coverage = new Sum(2 * SEA.length - SHIP_CELL_TOTAL, ...occ.cells());

// Ships cannot touch, even diagonally: no two king-adjacent sea cells may
// carry different (non-NONE) labels. Two cells of one straight ship are
// never king-adjacent without also being orthogonally adjacent along the
// ship's own axis, where they already share a label, so this rule never
// fires within a real ship -- only between cells that would otherwise
// belong to two different ships.
const noTouchKey = Pair.fnToKey((a, b) => a === b || a === NONE || b === NONE, geom);
const noTouch = [];
for (const cell of SEA) {
  for (const nb of graph.kingNeighbours(cell)) {
    if (!seaSet.has(nb) || readingIndex(nb) <= readingIndex(cell)) continue;
    noTouch.push(new Pair(noTouchKey, 'ship-no-touch', label.at(cell), label.at(nb)));
  }
}

// --- Unambiguous negative constraint -------------------------------------
// For one candidate window: read its cells' labels, then their digits, then
// (if present) the sea cell(s) immediately beyond the window along the run.
// `same` tracks whether every cell in the window shares one label so far and
// `val` what it is; a boundary cell sharing that label means the window is
// only part of a longer real ship, not the ship itself. `sum` is capped at
// 16 since a running total that has already passed 15 can only grow (digits
// are positive), so the exact value stops mattering. Accepts iff
// (sum == 15) is exactly the same boolean as (window is one real ship).
const SUM_CAP = 16;
const windowNfaCache = new Map();
function windowNfa(len, hasBefore, hasAfter) {
  const key = `${len}|${hasBefore}|${hasAfter}`;
  if (windowNfaCache.has(key)) return windowNfaCache.get(key);
  const spec = NFA.encodeSpec({
    startState: { phase: 'lbl', i: 0, same: true, val: null },
    transition: (state, value) => {
      if (state.phase === 'lbl') {
        const val = state.val === null ? value : state.val;
        const same = state.same && (state.val === null || value === state.val);
        const i = state.i + 1;
        return i < len
          ? { phase: 'lbl', i, same, val }
          : { phase: 'dig', i: 0, same, val, sum: 0 };
      }
      if (state.phase === 'dig') {
        const sum = Math.min(SUM_CAP, state.sum + value);
        const i = state.i + 1;
        if (i < len) return { phase: 'dig', i, same: state.same, val: state.val, sum };
        const left = (hasBefore ? 1 : 0) + (hasAfter ? 1 : 0);
        return left === 0
          ? { phase: 'done', same: state.same, val: state.val, sum, boundaryOk: true }
          : { phase: 'bnd', left, same: state.same, val: state.val, sum, boundaryOk: true };
      }
      if (state.phase === 'bnd') {
        const boundaryOk = state.boundaryOk && value !== state.val;
        const left = state.left - 1;
        return left > 0
          ? { phase: 'bnd', left, same: state.same, val: state.val, sum: state.sum, boundaryOk }
          : { phase: 'done', same: state.same, val: state.val, sum: state.sum, boundaryOk };
      }
      return undefined;
    },
    accept: (state) => {
      if (state.phase !== 'done') return false;
      const isRealShip = state.same && state.val !== NONE && state.boundaryOk;
      return isRealShip === (state.sum === 15);
    },
  }, geom);
  windowNfaCache.set(key, spec);
  return spec;
}
const unambiguous = windows.map(w => new NFA(
  windowNfa(w.length, w.before !== null, w.after !== null),
  'ship-unambiguous',
  ...label.at(w.cells),
  ...w.cells,
  ...(w.before !== null ? [label.at(w.before)] : []),
  ...(w.after !== null ? [label.at(w.after)] : []),
));

return [
  new Shape('9x9'),
  ...landCageRules,
  label.toVar('shipLabel'), labelDomain,
  occ.toVar('shipOccupied'), occDomain,
  slot2, slot3, slot4, slot5,
  ...occLink, coverage,
  ...noTouch,
  ...unambiguous,
];
