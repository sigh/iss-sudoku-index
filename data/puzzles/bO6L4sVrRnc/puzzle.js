// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=bO6L4sVrRnc
// Source: https://cracking-the-cryptic.web.app/sudoku/bm8Fmt6pR9

// Tapa: shade some cells to form a single orthogonally-connected region
// ("wall"); shaded cells never form a 2x2 square anywhere in the grid. A
// clue cell carries one or more printed numbers and is itself never shaded;
// each number gives the run-length of one maximal block of shaded cells
// among the clue cell's up-to-eight neighbours (orthogonal and diagonal),
// read circularly, with >=1 unshaded neighbour separating any two blocks a
// multi-number clue names. No other rule text is drawn or stored with this
// payload; this is the standard (Nikoli) Tapa ruleset, the genre the small
// corner-quadrant clue numbers and the video description ("Deyan Razsadov's
// Tapa puzzle") both identify. There is no sudoku digit layer: the grid is
// pure shading, so the whole puzzle is one binary state per cell.
//
// Model: a Raw 10x10 grid, values 1 (unshaded) / 2 (shaded). No rows,
// columns or boxes are implied (Raw), matching the rule text: nothing
// requires a digit permutation anywhere.

const SHAPE = new Shape('10x10', '1-2', 'Raw');
const graph = cellGraph(SHAPE);
const gridCells = graph.cells();

const UNSHADED = 1;
const SHADED = 2;

// Clue cells carrying two or three printed numbers: each number is a
// separate small text overlay positioned in one quadrant of the cell
// (top-left/top-right/bottom-centre for three numbers, top-left/
// bottom-right for two), grouped here by which cell's quadrants they share.
// Quadrant position fixes typography only -- Tapa reads a clue's numbers as
// an unordered multiset of run-lengths, not by which quadrant holds which.
const multiClues = [
  [makeCellId(10, 3), [1, 3]],
  [makeCellId(7, 2), [1, 4]],
  [makeCellId(1, 2), [1, 2]],
  [makeCellId(2, 8), [1, 4]],
  [makeCellId(4, 8), [1, 1, 1]],
  [makeCellId(7, 7), [1, 1, 3]],
  [makeCellId(3, 5), [1, 2, 2]],
  [makeCellId(6, 3), [2, 3]],
  [makeCellId(9, 8), [2, 2]],
  [makeCellId(4, 3), [3, 3]],
];

// Clue cells carrying a single printed number: no quadrant offset is
// needed for one number, so the payload draws it centred, the same way a
// sudoku given is drawn -- stored as a plain cell `value` rather than a
// text overlay.
const singleClues = [
  [makeCellId(7, 10), [3]],
  [makeCellId(9, 5), [4]],
];

const tapaClues = [...multiClues, ...singleClues];

// Every clue cell is never shaded.
const clueGivens = tapaClues.map(([cell]) => new Given(cell, UNSHADED));

// Shaded cells form one non-empty orthogonally-connected region (Tapa's
// "wall"; ConnectedValues is orthogonal-only, the only reading a Tapa
// constraint ever uses).
const connectivity = new ConnectedValues('', [SHADED]);

// No 2x2 all-shaded square anywhere: scan every overlapping 2x2 window and
// reject only once all four cells seen are shaded.
const geometry = graph.gridGeometry();
const noAllShaded2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const shaded = value === SHADED ? 1 : 0;
    const next = [...seen, shaded];
    if (next.length < 4) return { seen: next };
    const allShaded = next.every(v => v === 1);
    return allShaded ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noAllShaded2x2 = graph.makeReplicate(
  new NFA(noAllShaded2x2Machine, 'no-all-shaded-2x2', ...graph.block(gridCells[0], 2, 2)),
  blockOrigins);

// Tapa ring clue. The eight king-move steps in clockwise order starting at
// N; graph.step() returns null off-grid, which happens for the three clue
// cells on row 1, row 10 or column 10 (this grid has no corner clues).
const CLOCKWISE_KING_STEPS = [
  [-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [1, -1], [0, -1], [-1, -1],
];

// The clue cell's neighbours in ring (walk) order. A fully interior clue
// keeps all 8 and the ring is circular. An edge clue loses one contiguous
// block of off-grid directions (a rectangular grid can only lose a
// contiguous arc of king-move directions at any one cell), so its
// neighbours are rotated to start right after that gap and read as a
// linear arc instead -- there is no wraparound past a grid edge.
function orderedRing(cellId) {
  const steps = CLOCKWISE_KING_STEPS.map(([dRow, dCol]) => graph.step(cellId, dRow, dCol));
  if (steps.every(c => c !== null)) return { cyclic: true, cells: steps };
  const n = steps.length;
  const startIdx = steps.findIndex((c, i) => c !== null && steps[(i - 1 + n) % n] === null);
  const rotated = Array.from({ length: n }, (_, i) => steps[(startIdx + i) % n]);
  return { cyclic: false, cells: rotated.filter(c => c !== null) };
}

function runLengths(bits) {
  const runs = [];
  let i = 0;
  while (i < bits.length) {
    if (bits[i] === 1) {
      let j = i;
      while (j < bits.length && bits[j] === 1) j++;
      runs.push(j - i);
      i = j;
    } else {
      i++;
    }
  }
  return runs;
}

// Every shaded(1)/unshaded(0) bit pattern over `n` ring cells whose
// run-length multiset equals `lengths` exactly. Circular rings are rotated
// to a zero bit before scanning so a run wrapping the N/NW seam is still
// found as one run; linear (edge-truncated) rings are scanned as drawn,
// since the two open ends are genuine boundaries, not a seam to rotate
// past. A gap of >=1 unshaded cell between runs falls out of "run" meaning
// maximal, so the rules' separation clause needs no separate check.
function tapaRingPatterns(lengths, n, cyclic) {
  const wanted = [...lengths].sort((a, b) => a - b);
  const patterns = [];
  for (let mask = 0; mask < (1 << n); mask++) {
    const bits = Array.from({ length: n }, (_, i) => (mask >> i) & 1);
    let runs;
    if (cyclic && bits.every(b => b === 1)) {
      runs = [n];
    } else if (cyclic && !bits.includes(1)) {
      runs = [];
    } else if (cyclic) {
      const zeroIdx = bits.indexOf(0);
      runs = runLengths([...bits.slice(zeroIdx), ...bits.slice(0, zeroIdx)]);
    } else {
      runs = runLengths(bits);
    }
    const got = [...runs].sort((a, b) => a - b);
    if (got.length === wanted.length && got.every((v, i) => v === wanted[i])) {
      patterns.push(bits);
    }
  }
  return patterns;
}

function tapaClueConstraint(cellId, lengths) {
  const { cyclic, cells } = orderedRing(cellId);
  const patterns = tapaRingPatterns(lengths, cells.length, cyclic);
  return new Or(patterns.map(bits => new And(
    cells.map((c, i) => new Given(c, bits[i] ? SHADED : UNSHADED))
  )));
}

const tapaRingConstraints = tapaClues.map(([cell, lengths]) => tapaClueConstraint(cell, lengths));

return [
  SHAPE,
  ...clueGivens,
  connectivity,
  noAllShaded2x2,
  ...tapaRingConstraints,
];
