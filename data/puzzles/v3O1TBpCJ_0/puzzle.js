// Title: We're All Mad Here
// Author: gdc
// Video: https://www.youtube.com/watch?v=v3O1TBpCJ_0
// Source: https://sudokupad.app/oaeuopmvrt

// Rules encoded:
//   Normal Sudoku.
//   Mad Fold-In: the two vertical dashed lines are folded onto each other so
//     that columns 1, 2, 8 and 9 form a secondary 4x9 grid, in which all clues
//     are still valid. Columns 3-7 are hidden by the fold.
//   Killer: digits in a cage don't repeat and sum to the total in the top-left
//     corner.
//   Kropki: digits separated by a white dot are consecutive. Not all dots are
//     given, so there is no negative constraint.
//   Hitpoints: an outside clue is the sum of the digits that equal their own
//     distance from that clue along its row or column. Horizontal distances in
//     the folded 4x9 grid are limited to 1-4.
//   Dynamic Fog is a reveal mechanic: it hides clues from the player but places
//     no condition on the finished grid, so nothing is encoded for it.

// The dashed lines are drawn on the column-2/3 and column-7/8 boundaries, each
// as a full-height run of dashes; a pair of arrowheads above the grid points
// inwards at those two boundaries, and the banner above columns 3-7 reads
// "Columns 3-7 are hidden after folding!".
const LEFT_FOLD_COL = 2;   // dashed line on the C2|C3 boundary
const RIGHT_FOLD_COL = 7;  // dashed line on the C7|C8 boundary

// Bringing the two dashed lines together leaves the left flap and the right
// flap side by side, each keeping its own orientation, with the middle tucked
// behind: reading the secondary grid left to right gives C1, C2, C8, C9, which
// is the order the rules list them in and gives the stated 4 columns.
const FOLDED_COLUMNS = [1, 2, 8, 9];
const foldedCol = (col) => FOLDED_COLUMNS.indexOf(col) + 1;  // 0 when hidden
const isVisible = (cellId) => foldedCol(parseCellId(cellId).col) > 0;

