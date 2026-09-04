// Title: Kropki Chocona
// Author: PixelPlucker
// Video: https://www.youtube.com/watch?v=520gVOENsqU
// Source: https://sudokupad.app/JRNmQMgrQ9

// Shade cells so that: every bold-outlined region holds at least one shaded
// cell; every orthogonally-connected group of shaded cells forms a filled
// rectangle; a black dot between two adjacent regions means their shaded-cell
// counts are in a 2:1 ratio; a white dot means the counts are consecutive;
// and every dot that could be drawn is drawn, so an adjacent pair with no dot
// satisfies neither relation.
//
// Per the rules text, the on-screen answer check is the region's shaded-cell
// count written into its own upper-left cell, wrapping a count of 10 (or 20)
// to the digit 0; every other board cell is blank. Only these 33 corner
// digits are the recorded answer, so they are their own small Var group
// (CORNERS) rather than 33 real cells inside a full 8x24 board -- the other
// 159 board cells carry no rule and would otherwise just add solutions the
// puzzle doesn't have.
//
// The real decision is per-cell shading, held in the same 8x24 layout as
// VSHL/VSHR (1 = shaded; split in two because a graph/overlay's own geometry
// is capped at 16x16 like any Shape, so a 24-wide layout cannot be one such
// group). Each region's shaded-cell count is tied to its corner digit by an
// EqualSum. Two regions (24 cells and 10 cells) can count past 9, so their
// true count is split 10*tens + ones: the ones register doubles as the
// visible corner digit (this is exactly the "0 for 10" convention,
// generalised to "0 for any multiple of 10"), and tens lives in a small
// auxiliary Var that is never displayed.
//
// A 2x2 window of shaded cells with exactly 3 of the 4 cells shaded is
// exactly a concave (non-rectangular) corner: forbidding that pattern in
// every window is equivalent to "every 4-connected shaded group is a filled
// rectangle" (verified separately over all boolean 4x4 grids -- 65536/65536
// agree). It is enforced by one counting NFA per 2x2 window.

// Regions: the bold-outlined partition of the 8x24 grid, [row, col]
// 0-indexed, transcribed from the puzzle's own region geometry. One entry was
// byte-identical to another (a duplicated entry, not a 34th region) and is
// omitted, leaving 33 regions that partition all 192 cells exactly once.
const REGIONS = [
  [[2, 0], [1, 0], [0, 0], [0, 1], [0, 2], [1, 2]],
  [[0, 23], [1, 23], [2, 23]],
  [[1, 1], [2, 1], [2, 2], [3, 2]],
  [[0, 3], [0, 4], [1, 4], [2, 4], [3, 4], [3, 5], [2, 5]],
  [[0, 5], [1, 5], [1, 6]],
  [[0, 6], [0, 7], [1, 7], [2, 7], [2, 6], [1, 8]],
  [[0, 11], [0, 12], [0, 13], [1, 13], [0, 14]],
  [[0, 15], [1, 15], [2, 15], [1, 14], [2, 14], [3, 15]],
  [[0, 16], [0, 17], [0, 18], [0, 19], [1, 19]],
  [[0, 20], [0, 21], [0, 22], [1, 22], [2, 22], [3, 22], [3, 23]],
  [[2, 19], [3, 19], [4, 19], [5, 19], [4, 20], [3, 20]],
  [[1, 16], [1, 17], [1, 18], [2, 18], [3, 18]],
  [[2, 16], [3, 16], [4, 16], [5, 16], [5, 17], [4, 17], [3, 17], [2, 17]],
  [[1, 11], [1, 12], [2, 12], [2, 13], [3, 13]],
  [[3, 14], [4, 14], [4, 13], [5, 13], [5, 12]],
  [[3, 12], [3, 11], [4, 11], [4, 12]],
  [[2, 11], [2, 10], [3, 10], [3, 9], [4, 9]],
  [[3, 0], [4, 0], [4, 1], [3, 1]],
  [[5, 0], [6, 0], [7, 0], [7, 1], [7, 2], [6, 2]],
  [[6, 1], [5, 1], [5, 2], [4, 2]],
  [[1, 3], [2, 3], [3, 3], [4, 3], [5, 3], [6, 3]],
  [[7, 3], [7, 4], [6, 4], [5, 4], [4, 4], [4, 5], [5, 5]],
  [[6, 5], [7, 5], [6, 6]],
  [[5, 6], [5, 7], [6, 7], [6, 8], [7, 7], [7, 6]],
  [[0, 8], [0, 9], [0, 10], [1, 10], [1, 9], [2, 9], [2, 8], [3, 8], [3, 7],
   [3, 6], [4, 6], [4, 7], [4, 8], [5, 8], [5, 9], [6, 9], [6, 10], [7, 10],
   [7, 9], [7, 8]],
  [[4, 10], [5, 10], [5, 11], [6, 11], [6, 12]],
  [[7, 11], [7, 12], [7, 13], [6, 13], [7, 14]],
  [[4, 15], [5, 15], [6, 15], [7, 15], [5, 14], [6, 14]],
  [[6, 16], [6, 17], [6, 18], [5, 18], [4, 18]],
  [[6, 19], [7, 19], [7, 18], [7, 17], [7, 16]],
  [[2, 20], [1, 20], [1, 21], [2, 21], [3, 21], [4, 21], [5, 21], [5, 20],
   [6, 21], [6, 20]],
  [[7, 20], [7, 21], [7, 22], [6, 22], [5, 22], [4, 22], [4, 23]],
  [[5, 23], [6, 23], [7, 23]],
];

