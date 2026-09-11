// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=T5p8wtTZ-hg
// Source: https://app.crackingthecryptic.com/sudoku/tH3hfpP4DQ

// LITS. Shade exactly four connected cells in each outlined region so that they
// form an L, I, T or S tetromino, and: (1) all shaded cells in the grid are
// orthogonally connected to each other; (2) no 2x2 group of cells is entirely
// shaded; (3) when two tetrominoes in adjacent regions share an edge, they must
// not be of the same type (L, I, T or S), rotations and reflections counting as
// the same type.
//
// There are no digits in this puzzle, so the board carries the shading
// directly: 1 means unshaded, and 2/3/4/5 mean "shaded, and this cell's region
// shaded an L/I/T/S". Storing the type on every shaded cell rather than once
// per region makes rule (3) a plain inequality between two neighbouring cells
// (below), and makes the whole answer one cell group.
//
// The board is 18 rows by 10 columns. An ISS grid is capped at 16 rows, so the
// answer lives in one 18x10 Var group (VB, addressed as board.cell(row, col))
// and the main grid is a single placeholder cell, pinned so it adds no freedom.

const UNSHADED = 1;
const TYPE_VALUE = { L: 2, I: 3, T: 4, S: 5 };
const SHADED_VALUES = Object.values(TYPE_VALUE);

const shape = new Shape('1x1', SHADED_VALUES.length + 1, 'Raw');
const board = new Var('B', 'shading', '18x10');

// The Var group is taller than any cellGraph() can be built, so Replicate
// targets are encoded against a geometry that has the group's cells registered.
const geometry = cellGeometry(shape);
geometry.addVarCellsForConstraints([board]);