// Drawn cages, each listed in the reading order the source stores, so the first
// cell of each list is the corner the total is printed in.
const DRAWN_CAGES = [
  { sum: 15, cells: ['R3C7', 'R3C8', 'R4C8', 'R5C7', 'R5C8'] },
  { sum: 28, cells: ['R3C2', 'R3C3', 'R4C3', 'R5C2', 'R5C3', 'R6C2', 'R7C2'] },
  { sum: 25, cells: ['R6C1', 'R7C1', 'R8C1', 'R8C2', 'R8C3'] },
  { sum: 12, cells: ['R8C7', 'R8C8', 'R8C9'] },
  { sum: 27, cells: ['R1C2', 'R1C3', 'R2C3', 'R2C4'] },
  { sum: 27, cells: ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'] },
  { sum: 12, cells: ['R3C4', 'R4C4', 'R4C5'] },
];

// White kropki dots, transcribed as the edge each dot straddles. The first two
// sit exactly on the two dashed lines; the third is inside the hidden band.
const DRAWN_DOTS = [
  ['R9C2', 'R9C3'],
  ['R9C7', 'R9C8'],
  ['R8C4', 'R8C5'],
];

// Outside hitpoint clues, transcribed with their lanes ordered from the clue
// inwards, so a cell's position in the lane is its distance from the clue.
const rowFrom = (row, cols) => cols.map((col) => makeCellId(row, col));
const colFrom = (col, rows) => rows.map((row) => makeCellId(row, col));
const ROW_COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const DRAWN_HITPOINTS = [
  { total: 10, lane: rowFrom(2, ROW_COLS) },                    // left of R2
  { total: 0, lane: rowFrom(6, [...ROW_COLS].reverse()) },      // right of R6
  { total: 5, lane: colFrom(8, [...ROW_COLS].reverse()) },      // below C8
];

// The same three clues re-read in the folded grid. The row lanes shrink to the
// four surviving columns; the column lane below C8 is untouched by the fold
// (rows are not folded) and would repeat its drawn constraint exactly, so only
// the two row lanes appear here.
const FOLDED_HITPOINTS = [
  { total: 10, lane: rowFrom(2, FOLDED_COLUMNS) },
  { total: 0, lane: rowFrom(6, [...FOLDED_COLUMNS].reverse()) },
];

const cageOf = new Map();
DRAWN_CAGES.forEach((cage, i) => cage.cells.forEach((id) => cageOf.set(id, i)));

// A cage runs through a dashed line at a row when it holds the cells on both
// sides of it, so its outline is open where the fold falls.
const cageCrossing = (row, col) => {
  const before = cageOf.get(makeCellId(row, col));
  const after = cageOf.get(makeCellId(row, col + 1));
  return before !== undefined && before === after ? before : -1;
};

// Folding glues the two dashed lines together, so a cage left open at the
// C2|C3 line and a cage left open at the C7|C8 line in the same row become one
// cage of the secondary grid.
const foldGroup = DRAWN_CAGES.map((_, i) => i);
const groupOf = (i) => (foldGroup[i] === i ? i : (foldGroup[i] = groupOf(foldGroup[i])));
for (const row of ROW_COLS) {
  const left = cageCrossing(row, LEFT_FOLD_COL);
  const right = cageCrossing(row, RIGHT_FOLD_COL);
  if (left >= 0 && right >= 0) foldGroup[groupOf(left)] = groupOf(right);
}

const foldedCages = DRAWN_CAGES.map((_, i) => i)
  .filter((i) => groupOf(i) === i)
  .map((root) => DRAWN_CAGES.map((_, i) => i).filter((i) => groupOf(i) === root))
  .map((members) => {
    const cells = members.flatMap((i) => DRAWN_CAGES[i].cells).filter(isVisible)
      .sort((a, b) => {
        const p = parseCellId(a), q = parseCellId(b);
        return p.row - q.row || foldedCol(p.col) - foldedCol(q.col);
      });
    // The total a folded cage carries is the one printed in its own top-left
    // corner; the merged partner's total is printed in a hidden column.
    const owner = members.find((i) => DRAWN_CAGES[i].cells[0] === cells[0]);
    return owner === undefined ? null : new Cage(DRAWN_CAGES[owner].sum, ...cells);
  })
  .filter((cage) => cage !== null);

// Each dot on a dashed line is halved by the fold; the two halves in the same
// row meet at the seam and read as a single dot between C2 and C8.
const consecutive = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const dotOnEdge = (row, col) => DRAWN_DOTS.some(
  (edge) => edge.includes(makeCellId(row, col))
    && edge.includes(makeCellId(row, col + 1)));
const foldedDots = ROW_COLS
  .filter((row) => dotOnEdge(row, LEFT_FOLD_COL) && dotOnEdge(row, RIGHT_FOLD_COL))
  .map((row) => new Pair(
    consecutive, 'seam kropki',
    makeCellId(row, LEFT_FOLD_COL), makeCellId(row, RIGHT_FOLD_COL + 1)));

// Hitpoint lane machine. The state is the position reached in the lane, which
// is the distance of the next cell from the clue, plus the total banked so far.
// A cell contributes its distance exactly when its digit equals that distance;
// the running total never decreases, so overshooting the clue is a dead branch.
const hitpointSpec = (total, laneLength) => NFA.encodeSpec({
  startState: { distance: 0, sum: 0 },
  transition: ({ distance, sum }, value) => {
    const next = distance + 1;
    const banked = sum + (value === next ? next : 0);
    return banked > total ? undefined : { distance: next, sum: banked };
  },
  accept: ({ sum }) => sum === total,
  maxDepth: laneLength,
}, 9);

const hitpoint = ({ total, lane }, label) =>
  new NFA(hitpointSpec(total, lane.length), label, lane);

return [
  new Shape('9x9'),

  ...DRAWN_CAGES.map((cage) => new Cage(cage.sum, ...cage.cells)),
  ...foldedCages,

  ...DRAWN_DOTS.map((edge) => new WhiteDot(...edge)),
  ...foldedDots,

  ...DRAWN_HITPOINTS.map((clue) => hitpoint(clue, 'hitpoints')),
  ...FOLDED_HITPOINTS.map((clue) => hitpoint(clue, 'folded hitpoints')),
];
