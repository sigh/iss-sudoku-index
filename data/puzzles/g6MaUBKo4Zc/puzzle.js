// Title: Friendly Borders
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=g6MaUBKo4Zc
// Source: https://sudokupad.app/ksn2ld67um

// Rules encoded:
// - Normal sudoku: row/column/box all-different, from the default Shape('9x9').
// - Border squares: every 2x2 square that crosses a 3x3 box border has exactly 2
//   digits the same among its 4 cells. A square's top-left row/column is 3 or 6
//   exactly when it straddles a box boundary (boxes break after rows/columns 3
//   and 6). "Exactly 2 digits are the same" among 4 cells means one matching
//   pair and two further distinct singles -- the only 4-cell partition with
//   exactly 3 distinct values -- so each square is encoded as CountDistinct == 3
//   via a pinned auxiliary control cell.
// - The middle box (R4-6,C4-6) is a magic square: its 3 rows, 3 columns, and
//   "main 3-cell diagonal" (singular -- only the top-left-to-bottom-right
//   diagonal, not both) share one sum. EqualSum plus the box's own
//   all-different (digits 1-9, total 45) forces that common sum -- the puzzle's
//   N -- to 15 without pinning it directly: 3 equal-sum rows partition the 45,
//   so 3N = 45.
// - Exactly N friendly cells exist in the grid, where a cell is friendly if its
//   digit equals its row, column, or box number (1-indexed, box in reading
//   order). This reuses the magic square's N, already forced to 15 above, so
//   the target below is that literal value, not a re-derivation from the
//   solution. Each grid cell gets a pinned {1,2} flag Var tied to its digit by
//   a per-cell Pair relation (2 = friendly), and ContainExact fixes the count
//   of "2" flags to 15 over all 81 cells.
// - Black dots (ratio 1:2, adjacent cells only): 3 are drawn; "not all dots are
//   necessarily given" means unmarked adjacent pairs carry no constraint, so
//   only the 3 drawn dots are encoded.

const graph = cellGraph();
const allCells = graph.cells();

function boxOf(cellId) {
  const { row, col } = parseCellId(cellId);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
}

// ---- Border squares ---------------------------------------------------------

// Every 2x2 square (named by its top-left cell) whose top-left row or column is
// 3 or 6 straddles a box boundary, since the boxes break after rows/columns 3
// and 6.
const borderSquares = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    if (r % 3 !== 0 && c % 3 !== 0) continue;
    borderSquares.push(graph.block(makeCellId(r, c), 2, 2));
  }
}

// One pinned aux cell per border square, fixed to 3: CountDistinct forces
// exactly 3 distinct values among the square's 4 cells -- the (2,1,1) shape
// that "exactly 2 digits are the same" describes.
const borderControl = new Var(
  'B', 'Border square distinct-value counts', borderSquares.length);
const borderControlGivens = borderSquares.map(
  (_, i) => new Given(borderControl.cell(i + 1), 3));
const borderSquareConstraints = borderSquares.map(
  (square, i) => new CountDistinct(borderControl.cell(i + 1), ...square));

// ---- Middle-box magic square -------------------------------------------------

const midRows = [4, 5, 6].map(r => [4, 5, 6].map(c => makeCellId(r, c)));
const midCols = [4, 5, 6].map(c => [4, 5, 6].map(r => makeCellId(r, c)));
const midDiagonal = [4, 5, 6].map(i => makeCellId(i, i));
const magicSquare = new EqualSum(...midRows, ...midCols, midDiagonal);

// ---- Friendly cells -----------------------------------------------------------

const FRIENDLY = 2;
const NOT_FRIENDLY = 1;
const FRIENDLY_COUNT = 15; // = N; see header comment for the forced-value derivation.

// One flag var per grid cell, paired 1:1 by makeOverlay. Every flag has the
// same {1,2} domain, so one Given template is replicated to all of them
// instead of writing 81 identical Givens.
const friendlyFlags = graph.makeOverlay('VF');
const friendlyFlagDomain = friendlyFlags.makeReplicate(
  new Given(friendlyFlags.cells()[0], NOT_FRIENDLY, FRIENDLY));
const friendlyRelations = allCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const friendlyValues = new Set([row, col, boxOf(cell) + 1]);
  return new Pair(
    Pair.fnToKey((flag, digit) => (flag === FRIENDLY) === friendlyValues.has(digit), 9),
    '', friendlyFlags.at(cell), cell);
});
const friendlyCount = new ContainExact(
  Array(FRIENDLY_COUNT).fill(FRIENDLY).join('_'),
  ...friendlyFlags.at(allCells));

// ---- Black dots (ratio 1:2) --------------------------------------------------
// Provenance: overlays #0-#2 of the source payload (small filled rounded
// squares centred on cell edges).
const blackDots = [
  new BlackDot('R2C3', 'R2C4'),
  new BlackDot('R8C1', 'R8C2'),
  new BlackDot('R7C5', 'R8C5'),
];

return [
  new Shape('9x9'),
  borderControl,
  ...borderControlGivens,
  ...borderSquareConstraints,
  magicSquare,
  friendlyFlags.toVar('Friendly cell flags'),
  friendlyFlagDomain,
  ...friendlyRelations,
  friendlyCount,
  ...blackDots,
];