// The eighteen outlined regions, transcribed from the drawn region borders as
// [row, column] pairs (labelled A..R in the order the board draws them).
const REGION_COORDS = [
  [[3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [2, 4], [1, 5]], // A
  [[1, 6], [2, 6], [2, 5], [3, 6], [4, 6], [4, 5], [5, 6], [6, 6], [6, 7]], // B
  [[5, 7], [4, 7], [3, 7], [2, 7], [1, 7], [3, 8], [4, 8], [1, 8], [1, 9], [1, 10], [2, 10], [3, 10], [4, 10], [5, 10]], // C
  [[2, 8], [2, 9], [3, 9], [4, 9], [5, 9], [5, 8], [6, 8], [6, 9], [6, 10], [7, 10], [8, 10], [8, 9], [8, 8]], // D
  [[2, 3], [2, 2], [3, 2], [3, 3], [3, 4], [3, 5], [4, 2], [4, 1], [5, 1], [6, 1]], // E
  [[4, 3], [4, 4], [5, 4], [5, 5], [6, 5], [7, 5], [7, 6], [8, 6], [9, 6], [9, 5], [9, 4]], // F
  [[5, 3], [6, 3], [6, 4], [7, 3], [7, 4], [8, 4], [8, 5], [8, 3], [8, 2]], // G
  [[5, 2], [6, 2], [7, 2], [7, 1], [8, 1], [9, 1], [9, 2], [9, 3]], // H
  [[7, 9], [7, 8], [7, 7], [8, 7], [9, 7], [9, 8], [9, 9], [9, 10]], // I
  [[10, 1], [10, 2], [11, 2], [12, 2], [12, 3], [13, 3], [14, 3], [14, 2], [15, 2], [15, 3], [16, 2], [17, 2], [17, 3]], // J
  [[11, 1], [12, 1], [13, 1], [13, 2], [14, 1], [15, 1], [16, 1], [17, 1], [18, 1], [18, 2]], // K
  [[11, 3], [10, 3], [10, 4], [10, 5], [11, 5], [12, 5], [12, 6], [12, 7], [13, 6], [14, 6], [14, 5]], // L
  [[11, 4], [12, 4], [13, 4], [13, 5], [14, 4], [15, 4], [15, 5], [15, 6], [16, 4], [16, 3]], // M
  [[18, 3], [17, 4], [18, 4], [17, 5], [18, 5], [17, 6], [18, 6], [18, 7]], // N
  [[16, 5], [16, 6], [15, 7], [16, 7], [17, 7], [16, 8], [16, 9], [17, 9]], // O
  [[17, 8], [18, 8], [18, 9], [17, 10], [18, 10], [16, 10], [15, 10], [15, 9], [14, 9], [13, 9], [12, 9], [11, 9]], // P
  [[10, 7], [10, 8], [10, 9], [10, 10], [11, 10], [12, 10], [13, 10], [14, 10]], // Q
  [[10, 6], [11, 6], [11, 7], [11, 8], [12, 8], [13, 8], [13, 7], [14, 7], [14, 8], [15, 8]], // R
];

const cellAt = ([row, col]) => board.cell(row, col);

// Which region (index into REGION_COORDS) each [row, col] belongs to.
const regionAt = new Map();
REGION_COORDS.forEach((coords, idx) => coords.forEach(
  ([row, col]) => regionAt.set(`${row},${col}`, idx)));

// --- Free-tetromino classification ----------------------------------------
// Reference shapes as [row, col] offsets. O (the 2x2 square) is listed so that
// candidate enumeration can recognise and discard it: the rules admit only
// L, I, T and S.
const SHAPE_REFS = {
  L: [[0, 0], [1, 0], [2, 0], [2, 1]],
  I: [[0, 0], [0, 1], [0, 2], [0, 3]],
  T: [[0, 0], [0, 1], [0, 2], [1, 1]],
  S: [[0, 1], [0, 2], [1, 0], [1, 1]],
  O: [[0, 0], [0, 1], [1, 0], [1, 1]],
};

// Canonical form of a polyomino under the eight rotations/reflections: the
// lexicographically smallest normalized offset list. Two cell sets have the
// same key exactly when they are the same free tetromino, which is the
// "regardless of rotations or reflections" clause of rule (3).
function canonicalKey(points) {
  let best = null;
  for (let refl = 0; refl < 2; refl++) {
    let cur = refl ? points.map(([r, c]) => [r, -c]) : points;
    for (let rot = 0; rot < 4; rot++) {
      const minR = Math.min(...cur.map(p => p[0]));
      const minC = Math.min(...cur.map(p => p[1]));
      const key = cur
        .map(([r, c]) => [r - minR, c - minC])
        .sort((a, b) => (a[0] - b[0]) || (a[1] - b[1]))
        .map(p => p.join(','))
        .join(';');
      if (best === null || key < best) best = key;
      cur = cur.map(([r, c]) => [c, -r]);
    }
  }
  return best;
}

const KEY_TO_TYPE = new Map(
  Object.entries(SHAPE_REFS).map(([name, pts]) => [canonicalKey(pts), name]));

function subsetsOf4(arr) {
  const out = [];
  for (let a = 0; a < arr.length; a++)
    for (let b = a + 1; b < arr.length; b++)
      for (let c = b + 1; c < arr.length; c++)
        for (let d = c + 1; d < arr.length; d++)
          out.push([arr[a], arr[b], arr[c], arr[d]]);
  return out;
}

// Every four-cell subset of a region that is one of the four admitted
// tetrominoes. The five free tetrominoes are exactly the orthogonally connected
// four-cell sets, so a subset whose canonical form is not in the table is
// disconnected, and the O square is dropped by the rules' own list. This is a
// complete enumeration of what the region rule allows -- 198 placements across
// the eighteen regions -- so the Or below is the rule itself, not a shortlist.
function placements(regionCoords) {
  return subsetsOf4(regionCoords)
    .map(coords => ({ coords, type: KEY_TO_TYPE.get(canonicalKey(coords)) }))
    .filter(({ type }) => type !== undefined && type !== 'O');
}

// --- Lead rule: one L/I/T/S tetromino shaded per region --------------------
// Each branch pins every cell of the region: the four tetromino cells to the
// value naming its type, the rest to UNSHADED. Pinning the whole region is what
// makes "exactly four" exact.
const regionShading = REGION_COORDS.map(regionCoords => new Or(
  placements(regionCoords).map(({ coords, type }) => {
    const shaded = new Set(coords.map(cellAt));
    return new And(regionCoords.map(cellAt).map(cell => new Given(
      cell, shaded.has(cell) ? TYPE_VALUE[type] : UNSHADED)));
  })));

// --- Rule (1): all shaded cells connected with each other -------------------
const shadedConnected = new ConnectedValues('VB', SHADED_VALUES);

// Replicate templates are drawn at the group's top-left cell and shifted onto
// each target; the shift is by the group's own row-major layout.
const origin = board.cell(1, 1);

// Every [row, col] of the board, in the group's row-major order.
const ALL_COORDS = [];
for (let row = 1; row <= 18; row++)
  for (let col = 1; col <= 10; col++) ALL_COORDS.push([row, col]);

// --- Rule (2): no 2x2 group entirely shaded ---------------------------------
// Every 2x2 square must contain an unshaded cell. One template stamped onto each
// cell that has a full 2x2 square below and to the right of it.
const no2x2Targets = ALL_COORDS
  .filter(([row, col]) => row < 18 && col < 10).map(cellAt);
const no2x2Shaded = new Replicate(
  [new Quad(origin, UNSHADED)],
  Replicate.encodeTargetCells(no2x2Targets, origin, geometry), origin);

// --- Rule (3): touching tetrominoes of adjacent regions differ in type ------
// Two shaded cells of different regions that share an edge means their two
// tetrominoes share an edge. Every shaded cell carries its own region's type,
// so the rule is: not both shaded with the same type. Pairs inside one region
// are excluded -- a region's own cells always carry the same type.
const differentTypeKey = Pair.fnToKey(
  (a, b) => a === UNSHADED || b === UNSHADED || a !== b, shape);

// One template per direction (right, down), stamped onto the cells whose
// neighbour that way lies in another region. Right and down together visit each
// adjacent pair exactly once.
const boundaryPairs = [[0, 1], [1, 0]].map(([dRow, dCol]) => {
  const targets = ALL_COORDS.filter(([row, col]) => {
    const other = regionAt.get(`${row + dRow},${col + dCol}`);
    return other !== undefined && other !== regionAt.get(`${row},${col}`);
  }).map(cellAt);
  return new Replicate(
    [new Pair(differentTypeKey, 'different tetromino type',
      origin, board.cell(1 + dRow, 1 + dCol))],
    Replicate.encodeTargetCells(targets, origin, geometry), origin);
});

return [
  shape,
  new Given('R1C1', 1),
  board,
  ...regionShading,
  shadedConnected,
  no2x2Shaded,
  ...boundaryPairs,
];
