// Title: Accounting Circles Tessellation
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=Bd26XKNPQwM
// Source: https://sudokupad.app/zeu960ln92?setting-nogrid=true

// The source sets metadata.norowcol: no digit repeats along a full physical
// row or column (Shape's 'Raw' type), so every distinctness rule below is
// stated explicitly rather than inherited.
//
// TESSELLATION
// - Fill each cell 1-9.
// - Cells sharing an edge differ.
// - Each horizontal row and vertical column holds a non-repeating consecutive
//   set of digits (e.g. 23456), in any order.
// ACCOUNTING CIRCLES
// - The blue circles and red squares together hold a complete 1-9 set.
// - A circle's digit counts how many of that digit appear in the whole grid.
// - A square's digit is NOT how many times that digit appears in the grid.
//
// The picture is a truncated-square tiling (24 octagons, 16 squares)
// occupying a 41-cell diamond in the middle of the 9x9 board; the other 40
// cells sit in four undivided corner triangles, plain grid squares with no
// tessellation tile drawn on them and no wall inside them at all. Both
// TESSELLATION rules -- the row/column consecutive-set rule and the
// shared-edge rule -- are drawn only as tile/wall geometry, and every piece of
// that geometry (14 same-row/same-column straight runs -- the diamond's 9
// rows and 9 columns, two of each trivially one cell -- and 40 single-step
// diagonal tile-to-tile pairs) lies entirely inside the diamond; none of it
// touches a corner cell. So both rules bind only inside the diamond -- the
// corners carry neither and are pinned only by the global count rule.
const shape = new Shape('9x9', '', 'Raw');
const graph = cellGraph(shape);

// The diamond's 9 rows, one per drawn straight-run cage (row1 and row9 are
// the single cells R1C5/R9C5, already pinned to {1-9} by column 5's own
// 9-cell run below, so they need no separate Renban).
const rowRuns = [
  ['R2C4', 'R2C5', 'R2C6'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
  ['R8C4', 'R8C5', 'R8C6'],
];
// The diamond's 9 columns, same source (columns 1 and 9 are the single
// cells R5C1/R5C9, already pinned by row 5's run above).
const colRuns = [
  ['R4C2', 'R5C2', 'R6C2'],
  ['R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3'],
  ['R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'],
  ['R4C8', 'R5C8', 'R6C8'],
];
const rowColRenbans = [...rowRuns, ...colRuns].map(cells => new Renban(...cells));

// The diamond's cell set, for scoping the adjacency rule below: the union of
// every row/column run (a cell not in any run -- R1C5, R5C1, R5C9, R9C5 --
// still sits in the other direction's 9-cell run).
const diamondCells = new Set([...rowRuns, ...colRuns].flat());

// "Cells sharing an edge" -- drawn only inside the diamond (see above), so
// scoped to orthogonally-adjacent pairs with both cells in the diamond,
// computed from the grid rather than typed by hand.
const seenOrthPairs = new Set();
const orthPairs = [];
for (const line of [...graph.rows(), ...graph.columns()]) {
  for (let i = 0; i + 1 < line.length; i++) {
    const [a, b] = [line[i], line[i + 1]];
    if (!(diamondCells.has(a) && diamondCells.has(b))) continue;
    const key = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (!seenOrthPairs.has(key)) { seenOrthPairs.add(key); orthPairs.push([a, b]); }
  }
}

// The tessellation's extra edges: 40 drawn diagonal 2-cell groups, each a
// truncated-square tile touching its diagonal neighbour -- an adjacency
// plain row/column distinctness does not imply.
const diagonalEdgePairs = [
  ['R1C5', 'R2C6'], ['R1C5', 'R2C4'], ['R2C4', 'R3C5'], ['R2C4', 'R3C3'],
  ['R2C6', 'R3C7'], ['R2C6', 'R3C5'], ['R3C3', 'R4C4'], ['R3C3', 'R4C2'],
  ['R3C5', 'R4C6'], ['R3C5', 'R4C4'], ['R3C7', 'R4C8'], ['R3C7', 'R4C6'],
  ['R4C2', 'R5C3'], ['R4C2', 'R5C1'], ['R4C4', 'R5C5'], ['R4C4', 'R5C3'],
  ['R4C6', 'R5C7'], ['R4C6', 'R5C5'], ['R4C8', 'R5C9'], ['R4C8', 'R5C7'],
  ['R6C2', 'R5C3'], ['R6C2', 'R5C1'], ['R6C4', 'R5C5'], ['R6C4', 'R5C3'],
  ['R6C6', 'R5C7'], ['R6C6', 'R5C5'], ['R6C8', 'R5C9'], ['R6C8', 'R5C7'],
  ['R7C3', 'R6C4'], ['R7C3', 'R6C2'], ['R7C5', 'R6C6'], ['R7C5', 'R6C4'],
  ['R7C7', 'R6C8'], ['R7C7', 'R6C6'], ['R8C4', 'R7C5'], ['R8C4', 'R7C3'],
  ['R8C6', 'R7C7'], ['R8C6', 'R7C5'], ['R9C5', 'R8C6'], ['R9C5', 'R8C4'],
];
const adjacencyDiffs = [...orthPairs, ...diagonalEdgePairs]
  .map(([a, b]) => new AllDifferent(a, b));

// Accounting Circles' 9 marker cells: 7 blue circles, 2 red squares.
// "Combined form a complete set of 1-9" is all-different over exactly 9
// cells on a 1-9 board, which forces the full set automatically.
const circleCells = ['R5C5', 'R5C4', 'R1C5', 'R4C2', 'R8C4', 'R4C7', 'R6C7'];
const squareCells = ['R2C5', 'R6C5'];
const markerCells = [...circleCells, ...squareCells];
const markerRoles = [
  ...circleCells.map(() => 'circle'),
  ...squareCells.map(() => 'square'),
];
const markerSet = new Set(markerCells);
const otherCells = graph.cells().filter(c => !markerSet.has(c));
const scanOrder = [...markerCells, ...otherCells]; // all 81 cells, markers first

// One counting NFA per target digit t (a self-counting rule reduced to one
// per-target invariant apiece). Each scans all 81 cells once. The first 9
// (markerCells, fixed order) also fix `role`: the marker whose value equals t
// is the unique circle/square holding it. `count` tallies every cell
// (including the markers) equal to t, clamped at t+1 as an "already too many"
// sink. Accept iff a circle's t matches its own frequency, or a square's does
// not.
const acctNFAs = [];
for (let t = 1; t <= 9; t++) {
  const spec = NFA.encodeSpec({
    startState: { step: 0, role: 'none', count: 0 },
    transition: ({ step, role, count }, value) => {
      const isMarker = step < markerCells.length;
      const hit = value === t ? 1 : 0;
      const role_ = (isMarker && hit) ? markerRoles[step] : role;
      return {
        step: Math.min(step + 1, markerCells.length),
        role: role_,
        count: Math.min(count + hit, t + 1),
      };
    },
    accept: ({ role, count }) =>
      (role === 'circle' && count === t) || (role === 'square' && count !== t),
    maxDepth: scanOrder.length,
  }, 9);
  acctNFAs.push(new NFA(spec, 'Acct' + t, ...scanOrder));
}

return [
  shape,
  ...rowColRenbans,
  ...adjacencyDiffs,
  new AllDifferent(...markerCells),
  ...acctNFAs,
];
