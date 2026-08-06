// Title: sudoquartet
// Author: Wypman
// Video: https://www.youtube.com/watch?v=1ZR6GmLE9IQ
// Source: https://sudokupad.app/nhgbbb9rdn

// Rules encoded:
// - The 18x18 canvas holds four independent 9x9 sudoku grids, one per
//   quadrant (rows/cols 1-9 = top-left; rows1-9/cols10-18 = top-right;
//   rows10-18/cols1-9 = bottom-left; rows10-18/cols10-18 = bottom-right).
//   Each quadrant follows normal sudoku rules: rows, columns and the 3x3
//   boxes within that quadrant hold 1-9 once (the drawn region borders are
//   exactly these quadrants' boxes -- a plain 6x6 tiling of 3x3 blocks).
//   ISS cannot build a real 18x18-cell / 9-value Shape (numValues must be
//   >= max(rows,cols) = 18, above the 16-value hard cap), so the top-left
//   quadrant is the real Shape('9x9') grid and the other three quadrants are
//   Var layers (TR/BL/BR) with their row/column/box AllDifferent stated
//   explicitly, following the inset.js pattern for off-grid sudoku regions.
// - Gray lines are palindromes (Palindrome): read the same forwards and
//   backwards. One runs the full 18-cell main diagonal, crossing all four
//   quadrants; equality of digit values is well defined regardless of which
//   quadrant a cell belongs to.
// - Blue lines are region sum lines: box borders split each line into
//   segments that must share one common total (own value per line). Native
//   RegionSumLine determines box membership from the grid's own registered
//   box regions, which the Var quadrants never join, so it cannot see box
//   borders inside TR/BL/BR. Segments are therefore pre-split by the puzzle's
//   real 3x3 box grid (computed from drawn coordinates) and enforced with
//   EqualSum, which only needs the pre-computed cell groups.
// - Killer cages: distinct + sum to the total. Four cages cross a quadrant
//   boundary; per the rules ("digits in a cage can repeat in different
//   sudoku grids, but cannot repeat within a single sudoku"), those are
//   encoded as a whole-cage Sum (repeats allowed) plus one AllDifferent per
//   quadrant subset of the cage (distinctness only within that subset).
// - Black dots carrying a printed number X: the two digits have a 1:X ratio
//   (one is X times the other), via a custom Pair relation per dot edge.

// --- Grid / quadrant plumbing ---------------------------------------------

const TR = new Var('B', 'Top-right grid', '9x9');
const BL = new Var('C', 'Bottom-left grid', '9x9');
const BR = new Var('D', 'Bottom-right grid', '9x9');
const quadrantGraph = cellGraph('9x9');
const trCells = quadrantGraph.makeOverlay('VB');
const blCells = quadrantGraph.makeOverlay('VC');
const brCells = quadrantGraph.makeOverlay('VD');

const globalCoords = (id) => {
  const match = /^R(\d+)C(\d+)$/.exec(id); // lint-ok: manual-cell-id-regex
  if (!match) throw new Error(`Invalid global cell id: ${id}`);
  return { row: +match[1], col: +match[2] };
};

// Resolve a global "R#C#" id (1-indexed over the full 18x18 canvas, as drawn)
// to the cell id ISS actually uses: a real grid cell for the top-left
// quadrant, or the matching Var cell for the other three. Hand-parsed rather
// than the built-in parseCellId/cellGraph helpers because those cap out at
// CellGeometry.MAX_SIZE (16), below this puzzle's 18-wide canvas.
const g = (id) => {
  const { row, col } = globalCoords(id);
  const r = row - 1, c = col - 1; // 0-indexed, 0..17
  const lr = (r % 9) + 1, lc = (c % 9) + 1; // 1-indexed within its quadrant
  if (r < 9 && c < 9) return makeCellId(lr, lc);
  if (r < 9) return TR.cell(lr, lc);
  if (c < 9) return BL.cell(lr, lc);
  return BR.cell(lr, lc);
};

// The 3x3 box a global "R#C#" id falls in (as drawn box borders). No single
// graph.boxes() call covers this: the canvas spans two independent Shape
// grids' worth of boxes, joined only by this puzzle's own coordinates.
const boxOf = (id) => {
  const { row, col } = globalCoords(id);
  const r = row - 1, c = col - 1;
  return `${(r / 3) | 0},${(c / 3) | 0}`;
};

// Explicit row/column/box AllDifferent groups for a Var-backed quadrant.
const quadrantSudoku = (overlay) => {
  const rows = overlay.rows();
  const columns = overlay.columns();
  return [
    ...rows.flatMap((row, i) => [row, columns[i]]),
    ...overlay.boxes(),
  ].map(cells => new AllDifferent(...cells));
};

// --- Cages ------------------------------------------------------------
// Cell lists transcribed from the drawn cages. The first eight carry the
// drawn all-different marking and sit inside one quadrant; the last four
// cross a quadrant boundary (no all-different marking on the whole cage)
// and are split below into per-quadrant subsets.

