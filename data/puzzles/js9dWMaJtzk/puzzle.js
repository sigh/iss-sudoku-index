// Title: Rooms and Regions
// Author: Matt Tressel
// Video: https://www.youtube.com/watch?v=js9dWMaJtzk
// Source: https://sudokupad.app/wtfa2dqnkz

// Rules encoded:
// - The 6x6 playing area (drawn at R2C2-R7C7 of an 8x8 canvas whose outer ring holds
//   only clue cells) is divided into four orthogonally connected regions of 9 cells,
//   each holding 1-9 once (ChaosConstruction, RegionSize 9, no boxes). Rows and
//   columns of the 6x6 area hold no repeated digit (the Sudoku grid type).
// - Every ring cell the blue line passes through holds a digit (one Var per ring
//   cell). Reading from that cell into the grid, N is the first digit seen; the ring
//   digit equals the cell in the Nth position of that row/column. A row/column has
//   6 cells, so N must be 1-6.
// - Region borders and the grid border cut the blue line into segments, and every
//   segment has the same sum. The grid border is the heavy black outline of the 6x6
//   area; the ring cells have no borders between them, so a run of ring cells is one
//   segment. A step between two playing cells is a cut when the two cells lie in
//   different regions (the cut test also applies to the diagonal steps of the line).
// The hidden row/column cages of the drawn payload duplicate the Sudoku rows and
// columns.

const shape = new Shape('6x6', 9);
const graph = cellGraph(shape);
const cc = graph.makeOverlay('CC');

// Blue line, in drawn order, in canvas coordinates (row, col), 1-based.
const LINE = [
  [8, 4], [8, 5], [8, 6], [7, 7], [6, 7], [5, 7], [5, 8], [4, 8], [3, 8], [2, 8],
  [1, 7], [1, 6], [1, 5], [1, 4], [1, 3], [1, 2], [2, 1], [3, 1], [4, 1], [5, 1],
  [6, 1], [7, 1], [8, 2], [7, 2], [6, 2], [5, 2], [4, 2], [3, 2], [2, 2], [2, 3],
  [2, 4], [2, 5], [2, 6], [2, 7], [3, 6], [4, 5], [4, 4], [4, 3],
];

const isRing = ([r, c]) => r === 1 || r === 8 || c === 1 || c === 8;
const ringCells = LINE.filter(isRing);
const ringVars = new Var('R', 'ring', ringCells.length);
const ringIdAt = (r, c) => ringVars.cell(ringCells.findIndex(([a, b]) => a === r && b === c) + 1);
// The playing cell for a canvas cell (the canvas has a one-cell ring).
const cellOf = ([r, c]) => makeCellId(r - 1, c - 1);

// Border flags: one Var per line step, 1 = no border, 2 = border.
const flags = new Var('F', 'border', LINE.length - 1);

// NFA over [label(a), flag, label(b)] for a step between two playing cells: flag is
// 2 exactly when the region labels differ.
const flagSpec = NFA.encodeSpec({
  startState: { ph: 'a' },
  transition: (s, x) => {
    if (s.ph === 'a') return { ph: 'f', a: x };
    if (s.ph === 'f') return (x === 1 || x === 2) ? { ph: 'b', a: s.a, f: x } : undefined;
    return (s.f === 2) === (x !== s.a) ? { ph: 'end' } : undefined;
  },
  accept: (s) => s.ph === 'end',
}, shape);

// NFA over [v1, f1, v2, f2, ..., vn] along the whole line. A flag of 2 closes the
// running segment; the first closed segment fixes the common sum t (t === null
// until then) and every later one must equal it, as must the last segment.
const segSpec = NFA.encodeSpec({
  startState: { ph: 'val', t: null, run: 0 },
  transition: (s, x) => {
    if (s.ph === 'val') {
      const run = s.run + x;
      return run > (s.t ?? 27) ? undefined : { ph: 'flag', t: s.t, run };
    }
    if (x === 1) return { ph: 'val', t: s.t, run: s.run };
    if (x === 2) {
      if (s.t !== null && s.run !== s.t) return undefined;
      return { ph: 'val', t: s.run, run: 0 };
    }
    return undefined;
  },
  accept: (s) => s.ph === 'flag' && s.run === s.t,
}, shape);

// NFA over [d, p1..p6]: p1 is the first digit seen from the clue (N); the digit in
// position N (p_N) equals the ring digit d.
const ringSpec = NFA.encodeSpec({
  startState: { ph: 'd' },
  transition: (s, x) => {
    if (s.ph === 'd') return { ph: 'first', d: x };
    if (s.ph === 'first') {
      if (x > 6) return undefined;
      return x === 1 ? (s.d === x ? { ph: 'done' } : undefined) : { ph: 'scan', d: s.d, n: x, pos: 1 };
    }
    if (s.ph === 'scan') {
      const pos = s.pos + 1;
      if (pos < s.n) return { ph: 'scan', d: s.d, n: s.n, pos };
      return x === s.d ? { ph: 'done' } : undefined;
    }
    return { ph: 'done' };
  },
  accept: (s) => s.ph === 'done',
}, shape);

// Cell holding each line position: ring cells are Vars, the rest are playing cells.
const lineCells = LINE.map(([r, c]) => (isRing([r, c]) ? ringIdAt(r, c) : cellOf([r, c])));

// Step flags: ring-ring steps stay inside the outside band (1); a step between ring and
// playing area crosses the grid border (2); playing-playing steps follow the regions.
const flagChecks = LINE.slice(1).map((rc, i) => {
  const f = flags.cell(i + 1);
  const prev = LINE[i];
  if (isRing(prev) && isRing(rc)) return new Given(f, 1);
  if (isRing(prev) || isRing(rc)) return new Given(f, 2);
  return new NFA(flagSpec, 'Border', ...cc.at([cellOf(prev)]), f, ...cc.at([cellOf(rc)]));
});

const segmentSums = new NFA(segSpec, 'SegmentSum',
  ...lineCells.flatMap((cell, i) => (i < LINE.length - 1 ? [cell, flags.cell(i + 1)] : [cell])));

// Ring clue: cells of the row/column read from the clue's side.
const ringClues = ringCells.map(([r, c]) => {
  const cells = [];
  for (let k = 2; k <= 7; k++) {
    if (r === 1) cells.push(makeCellId(k - 1, c - 1));
    else if (r === 8) cells.push(makeCellId(8 - k, c - 1));
    else if (c === 1) cells.push(makeCellId(r - 1, k - 1));
    else cells.push(makeCellId(r - 1, 8 - k));
  }
  return new NFA(ringSpec, 'RingClue', ringIdAt(r, c), ...cells);
});

return [
  shape,
  new ChaosConstruction(),
  new RegionSize(9),
  new NoBoxes(),
  ringVars,
  flags,
  ...flagChecks,
  segmentSums,
  ...ringClues,
];