// Kropki dots between adjacent regions, transcribed from the puzzle's own
// edge-anchored dot marks: [cellA, cellB, 'W' white / 'B' black], both cells
// 0-indexed [row, col].
const DOTS = [
  [[0, 1], [1, 1], 'W'],
  [[3, 2], [4, 2], 'W'],
  [[7, 2], [7, 3], 'W'],
  [[5, 5], [5, 6], 'W'],
  [[5, 11], [5, 12], 'W'],
  [[4, 12], [4, 13], 'W'],
  [[0, 14], [0, 15], 'W'],
  [[0, 15], [0, 16], 'W'],
  [[1, 19], [2, 19], 'W'],
  [[2, 21], [2, 22], 'W'],
  [[7, 19], [7, 20], 'W'],
  [[4, 18], [4, 19], 'W'],
  [[0, 2], [0, 3], 'B'],
  [[6, 8], [6, 9], 'B'],
  [[7, 10], [7, 11], 'B'],
  [[1, 10], [1, 11], 'B'],
  [[3, 15], [3, 16], 'B'],
  [[6, 22], [6, 23], 'B'],
];

const NUM_ROWS = 8;
const NUM_COLS = 24;
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

const anchorShape = new Shape('1x1', '0-9');
// A graph/overlay's own geometry is capped at 16x16 (like any Shape), so the
// 24-wide shading layout cannot be one such group -- it splits into
// left/right column halves (cols 1-12 / cols 13-24), each a plain 8x12
// block. Each is built as a graph overlay (not a bare Var) so the repeated
// Given/NFA patterns below can Replicate instead of stamping one constraint
// per cell.
const shlGraph = cellGraph('8x12').makeOverlay('VSHL');
const shrGraph = cellGraph('8x12').makeOverlay('VSHR');
const shLeft = shlGraph.toVar('shaded left (cols 1-12)');
const shRight = shrGraph.toVar('shaded right (cols 13-24)');

// REGIONS/DOTS are transcribed verbatim in the source's own 0-indexed
// [row, col] convention, so the +1 here is the one-time conversion to each
// overlay's own 1-indexed local cell addressing -- not an offset applied to
// already-1-indexed data.
const shAt = (row, col) => (col < 12
  ? shLeft.cell(row + 1, col + 1)
  : shRight.cell(row + 1, col - 12 + 1));

// --- Derive region membership, corners and sizes from REGIONS (fixed, drawn
// data -- not something the solver deduces). ---
const cellRegion = new Map(); // "row,col" -> region index
REGIONS.forEach((cells, idx) => {
  for (const [row, col] of cells) cellRegion.set(`${row},${col}`, idx);
});

const corners = REGIONS.map(cells => cells.reduce(
  (best, c) => (c[0] < best[0] || (c[0] === best[0] && c[1] < best[1])) ? c : best));
const sizes = REGIONS.map(cells => cells.length);

