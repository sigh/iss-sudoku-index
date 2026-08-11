// Title: X-Sum Skyscrapers
// Author: GarlicBredFries
// Video: https://www.youtube.com/watch?v=MaZiUQsE428
// Source: https://app.crackingthecryptic.com/sudoku/9LGpLH299Q

// Normal sudoku rules (default 9x9 Shape: rows, columns and the nine 3x3
// boxes are all-different; the source's own regions confirm the default
// tiling).
//
// Two between lines (Between's own semantics: every non-bulb cell strictly
// between the two bulb cells' digits) share the same pair of bulb cells
// (R6C3, R6C6) but run via different arcs -- one over the top of the grid,
// one under the bottom -- so they are two independent constraints, each
// listing its own bulb cells first/last.
//
// 16 outside clues are each simultaneously an X-sum and a skyscraper count:
// printed value V equals the sum of the first X cells from that clue's edge,
// where X is the number of visible skyscrapers that same line would show
// from that edge under the ordinary skyscraper rule (visible = exceeds every
// earlier digit from that edge). Neither X nor which cells it covers is
// printed, so this is encoded as an explicit disjunction over every possible
// X (1-9): Skyscraper.fromCells(X, ...) pins that reading's visible count,
// Sum(V, ...) pins the matching prefix sum -- exactly one branch can hold
// for the actual grid.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Bulb-to-bulb cell paths, each starting and ending on its bulb cell.
// Derived by walking the source's drawn line paths ([row, col], 0-indexed,
// .5 at cell centres) as straight segments.
const topArc = [
  'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R4C6', 'R5C6', 'R6C6',
];
const bottomArc = [
  'R6C6', 'R7C6', 'R8C6', 'R9C6', 'R8C5', 'R7C4', 'R6C3',
];

const betweenLines = [
  new Between(...topArc),
  new Between(...bottomArc),
];

// [line id, direction (1 = from top/left, -1 = from bottom/right), printed
// value]. Transcribed from the source's outside-clue overlays.
const outsideClues = [
  ['C1', 1, 9],    // top, column 1
  ['C4', 1, 14],   // top, column 4
  ['C6', 1, 10],   // top, column 6
  ['C7', 1, 18],   // top, column 7
  ['C9', 1, 18],   // top, column 9
  ['C1', -1, 11],  // bottom, column 1
  ['C3', -1, 19],  // bottom, column 3
  ['C4', -1, 12],  // bottom, column 4
  ['C6', -1, 22],  // bottom, column 6
  ['C9', -1, 17],  // bottom, column 9
  ['R1', 1, 29],   // left, row 1
  ['R5', 1, 29],   // left, row 5
  ['R7', 1, 28],   // left, row 7
  ['R3', -1, 22],  // right, row 3
  ['R5', -1, 25],  // right, row 5
  ['R9', -1, 14],  // right, row 9
];

// The clue's own line, oriented from its own edge (near cell first).
function orientedLine([line, dir]) {
  const axis = line[0];
  const index = Number(line.slice(1));
  const cells = axis === 'C' ? graph.column(index) : graph.row(index);
  return dir === 1 ? cells : cells.slice().reverse();
}

// One clue: an Or over every possible visible-skyscraper-count X (1-9), each
// branch pinning both what that X means (Skyscraper) and the matching prefix
// sum (Sum over the first X cells from the clue's edge).
function xSumSkyscraper(clue) {
  const value = clue[2];
  const cells = orientedLine(clue);
  const branches = [];
  for (let x = 1; x <= 9; x++) {
    branches.push(new And([
      Skyscraper.fromCells(x, cells, geometry),
      new Sum(value, ...cells.slice(0, x)),
    ]));
  }
  return new Or(branches);
}

return [
  new Shape('9x9'),
  ...betweenLines,
  ...outsideClues.map(xSumSkyscraper),
];