const singleGridCages = [
  { total: 25, cells: ['R5C2', 'R5C3', 'R5C4', 'R6C4', 'R7C4'] },
  { total: 10, cells: ['R16C17', 'R17C17'] },
  { total: 16, cells: ['R3C4', 'R3C5', 'R4C5'] },
  { total: 10, cells: ['R11C16', 'R11C17', 'R12C17', 'R13C17'] },
  { total: 12, cells: ['R4C12', 'R5C12', 'R6C12'] },
  { total: 10, cells: ['R12C6', 'R13C6'] },
  { total: 10, cells: ['R2C12', 'R2C13'] },
  { total: 12, cells: ['R12C3', 'R12C4', 'R13C3', 'R13C4'] },
];

const crossingCages = [
  {
    total: 52,
    all: ['R8C8', 'R8C9', 'R8C10', 'R8C11', 'R9C8', 'R9C11', 'R10C8', 'R10C11', 'R11C8', 'R11C9', 'R11C10', 'R11C11'],
    subsets: [
      ['R8C8', 'R8C9', 'R9C8'],       // top-left share
      ['R8C10', 'R8C11', 'R9C11'],    // top-right share
      ['R10C8', 'R11C8', 'R11C9'],    // bottom-left share
      ['R10C11', 'R11C10', 'R11C11'], // bottom-right share
    ],
  },
  {
    total: 18,
    all: ['R3C9', 'R3C10', 'R4C9', 'R4C10'],
    subsets: [
      ['R3C9', 'R4C9'],   // top-left share
      ['R3C10', 'R4C10'], // top-right share
    ],
  },
  {
    total: 24,
    all: ['R8C15', 'R9C15', 'R10C15', 'R10C16'],
    subsets: [
      ['R8C15', 'R9C15'],   // top-right share
      ['R10C15', 'R10C16'], // bottom-right share
    ],
  },
  {
    total: 25,
    all: ['R14C9', 'R14C10', 'R15C9', 'R15C10'],
    subsets: [
      ['R14C9', 'R15C9'],   // bottom-left share
      ['R14C10', 'R15C10'], // bottom-right share
    ],
  },
];

const cages = [
  ...singleGridCages.map(({ total, cells }) => new Cage(total, ...cells.map(g))),
  ...crossingCages.flatMap(({ total, all, subsets }) => [
    new Sum(total, ...all.map(g)),
    ...subsets.map((s) => new AllDifferent(...s.map(g))),
  ]),
];

// --- Gray lines: palindromes --------------------------------------------
// Cell paths transcribed from the drawn gray lines, in drawn order; a
// palindrome's cell order doesn't affect its meaning.

const palindromeLines = [
  ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9', 'R10C10', 'R11C11', 'R12C12', 'R13C13', 'R14C14', 'R15C15', 'R16C16', 'R17C17', 'R18C18'],
  ['R8C1', 'R8C2', 'R8C3', 'R7C4', 'R7C5', 'R7C6'],
  ['R4C12', 'R5C12', 'R6C12', 'R7C11', 'R8C11', 'R9C11', 'R10C12', 'R11C13', 'R12C14', 'R11C15', 'R11C16', 'R11C17'],
  ['R18C13', 'R17C13', 'R16C13', 'R15C12', 'R15C11', 'R15C10', 'R16C9', 'R16C8', 'R16C7', 'R15C6', 'R14C6', 'R13C6'],
  ['R2C10', 'R3C11', 'R4C10', 'R5C11'],
  ['R7C15', 'R8C16'],
  ['R8C5', 'R9C4', 'R10C3', 'R11C2', 'R12C1'],
  ['R17C1', 'R16C1', 'R15C2', 'R14C2', 'R13C2'],
];

const palindromes = palindromeLines.map((cells) => new Palindrome(...cells.map(g)));

// --- Blue lines: region sum lines ---------------------------------------
// Cell paths transcribed from the drawn blue lines, in drawn order. Split
// into segments wherever the box (per boxOf) changes; one of them is a
// closed loop back to its own start cell, so its segments are grouped
// cyclically instead of linearly -- otherwise its single box straddling the
// wrap point would be split into two segments that don't actually exist on
// the drawn line, over-constraining it.

const openRegionSumLines = [
  ['R5C2', 'R4C3', 'R3C4', 'R2C5'],
  ['R5C7', 'R4C8', 'R3C9', 'R2C10', 'R1C11'],
  ['R11C18', 'R11C17', 'R11C16', 'R11C15', 'R10C14', 'R9C14', 'R8C14', 'R7C15', 'R7C16', 'R7C17', 'R7C18'],
  ['R18C18', 'R17C18', 'R16C18', 'R15C18', 'R14C18'],
  ['R14C13', 'R15C13', 'R16C13', 'R17C13'],
  ['R2C13', 'R2C14', 'R3C15', 'R4C15', 'R5C15'],
  ['R5C18', 'R4C17', 'R3C16'],
  ['R16C9', 'R16C8', 'R16C7', 'R16C6', 'R16C5', 'R16C4'],
  ['R12C1', 'R12C2', 'R12C3', 'R13C4', 'R13C5'],
  ['R8C8', 'R9C7', 'R10C8', 'R11C7'],
];

