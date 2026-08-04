// Title: March 22, 2023: Clone Fortress
// Author: clover!
// Video: https://www.youtube.com/watch?v=t7hYdmUfG1U
// Source: https://tinyurl.com/3mpa28cm

// Rules: normal sudoku (rows/columns/boxes) plus two rules over the gray
// shaded cells:
// - Fortress: every gray cell's digit is greater than every orthogonally
//   adjacent white (non-gray) cell's digit.
// - Clone: gray regions (maximal orthogonally-connected gray groups) that
//   share the same size and shape hold identical digits at each
//   corresponding relative position.

const graph = cellGraph('9x9');

// Gray-shaded cells, transcribed from the puzzle's drawn cell shading.
const grayCells = [
  'R1C5', 'R1C6', 'R2C5', 'R2C6',
  'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C4', 'R5C2', 'R5C3', 'R5C4',
  'R5C6', 'R5C7', 'R5C8', 'R6C6', 'R6C8', 'R7C6', 'R7C7', 'R7C8',
  'R8C4', 'R8C5', 'R9C4', 'R9C5',
];
const graySet = new Set(grayCells);

// Fortress: one GreaterThan per gray/white orthogonal edge, derived from the
// shading above rather than hand-listed, so it can't drift from grayCells.
// GreaterThan(a, b) with exactly 2 cells enforces a > b for that one adjacent
// pair; passing the gray cell first each time keeps every edge oriented
// gray > white without also comparing gray-gray or white-white neighbours.
const fortressConstraints = [];
for (const g of grayCells) {
  for (const w of graph.neighbours(g)) {
    if (!graySet.has(w)) fortressConstraints.push(new GreaterThan(g, w));
  }
}

// Clone: flood-fill the gray cells into their connected regions, group
// regions by an orientation-fixed shape signature (offsets from the region's
// own top-left cell), and for every pair of same-shaped regions require the
// cell at each matching offset to hold the same digit. SameValues(2, a, b)
// with two singleton sets is exactly "a equals b"; using one call per
// matched offset (rather than one call over the whole region) is what keeps
// the pairing positional -- SameValues sorts each set's cells before
// comparing, so a single multi-cell call would only check that the two
// regions share a digit multiset, not that they match cell-for-cell.
const gridGeometry = graph.gridGeometry();
function parseRC(cell) {
  return gridGeometry.splitCellIndex(gridGeometry.parseCellId(cell).cellIndex);
}

const seen = new Set();
const components = [];
for (const start of grayCells) {
  if (seen.has(start)) continue;
  const stack = [start];
  seen.add(start);
  const comp = [];
  while (stack.length) {
    const cur = stack.pop();
    comp.push(cur);
    for (const n of graph.neighbours(cur)) {
      if (graySet.has(n) && !seen.has(n)) {
        seen.add(n);
        stack.push(n);
      }
    }
  }
  components.push(comp);
}

function shapeOf(comp) {
  const rc = comp.map(parseRC);
  const minR = Math.min(...rc.map(([r]) => r));
  const minC = Math.min(...rc.map(([, c]) => c));
  const offsets = rc.map(([r, c]) => [r - minR, c - minC])
    .sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return { minR, minC, offsets, key: offsets.map(o => o.join(',')).join(';') };
}

const shaped = components.map(shapeOf);
const groups = new Map();
for (const s of shaped) {
  if (!groups.has(s.key)) groups.set(s.key, []);
  groups.get(s.key).push(s);
}

const cloneConstraints = [];
for (const group of groups.values()) {
  // A region with no shape-twin carries no clone rule.
  if (group.length < 2) continue;
  const [ref, ...rest] = group;
  for (const other of rest) {
    for (const [dr, dc] of ref.offsets) {
      // gridGeometry.makeCellId takes the same 0-indexed row/col that
      // splitCellIndex (via parseRC above) produced.
      const a = gridGeometry.makeCellId(ref.minR + dr, ref.minC + dc);
      const b = gridGeometry.makeCellId(other.minR + dr, other.minC + dc);
      cloneConstraints.push(new SameValues(2, a, b));
    }
  }
}

return [
  new Shape('9x9'),
  new Given('R1C1', 8),
  new Given('R1C3', 2),
  new Given('R1C5', 6),
  new Given('R1C7', 1),
  new Given('R1C9', 5),
  new Given('R3C7', 7),
  new Given('R4C3', 7),
  new Given('R5C5', 5),
  new Given('R6C7', 3),
  new Given('R7C3', 6),
  new Given('R9C1', 2),
  new Given('R9C3', 3),
  new Given('R9C5', 8),
  new Given('R9C7', 6),
  new Given('R9C9', 1),
  ...fortressConstraints,
  ...cloneConstraints,
];
