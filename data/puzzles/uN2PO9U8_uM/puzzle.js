// Title: Assigned Seating
// Author: ChinStrap
// Video: https://www.youtube.com/watch?v=uN2PO9U8_uM
// Source: https://sudokupad.app/unrk3m4tg3

// Normal sudoku rules apply.
//
// Yin Yang: shade every cell dark or light; each color forms one orthogonally
// connected region, and every 2x2 block contains both colors.
//
// Index Lines: on an index line of length n, the digit at the Nth cell along
// the line (starting from the diamond) gives the position along the line
// where digit N sits. Equivalently, for positions i, j on the line:
// cell(i) == j iff cell(j) == i, and every line digit is therefore in 1..n
// (a digit that named no in-range position could not be a valid answer to
// "where does digit N sit").
//
// Index Line Coloring: a line cell is dark exactly when it is self
// referencing (its digit equals its own position); otherwise light.
//
// Yin Yang White Kropki Dots: a white dot's two digits are consecutive and
// share a color. The rules note that not every consecutive/same-color pair
// is necessarily dotted, so undotted pairs are left unconstrained (no
// negative Kropki reading).

const DARK = 1;
const LIGHT = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

// Index line cells in line order (position 1 = the diamond), read off the
// drawn line paths (waypoints interpolated cell-by-cell).
const indexLines = [
  ['R9C1', 'R8C1', 'R8C2', 'R9C2'],
  ['R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9'],
  ['R7C9', 'R7C8', 'R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R7C3', 'R7C4'],
  ['R5C4', 'R4C4', 'R3C4', 'R2C4', 'R2C5', 'R3C5'],
  ['R6C7', 'R7C7', 'R7C6', 'R6C6', 'R5C6', 'R5C7', 'R4C7', 'R4C8', 'R5C8'],
];

// White dot edges, read off the drawn dot overlay positions.
const whiteDots = [
  ['R5C5', 'R6C5'],
  ['R2C7', 'R2C8'],
  ['R7C2', 'R7C3'],
  ['R5C3', 'R6C3'],
  ['R3C1', 'R3C2'],
];

// One index line's constraints: a domain restriction to 1..n (skipped when
// n already spans the full digit range), a pairwise involution over every
// position pair (cell(i) == j iff cell(j) == i), and a self-reference link
// from each cell's digit to its own shade Var (dark iff digit == position).
function indexLineConstraints(cells) {
  const n = cells.length;

  const domainGivens = n < geometry.numValues
    ? cells.map(cell =>
      new Given(cell, ...Array.from({ length: n }, (_, k) => k + 1)))
    : [];

  const involution = [];
  for (let i = 1; i <= n; i++) {
    for (let j = i + 1; j <= n; j++) {
      const key = Pair.fnToKey((a, b) => (a === j) === (b === i), geometry);
      involution.push(
        new Pair(key, 'index-line involution', cells[i - 1], cells[j - 1]));
    }
  }

  const coloring = cells.map((cell, idx) => {
    const i = idx + 1;
    const key = Pair.fnToKey((digit, s) => (digit === i) === (s === DARK), geometry);
    return new Pair(key, 'index-line self-reference', cell, shade.at(cell));
  });

  return [...domainGivens, ...involution, ...coloring];
}

const indexLineRules = indexLines.flatMap(cells => indexLineConstraints(cells));

const dotRules = whiteDots.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new SameValues(2, shade.at(a), shade.at(b)),
]);

return [
  new Shape('9x9'),
  new YinYang(),
  ...dotRules,
  ...indexLineRules,
];
