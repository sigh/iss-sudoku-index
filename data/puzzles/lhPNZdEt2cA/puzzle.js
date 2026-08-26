// Title: Another Lost Toy
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=lhPNZdEt2cA
// Source: https://tinyurl.com/4ehptt9t

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
//
// Circles: the listed digits each appear at least once among the four
// surrounding cells -> Quad(topLeftCell, ...values). Five circles, from the
// payload's overlay corners (row/col resolved to the box's top-left cell).
//
// Arrows: a bent marker in one cell -- a stub touching one cell edge (names
// an adjacent "reference" cell) plus a chevron pointing a second "target"
// direction. The rules' own worked example (marker at R3C4, stub touching
// the bottom edge so reference = R4C4, chevron west, marker digit 3 =>
// digit(R3C1) == digit(R4C4)) fixes the reading: the marker's own digit N
// says how many cells out the chevron direction to find a cell that must
// equal the reference cell's digit. Encoded with
// ValueIndexing(referenceCell, markerCell, ...targetRayCellsInOrder) -- the
// control cell (marker) selects the 1-indexed ray cell that must equal the
// value cell (reference). Not every marker is necessarily drawn, so no
// negative constraint over unmarked cells. Stub edge and chevron direction
// transcribed from the source drawing's two-part glyph (an L-shaped
// tail/stub plus a separate arrowhead chevron) at each marker cell.

const quads = [
  new Quad('R3C1', 1, 2, 3, 4),
  new Quad('R1C5', 6, 2, 7, 4),
  new Quad('R2C8', 3, 8, 6, 7),
  new Quad('R7C1', 6, 7),
  new Quad('R8C5', 4, 9),
];

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

// [markerCell, stubDirection, chevronDirection], transcribed from each
// marker's stub edge and chevron glyph.
const ARROWS = [
  ['R1C2', 'E', 'S'],
  ['R1C4', 'S', 'E'],
  ['R1C7', 'S', 'W'],
  ['R2C4', 'W', 'N'],
  ['R2C8', 'N', 'W'],
  ['R3C3', 'S', 'W'],
  ['R3C4', 'S', 'W'],
  ['R7C5', 'E', 'N'],
  ['R7C7', 'S', 'W'],
  ['R8C2', 'N', 'E'],
  ['R8C7', 'S', 'W'],
  ['R9C1', 'E', 'N'],
  ['R9C3', 'E', 'N'],
];

const arrowIndexers = ARROWS.map(([marker, refDir, tgtDir]) => {
  const reference = step(marker, refDir);
  const targetRay = ray(marker, tgtDir);
  return new ValueIndexing(reference, marker, ...targetRay);
});

return [
  new Shape('9x9'),
  ...quads,
  ...arrowIndexers,
];
