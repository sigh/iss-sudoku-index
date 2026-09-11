// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=xA4huJ6ZbKE
// Source: https://cracking-the-cryptic.web.app/sudoku/LLF6BNMnJL

// LITS. Shade exactly four connected cells in each outlined region so that they
// form an L, I, T or S tetromino, and: (1) all shaded cells in the grid are
// orthogonally connected to each other; (2) no 2x2 group of cells is entirely
// shaded; (3) when two tetrominoes in adjacent regions share an edge, they must
// not be of the same type (L, I, T or S), rotations and reflections counting as
// the same type.
//
// There are no digits in this puzzle, so the board is a Raw grid carrying the
// shading directly: 1 means unshaded, and 2/3/4/5 mean "shaded, and this cell's
// region shaded an L/I/T/S". Storing the type on every shaded cell rather than
// once per region makes rule (3) a plain inequality between two neighbouring
// cells (below), and makes the whole answer the board.

const GRID = '11x11';
const UNSHADED = 1;
const TYPE_VALUE = { L: 2, I: 3, T: 4, S: 5 };
const SHADED_VALUES = Object.values(TYPE_VALUE);

const shape = new Shape(GRID, SHADED_VALUES.length + 1, 'Raw');
const graph = cellGraph(shape);

// The fourteen outlined regions, transcribed from the drawn region borders as
// [row, column] pairs (labelled A..N in the order the board draws them).
const REGION_COORDS = [
  [[1,1], [2,1], [2,2], [2,3], [3,1], [4,1], [5,1], [6,1], [7,1]], // A
  [[1,2], [1,3], [1,4], [2,4], [3,2], [3,3], [3,4], [4,2], [5,2], [5,3], [5,4]], // B
  [[1,8], [1,9], [1,10], [2,10], [3,8], [3,9], [3,10], [4,10], [5,8], [5,9], [5,10]], // C
  [[1,11], [2,11], [3,11], [4,11], [5,11]], // D
  [[1,5], [1,6], [1,7], [2,7], [2,8], [2,9], [3,7]], // E
  [[2,5], [2,6], [3,5], [4,3], [4,4], [4,5]], // F
  [[3,6], [4,6], [4,7], [4,8], [4,9], [5,5], [5,6], [5,7], [6,7], [6,8], [6,9], [6,10], [7,7]], // G
  [[6,2], [6,3], [6,4], [6,5], [6,6], [7,5], [8,3], [8,4], [8,5]], // H
  [[7,2], [7,3], [7,4], [8,2], [9,2], [9,3], [9,4], [10,4], [11,2], [11,3], [11,4]], // I
  [[7,8], [7,9], [7,10], [8,8], [8,10], [9,10], [10,10], [11,10]], // J
  [[6,11], [7,11], [8,11], [9,11], [10,11], [11,11]], // K
  [[7,6], [8,6], [8,7], [8,9], [9,7], [9,8], [9,9], [10,9], [11,6], [11,7], [11,8], [11,9]], // L
  [[9,5], [9,6], [10,5], [10,6], [10,7], [10,8], [11,5]], // M
  [[8,1], [9,1], [10,1], [10,2], [10,3], [11,1]], // N
];

// Column 11 is 'RxCa', so every id is built rather than written out.
const REGIONS = REGION_COORDS.map(
  coords => coords.map(([row, col]) => makeCellId(row, col)));

const cellRegion = new Map();
REGIONS.forEach((cells, idx) => cells.forEach(cell => cellRegion.set(cell, idx)));

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

function tetrominoType(cellIds) {
  const points = cellIds.map(id => {
    const { row, col } = parseCellId(id);
    return [row, col];
  });
  return KEY_TO_TYPE.get(canonicalKey(points));
}

function isConnected(cellIds) {
  const set = new Set(cellIds);
  const seen = new Set([cellIds[0]]);
  const queue = [cellIds[0]];
  while (queue.length) {
    for (const n of graph.neighbours(queue.pop())) {
      if (set.has(n) && !seen.has(n)) {
        seen.add(n);
        queue.push(n);
      }
    }
  }
  return seen.size === set.size;
}

function subsetsOf4(arr) {
  const out = [];
  for (let a = 0; a < arr.length; a++)
    for (let b = a + 1; b < arr.length; b++)
      for (let c = b + 1; c < arr.length; c++)
        for (let d = c + 1; d < arr.length; d++)
          out.push([arr[a], arr[b], arr[c], arr[d]]);
  return out;
}

// Every four-cell subset of a region that is connected and is one of the four
// admitted tetrominoes. This is a complete enumeration of what the region rule
// allows -- 113 placements across the fourteen regions -- so the Or below is
// the rule itself, not a shortlist.
function placements(regionCells) {
  return subsetsOf4(regionCells)
    .filter(isConnected)
    .map(cells => ({ cells, type: tetrominoType(cells) }))
    .filter(({ type }) => type !== 'O');
}

// --- Lead rule: one L/I/T/S tetromino shaded per region --------------------
// Each branch pins every cell of the region: the four tetromino cells to the
// value naming its type, the rest to UNSHADED. Pinning the whole region is what
// makes "exactly four" exact.
const regionShading = REGIONS.map(regionCells => new Or(
  placements(regionCells).map(({ cells, type }) => {
    const shaded = new Set(cells);
    return new And(regionCells.map(cell => new Given(
      cell, shaded.has(cell) ? TYPE_VALUE[type] : UNSHADED)));
  })));

// --- Rule (1): all shaded cells connected with each other -------------------
const shadedConnected = new ConnectedValues('', SHADED_VALUES);

// --- Rule (2): no 2x2 group entirely shaded ---------------------------------
// Every 2x2 square must contain an unshaded cell. One template replicated onto
// each cell that has a full 2x2 square below and to the right of it.
const no2x2Shaded = graph.makeReplicate(
  new Quad(graph.cells()[0], UNSHADED),
  graph.cells().filter(cell => graph.block(cell, 2, 2)));

// --- Rule (3): touching tetrominoes of adjacent regions differ in type ------
// Two shaded cells of different regions that share an edge means their two
// tetrominoes share an edge. Every shaded cell carries its own region's type,
// so the rule is: not both shaded with the same type. Pairs inside one region
// are excluded -- a region's own cells always carry the same type.
const differentTypeKey = Pair.fnToKey(
  (a, b) => a === UNSHADED || b === UNSHADED || a !== b, shape);

// One template per direction (right, down), replicated onto the cells whose
// neighbour that way lies in another region. Right and down together visit each
// adjacent pair exactly once.
const origin = graph.cells()[0];
const boundaryPairs = [[0, 1], [1, 0]].map(([dR, dC]) => graph.makeReplicate(
  new Pair(differentTypeKey, 'different tetromino type',
    origin, graph.step(origin, dR, dC)),
  graph.cells().filter(cell => {
    const n = graph.step(cell, dR, dC);
    return n && cellRegion.get(n) !== cellRegion.get(cell);
  })));

return [
  shape,
  ...regionShading,
  shadedConnected,
  no2x2Shaded,
  ...boundaryPairs,
];