// Closed loop: 24 distinct cells; the drawn path closes back from the last
// cell to the first.
const closedRegionSumLine = ['R8C6', 'R9C6', 'R10C6', 'R11C6', 'R12C6', 'R13C7', 'R13C8', 'R13C9', 'R13C10', 'R13C11', 'R13C12', 'R12C13', 'R11C13', 'R10C13', 'R9C13', 'R8C13', 'R7C13', 'R6C12', 'R6C11', 'R6C10', 'R6C9', 'R6C8', 'R6C7', 'R7C6'];

const segmentsByBox = (cells) => {
  const segs = [];
  let cur = null, curBox = null;
  for (const cell of cells) {
    const b = boxOf(cell);
    if (b !== curBox) {
      curBox = b;
      cur = [];
      segs.push(cur);
    }
    cur.push(cell);
  }
  return segs;
};

// Same as segmentsByBox, but treats the cell list as a cycle: if the last
// cell's box matches the first cell's box, that boundary run is one segment
// (rotate the list to start at a real box change before grouping).
const cyclicSegmentsByBox = (cells) => {
  const boxes = cells.map(boxOf);
  let start = 0;
  for (let i = 0; i < cells.length; i++) {
    if (boxes[i] !== boxes[(i - 1 + cells.length) % cells.length]) { start = i; break; }
  }
  const rotated = [...cells.slice(start), ...cells.slice(0, start)];
  return segmentsByBox(rotated);
};

const regionSumLines = [
  ...openRegionSumLines.map((cells) => segmentsByBox(cells)),
  cyclicSegmentsByBox(closedRegionSumLine),
].map((segments) => new EqualSum(...segments.map((seg) => seg.map(g))));

// --- Black dots: 1:X ratio -------------------------------------------
// Edge locations and printed values transcribed from the drawn dots
// (edge-sized rounded marks, black fill / white text).

const ratioDots = [
  [2, 'R7C1', 'R7C2'], [2, 'R7C2', 'R7C3'], [2, 'R7C3', 'R7C4'],
  [3, 'R6C4', 'R7C4'], [3, 'R5C4', 'R6C4'], [2, 'R5C2', 'R5C3'],
  [4, 'R4C2', 'R5C2'], [2, 'R3C2', 'R4C2'], [4, 'R3C1', 'R3C2'],
  [2, 'R2C1', 'R3C1'], [3, 'R2C1', 'R2C2'], [2, 'R16C16', 'R16C17'],
  [2, 'R2C2', 'R2C3'], [3, 'R1C3', 'R2C3'], [4, 'R15C16', 'R16C16'],
  [3, 'R15C15', 'R15C16'], [4, 'R8C8', 'R8C9'], [2, 'R8C9', 'R9C9'],
  [3, 'R2C7', 'R3C7'], [2, 'R1C5', 'R1C6'], [2, 'R1C8', 'R1C9'],
  [2, 'R1C9', 'R1C10'], [2, 'R8C1', 'R8C2'], [2, 'R15C18', 'R16C18'],
  [3, 'R12C18', 'R13C18'], [2, 'R6C9', 'R6C10'], [3, 'R11C9', 'R11C10'],
  [2, 'R11C10', 'R12C10'], [3, 'R14C11', 'R14C12'], [3, 'R14C12', 'R15C12'],
  [2, 'R9C14', 'R10C14'], [2, 'R8C14', 'R9C14'], [3, 'R5C15', 'R6C15'],
  [2, 'R4C14', 'R4C15'], [2, 'R4C14', 'R5C14'], [2, 'R4C15', 'R4C16'],
  [2, 'R11C9', 'R12C9'], [2, 'R10C3', 'R10C4'], [2, 'R16C5', 'R17C5'],
  [2, 'R17C6', 'R17C7'], [3, 'R13C5', 'R14C5'], [2, 'R16C2', 'R16C3'],
];

// One shared key per ratio value X: the two digits satisfy a = X*b or b = X*a.
const ratioKey = {};
for (const x of [2, 3, 4]) {
  ratioKey[x] = Pair.fnToKey((a, b) => a === x * b || b === x * a, 9);
}
const dots = ratioDots.map(([x, a, b]) => new Pair(ratioKey[x], `Ratio 1:${x}`, g(a), g(b)));

// ---------------------------------------------------------------------

return [
  new Shape('9x9'),
  TR, BL, BR,
  ...quadrantSudoku(trCells),
  ...quadrantSudoku(blCells),
  ...quadrantSudoku(brCells),
  ...cages,
  ...palindromes,
  ...regionSumLines,
  ...dots,
];
