// Title: Yajisan Kazusan Sudoku
// Author: Madmahogany
// Video: https://www.youtube.com/watch?v=lyYB0Da90H4
// Source: https://cracking-the-cryptic.web.app/sudoku/LN2QP3L8rD

// Normal sudoku (default 3x3 boxes) plus a Yajisan-Kazusan shading: shade
// some cells so that no two shaded cells are orthogonally adjacent and every
// unshaded cell forms one connected area. 28 cells carry a drawn arrow; when
// an arrow's own cell is UNSHADED its digit must equal the SUM (not the
// count) of the digits of every shaded cell in the arrow's direction, read to
// the grid edge. When an arrow's own cell is shaded, its digit is
// unconstrained by the arrow.

const SHADED = 1;
const UNSHADED = 2;

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const shade = graph.makeOverlay('VS');
// Sum-of-shaded contribution per cell: the cell's own digit when shaded, 0
// when unshaded. Widened Shape range (0-9) admits the 0.
const contribution = graph.makeOverlay('VC');

// Restrict the playable grid back to ordinary sudoku digits; the widened
// Shape range exists only for the contribution overlay.
const gridDigitsOnly = graph.makeReplicate(
  new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

// Restrict the shade overlay to its two states.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// contribution == digit exactly when shaded (and 0 exactly when unshaded).
// Two pairwise facts pin this down jointly: (a) contribution is 0 iff the
// cell is unshaded; (b) contribution is either 0 or the cell's own digit.
// Together they force contribution == digit when shaded (from (a), it is
// nonzero; from (b), the only nonzero option is the digit) and
// contribution == 0 when unshaded (directly from (a)).
const isZeroIffUnshaded = Pair.fnToKey(
  (shadeVal, extra) => (shadeVal === UNSHADED) === (extra === 0), shape);
const isZeroOrDigit = Pair.fnToKey(
  (digit, extra) => extra === 0 || extra === digit, shape);
const contributionLinks = graph.cells().flatMap(cell => [
  new Pair(isZeroIffUnshaded, 'contribution zero iff unshaded',
    shade.at(cell), contribution.at(cell)),
  new Pair(isZeroOrDigit, 'contribution is 0 or own digit',
    cell, contribution.at(cell)),
]);

// No two orthogonally adjacent shaded cells: one template per edge
// orientation, replicated over every origin whose neighbour in that
// direction stays on the grid (columns 1-8 for the rightward template, rows
// 1-8 for the downward one -- a target past that would shift off-grid).
const notBothShaded = Pair.fnToKey(
  (a, b) => !(a === SHADED && b === SHADED), shape);
const rightEdgeOrigins = graph.rows().flatMap(row => row.slice(0, -1));
const downEdgeOrigins = graph.columns().flatMap(col => col.slice(0, -1));
const noAdjacentShaded = [
  shade.makeReplicate(
    new Pair(notBothShaded, 'not both shaded', shade.at('R1C1'), shade.at('R1C2')),
    shade.at(rightEdgeOrigins)),
  shade.makeReplicate(
    new Pair(notBothShaded, 'not both shaded', shade.at('R1C1'), shade.at('R2C1')),
    shade.at(downEdgeOrigins)),
];

// All unshaded cells form a single orthogonally-connected area. (Shaded
// cells cannot be adjacent to each other, so they need no connectivity
// constraint of their own -- ConnectedValues over SHADED would wrongly force
// every shaded cell into one region, i.e. at most one shaded cell total.)
const unshadedConnected = new ConnectedValues('VS', UNSHADED);

// Bulb cell and pointing direction, transcribed from the drawn arrow
// geometry (a short segment inside each cell pointing toward the edge it
// reads). One drawn entry renders nothing on the board and is omitted, not a
// decode gap.
const DIRECTIONS = {
  up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1],
};
const arrows = [
  ['R1C1', 'right'], ['R2C2', 'down'], ['R3C3', 'down'], ['R2C5', 'right'],
  ['R1C7', 'left'], ['R1C8', 'down'], ['R3C9', 'down'], ['R4C1', 'right'],
  ['R4C3', 'right'], ['R4C5', 'down'], ['R5C5', 'left'], ['R5C3', 'right'],
  ['R6C3', 'up'], ['R6C1', 'up'], ['R7C1', 'right'], ['R8C1', 'right'],
  ['R8C3', 'right'], ['R9C4', 'right'], ['R9C6', 'right'], ['R8C5', 'left'],
  ['R7C5', 'up'], ['R7C8', 'left'], ['R9C9', 'up'], ['R6C9', 'left'],
  ['R4C7', 'up'], ['R3C6', 'left'], ['R8C6', 'up'], ['R6C6', 'left'],
];

// Each arrow: either its own cell is shaded (no constraint on its digit), or
// it is unshaded and its digit equals the sum of the shaded cells' digits
// along the ray to the grid edge (the ray excludes the arrow's own cell).
const arrowClues = arrows.map(([cell, dir]) => {
  const [dRow, dCol] = DIRECTIONS[dir];
  const rayCells = graph.ray(cell, dRow, dCol).slice(1);
  return new Or([
    new Given(shade.at(cell), SHADED),
    new EqualSum([cell], contribution.at(rayCells)),
  ]);
});

return [
  shape,
  new Given('R1C2', 1), new Given('R1C4', 3), new Given('R1C5', 4),
  new Given('R1C6', 6), new Given('R1C9', 9),
  new Given('R2C1', 5), new Given('R2C7', 3), new Given('R2C8', 4),
  new Given('R2C9', 6),
  new Given('R4C1', 4), new Given('R4C9', 2),
  new Given('R5C1', 8), new Given('R5C5', 6), new Given('R5C9', 5),
  new Given('R6C1', 1), new Given('R6C2', 5), new Given('R6C9', 4),
  new Given('R8C1', 9), new Given('R8C2', 3), new Given('R8C3', 5),
  new Given('R8C9', 8),
  new Given('R9C1', 6), new Given('R9C4', 4), new Given('R9C5', 5),
  new Given('R9C6', 3), new Given('R9C8', 9),
  gridDigitsOnly,
  shade.toVar('shade'),
  contribution.toVar('contribution'),
  shadeDomain,
  ...contributionLinks,
  ...noAdjacentShaded,
  unshadedConnected,
  ...arrowClues,
];