// The 33 recorded corner digits are their own Var group (see header note),
// declared as a 1-column canvas (not a flat count, so its cell order is an
// explicit layout; a Var's columns are capped at 16 like any Shape, rows are
// not, so it is 33 rows tall rather than wide), in reading order
// (top-to-bottom, left-to-right over the 8x24 board) -- the order the
// puzzle's own answer-check convention lists them in.
const cornersVar = new Var('CORNERS', 'region corner digits', `${REGIONS.length}x1`);
const cornerOrder = REGIONS.map((_, idx) => idx).sort((a, b) =>
  corners[a][0] - corners[b][0] || corners[a][1] - corners[b][1]);
const cornerSlot = {}; // regionIdx -> 1-indexed row in cornersVar's column
cornerOrder.forEach((idx, i) => { cornerSlot[idx] = i + 1; });
const cornerCell = idx => cornersVar.cell(cornerSlot[idx], 1);

// Regions whose count can exceed 9 (the corner's single digit) get a tens
// register: a small auxiliary Var, never part of the recorded answer.
const tensVar = new Var('TENS', 'region tens digit', 2);
const SPECIAL = {}; // regionIdx -> { tensCell, maxTens }
let tensSlot = 0;
REGIONS.forEach((cells, idx) => {
  if (sizes[idx] > 9) {
    tensSlot++;
    SPECIAL[idx] = { tensCell: tensVar.cell(tensSlot), maxTens: Math.floor(sizes[idx] / 10) };
  }
});

// True shaded-cell count of region `idx`, expressed in terms of a tens value
// `t` (0 for a non-special region) and the corner's own digit `ones`.
const trueCount = (idx, t, ones) => (SPECIAL[idx] ? 10 * t + ones : ones);
const tensRange = idx => (SPECIAL[idx] ? range(0, SPECIAL[idx].maxTens) : [0]);

// One relation constraint between region idx's and idx2's true counts. Both
// counts may need a tens register, so this is an Or over every combination of
// tens values, each an And of pinning the tens (if any) and a Pair over the
// two corner digits built for that specific combination. With neither region
// special this degenerates to the bare Pair.
function regionRelation(idxA, idxB, relationFn, name) {
  const branches = [];
  for (const tA of tensRange(idxA)) {
    for (const tB of tensRange(idxB)) {
      const key = Pair.fnToKey(
        (onesA, onesB) => relationFn(trueCount(idxA, tA, onesA), trueCount(idxB, tB, onesB)),
        anchorShape);
      const pair = new Pair(key, name, cornerCell(idxA), cornerCell(idxB));
      const givens = [
        ...(SPECIAL[idxA] ? [new Given(SPECIAL[idxA].tensCell, tA)] : []),
        ...(SPECIAL[idxB] ? [new Given(SPECIAL[idxB].tensCell, tB)] : []),
      ];
      branches.push(givens.length ? new And([...givens, pair]) : pair);
    }
  }
  return branches.length === 1 ? branches[0] : new Or(branches);
}

const ratioFn = (a, b) => a === 2 * b || b === 2 * a;
const consecutiveFn = (a, b) => Math.abs(a - b) === 1;
const neitherFn = (a, b) => !ratioFn(a, b) && !consecutiveFn(a, b);

// --- Each shaded cell is boolean: one Replicated Given over the whole SH
// overlay. ---
const shGivens = [
  shlGraph.makeReplicate(new Given(shlGraph.cells()[0], 0, 1)),
  shrGraph.makeReplicate(new Given(shrGraph.cells()[0], 0, 1)),
];

// --- Region count: an EqualSum ties the region's shaded cells to its corner
// digit (plus a tens register, worth 10 each, for the two oversized
// regions -- repeating that cell ten times in the segment is the same total
// as a x10 coefficient); each region needs at least one shaded cell. ---
const regionCounts = REGIONS.flatMap((cells, idx) => {
  const shCells = cells.map(([row, col]) => shAt(row, col));
  const corner = cornerCell(idx);
  const otherSegment = SPECIAL[idx]
    ? [corner, ...Array(10).fill(SPECIAL[idx].tensCell)]
    : [corner];
  const equalSum = new EqualSum(shCells, otherSegment);

  if (!SPECIAL[idx]) {
    // No tens register: the corner digit *is* the count, 1..size.
    return [equalSum, new Given(corner, ...range(1, sizes[idx]))];
  }
  const { tensCell, maxTens } = SPECIAL[idx];
  const notBothZero = new Pair(
    Pair.fnToKey((t, ones) => !(t === 0 && ones === 0), anchorShape),
    'min-one-shaded', tensCell, corner);
  return [equalSum, new Given(tensCell, ...range(0, maxTens)), notBothZero];
});

