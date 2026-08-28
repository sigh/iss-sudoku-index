// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=1jTyPKpXDWw
// Source: https://cracking-the-cryptic.web.app/sudoku/BGT37D4Bj7

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
//
// Arrows: each of 20 marker cells carries a single elbow-shaped glyph drawn
// entirely inside that one cell -- one leg touching the midpoint of one cell
// edge (naming the adjacent "reference" cell across it), the other leg
// touching the midpoint of a second, perpendicular edge (naming a "target"
// direction out of the marker's own cell). The rules' own worked example
// (2 in a reference cell, 3 in the marker cell, places another 2 three
// cells away from the marker in the target direction) fixes the reading:
// the digit in the reference cell also appears N cells away from the
// marker's own cell in the target direction, where N is the digit in the
// marker's own cell. Encoded with ValueIndexing(referenceCell, markerCell,
// ...targetRayCellsInOrder) -- the control cell (marker) selects the
// 1-indexed ray cell that must equal the value cell (reference); the ray
// naturally stops at the grid edge, which is what caps the marker's own
// digit near a border.
//
// Marker geometry (edge each leg touches, resolved from the payload's
// wayPoints: the glyph's two end-waypoints each sit on a border shared with
// one neighbour, and the middle waypoint sits at the marker cell's own
// centre) transcribed below as [markerCell, referenceDir, targetDir].
//
// Grey cells: the 16 grey 1x1 underlays from the puzzle's source payload
// (a ring: the border of the central 5x5 block) cannot hold 7, 8 or 9.

const DIRS = {
  N: [-1, 0],
  S: [1, 0],
  E: [0, 1],
  W: [0, -1],
};

// Step from a cell one unit in a direction; returns null if off-grid.
function step(cell, dir) {
  const { row, col } = parseCellId(cell);
  const [dr, dc] = DIRS[dir];
  const r = row + dr, c = col + dc;
  if (r < 1 || r > 9 || c < 1 || c > 9) return null;
  return makeCellId(r, c);
}

// Ray of cells leaving `origin` in `dir`, starting one step away, out to the
// edge of the grid.
function ray(origin, dir) {
  const cells = [];
  let cur = origin;
  for (;;) {
    cur = step(cur, dir);
    if (cur === null) break;
    cells.push(cur);
  }
  return cells;
}

// [markerCell, referenceDir, targetDir], transcribed from each marker's
// two-legged elbow glyph.
const ARROWS = [
  ['R1C3', 'W', 'S'],
  ['R2C2', 'S', 'E'],
  ['R3C1', 'N', 'E'],
  ['R3C2', 'S', 'E'],
  ['R2C5', 'W', 'S'],
  ['R1C7', 'W', 'S'],
  ['R2C7', 'W', 'S'],
  ['R1C8', 'W', 'S'],
  ['R2C9', 'S', 'W'],
  ['R3C9', 'N', 'W'],
  ['R4C9', 'N', 'W'],
  ['R4C6', 'W', 'S'],
  ['R7C9', 'N', 'W'],
  ['R7C8', 'N', 'W'],
  ['R8C8', 'W', 'N'],
  ['R9C7', 'W', 'N'],
  ['R9C3', 'E', 'N'],
  ['R8C3', 'E', 'N'],
  ['R7C1', 'S', 'E'],
  ['R6C1', 'S', 'E'],
];

const arrowIndexers = ARROWS.map(([marker, refDir, tgtDir]) => {
  const reference = step(marker, refDir);
  const targetRay = ray(marker, tgtDir);
  return new ValueIndexing(reference, marker, ...targetRay);
});

// Grey ring: the border of the central 5x5 block (rows/cols 3-7), minus its
// own interior -- from the payload's 16 grey 1x1 underlays.
const GREY_CELLS = [
  'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7',
  'R4C7', 'R5C7', 'R6C7', 'R7C7',
  'R7C6', 'R7C5', 'R7C4', 'R7C3',
  'R6C3', 'R5C3', 'R4C3',
];
const greyRestrictions = GREY_CELLS.map(
  cell => new Given(cell, 1, 2, 3, 4, 5, 6));

return [
  new Shape('9x9'),
  ...arrowIndexers,
  ...greyRestrictions,
];
