// Title: Chess + Sudoku = Magic
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ifgYyI-9ihU
// Source: https://cracking-the-cryptic.web.app/sudoku/mjRMJTLN6m

// Normal sudoku rules apply on the 9x9 grid (default rows/columns/boxes).
// A thermometer requires strictly increasing digits from the bulb.
// The two coloured 3x3 areas are magic squares: no repeated digit within the
// area, and every row, column and both 3-cell diagonals of the area share the
// same sum. Neither area is aligned with the sudoku boxes, so its
// all-different is stated explicitly rather than inherited from a box group.
// Digits 1, 2, 3 and 4 obey a knight's-move constraint: two cells a knight's
// move apart cannot hold the same value when that value is 1, 2, 3 or 4;
// digits 5-9 are unrestricted by this rule.

const graph = cellGraph('9x9');

// Magic square areas (underlays, drawn fill=red / fill=deepskyblue), each a
// 3x3 block offset from the box grid.
const redSquare = graph.block('R6C3', 3, 3);
const blueSquare = graph.block('R2C6', 3, 3);

const magicSquareConstraints = (cells) => {
  // cells is row-major over the 3x3 block.
  const rows = [cells.slice(0, 3), cells.slice(3, 6), cells.slice(6, 9)];
  const cols = [0, 1, 2].map(c => rows.map(row => row[c]));
  const diagonals = [
    [rows[0][0], rows[1][1], rows[2][2]],
    [rows[0][2], rows[1][1], rows[2][0]],
  ];
  return [
    new AllDifferent(...cells),
    new EqualSum(...rows, ...cols, ...diagonals),
  ];
};

// Thermometer (line #0): bulb R6C2, then R7C2, R8C1, R8C2.
const thermo = new Thermo('R6C2', 'R7C2', 'R8C1', 'R8C2');

// Restricted anti-knight: forbid equal values a knight's move apart only when
// that shared value is 1-4. ISS has no knightNeighbours helper (unlike
// neighbours()/kingNeighbours()), so the pairs are built from AntiKnight's own
// offsets [[1,2],[2,1],[1,-2],[2,-1]] (matching sudoku_constraint.js's
// AntiKnight handler); dRow is kept positive so each unordered pair arises
// exactly once. One Replicate per offset shifts a single template pair over
// every cell for which that offset stays on the grid, instead of writing out
// all 224 individual pairs.
const restrictedKnightKey = Pair.fnToKey((a, b) => !(a === b && a <= 4), 9);
const KNIGHT_OFFSETS = [[1, 2], [2, 1], [1, -2], [2, -1]];
const knightPairConstraints = KNIGHT_OFFSETS.map(([dRow, dCol]) => {
  // Row 1 always has room to step dRow (1 or 2) further down; pick the
  // origin's column so stepping dCol also stays on the grid (R1C1 itself
  // when dCol >= 0, otherwise shifted right by -dCol).
  const origin = makeCellId(1, dCol < 0 ? 1 - dCol : 1);
  const target = graph.step(origin, dRow, dCol);
  const template = new Pair(
    restrictedKnightKey, 'restricted knight', origin, target);
  const starts = graph.cells().filter(
    cell => graph.step(cell, dRow, dCol) !== null);
  return new Replicate(
    [template],
    Replicate.encodeTargetCells(starts, origin, graph),
    origin);
});

return [
  new Shape('9x9'),

  // Givens (drawn as the four highlighted cells).
  new Given('R4C4', 1),
  new Given('R5C8', 2),
  new Given('R7C9', 3),
  new Given('R9C2', 4),

  thermo,

  ...magicSquareConstraints(redSquare),
  ...magicSquareConstraints(blueSquare),

  ...knightPairConstraints,
];