// --- Rectangle shading: forbid a "3 of 4 shaded" 2x2 window (a concave
// corner) via one shared counting NFA, applied at every window position. ---
// SH cells are Given-restricted to {0, 1}, but they still declare the full
// anchorShape value range (0-9), so the NFA must be built for that full
// range too (a key built for a narrower range silently misreads the rest) --
// reject any value the Given already forbids.
const rectSpec = {
  startState: 0,
  transition: (state, value) => (value > 1 ? undefined : state + value),
  accept: state => state !== 3,
  maxDepth: 4, // always applied to exactly 4 cells (one 2x2 window)
};
const rectNFA = NFA.encodeSpec(rectSpec, anchorShape);
// Template: the 2x2 window anchored at a graph's own first cell (which
// Replicate always uses as its shift origin), read tl/tr/bl/br via the
// graph's own stepping.
const rectTemplate = (graph) => {
  const origin = graph.cells()[0];
  return new NFA(
    rectNFA, 'rect',
    origin, graph.step(origin, 0, 1), graph.step(origin, 1, 0), graph.step(origin, 1, 1));
};
// Windows fully inside one half Replicate over that half's own local origins
// (local row 1..7, local col 1..(12-1) so the window's right column stays in
// the same half). The one column of windows straddling the cols 11/12 split
// (7 of them, one per row) reach across both halves and are listed directly.
const halfWindowOrigins = [];
for (let localRow = 1; localRow <= NUM_ROWS - 1; localRow++) {
  for (let localCol = 1; localCol <= 12 - 1; localCol++) {
    halfWindowOrigins.push(makeCellId(localRow, localCol));
  }
}
const rectConstraints = [
  shlGraph.makeReplicate(rectTemplate(shlGraph), shlGraph.at(halfWindowOrigins)),
  shrGraph.makeReplicate(rectTemplate(shrGraph), shrGraph.at(halfWindowOrigins)),
  ...range(0, NUM_ROWS - 2).map(row => new NFA(
    rectNFA, 'rect', shAt(row, 11), shAt(row, 12), shAt(row + 1, 11), shAt(row + 1, 12))),
];

// --- Adjacent-region dot relations: derive every region-adjacency pair from
// REGIONS itself (a shared edge between differing region indices), match each
// of the 18 drawn dots to the pair of regions it separates, and apply the dot
// relation there or "neither relation" where no dot is drawn. "All possible
// dots are given" is exactly this: presence of a relation implies a dot. ---
const dotForPair = new Map(); // "a-b" (a<b) -> 'W'/'B'
for (const [cellA, cellB, color] of DOTS) {
  const ra = cellRegion.get(cellA.join(','));
  const rb = cellRegion.get(cellB.join(','));
  const key = [Math.min(ra, rb), Math.max(ra, rb)].join('-');
  dotForPair.set(key, color);
}

const seenPairs = new Set();
const dotConstraints = [];
for (let row = 0; row < NUM_ROWS; row++) {
  for (let col = 0; col < NUM_COLS; col++) {
    const here = cellRegion.get(`${row},${col}`);
    for (const [dr, dc] of [[0, 1], [1, 0]]) {
      const nr = row + dr, nc = col + dc;
      if (nr >= NUM_ROWS || nc >= NUM_COLS) continue;
      const there = cellRegion.get(`${nr},${nc}`);
      if (there === here) continue;
      const key = [Math.min(here, there), Math.max(here, there)].join('-');
      if (seenPairs.has(key)) continue;
      seenPairs.add(key);
      const [a, b] = key.split('-').map(Number);
      const color = dotForPair.get(key);
      const relationFn = color === 'B' ? ratioFn : color === 'W' ? consecutiveFn : neitherFn;
      dotConstraints.push(regionRelation(a, b, relationFn, color ? `dot-${color}` : 'no-dot'));
    }
  }
}

return [
  anchorShape,
  new Given('R1C1', 0), // pin the unused placeholder cell so it adds no extra solutions
  cornersVar,
  shLeft,
  shRight,
  tensVar,
  ...shGivens,
  ...regionCounts,
  ...rectConstraints,
  ...dotConstraints,
];
