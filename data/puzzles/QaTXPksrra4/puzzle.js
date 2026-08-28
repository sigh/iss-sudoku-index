// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=QaTXPksrra4
// Source: https://cracking-the-cryptic.web.app/sudoku/n774mt48GG

// Rules (the payload carries no rules text; these come from the video's
// description, which links this exact source URL):
// Normal Sudoku rules apply. The dots are the centres of rotationally-symmetric
// cell groups (called "galaxies"), whose digits sum to the number beside the
// dot. Digits may not repeat within a galaxy and galaxies may not overlap. Each
// row, column and 3x3 box contains exactly two digits (no more, no less) that
// are not part of any galaxy. Those digits that are not part of a galaxy are
// "lone stars", and may not touch other lone-star digits orthogonally or
// diagonally.
//
// Every cell is therefore either a lone star or in exactly one galaxy, which is
// what the VG overlay below records.
//
// Not encoded: neither the rules text nor the drawing requires a galaxy to be
// orthogonally connected, nor to contain the cell(s) its own dot sits on. Both
// hold in the Spiral Galaxies genre the video names, but nothing in the source
// states them, so the galaxies here are only required to be symmetric about
// their dot.

const shape = new Shape('9x9');
const graph = cellGraph('9x9');

// One label per grid cell: which galaxy owns it, or STAR for a lone star.
const label = graph.makeOverlay('VG');
const STAR = 9;

// Drawn data: one row per dot -- [anchor cell, halfRow, halfCol, printed sum].
// The dot sits at the anchor cell's centre, moved half a cell down when halfRow
// is 1 and half a cell right when halfCol is 1. So (0,0) is a dot drawn on a
// cell, (0,1) and (1,0) are dots on a cell edge, and (1,1) is a dot on a
// lattice corner. Read off the 20 white dots and the number printed beside
// each one.
const DOTS = [
  ['R1C6', 0, 0, 24],
  ['R1C2', 1, 1, 24],
  ['R1C9', 1, 0,  8],
  ['R2C5', 0, 0,  7],
  ['R2C7', 1, 1, 27],
  ['R3C1', 0, 1, 16],
  ['R3C5', 0, 0, 12],
  ['R4C2', 0, 1, 24],
  ['R4C8', 1, 0, 15],
  ['R5C2', 0, 0,  8],
  ['R5C5', 0, 0, 24],
  ['R5C9', 1, 0, 17],
  ['R6C2', 0, 0,  6],
  ['R7C4', 0, 0,  9],
  ['R7C5', 0, 1, 10],
  ['R7C8', 0, 0, 14],
  ['R7C7', 1, 0, 17],
  ['R8C2', 0, 0, 41],
  ['R8C9', 1, 0, 13],
  ['R9C5', 0, 1, 16],
];

// A half-turn about the dot maps R{r}C{c} to R{2*ar+halfRow-r}C{2*ac+halfCol-c}.
function rotate([anchor, halfRow, halfCol], cell) {
  const a = parseCellId(anchor);
  const p = parseCellId(cell);
  const row = 2 * a.row + halfRow - p.row;
  const col = 2 * a.col + halfCol - p.col;
  if (row < 1 || row > 9 || col < 1 || col > 9) return null;
  return makeCellId(row, col);
}

// A galaxy is closed under its own half-turn, so a cell whose image falls off
// the grid cannot be in it. That leaves each galaxy a candidate cell set.
const galaxies = DOTS.map(dot => {
  const cells = graph.cells().filter(cell => rotate(dot, cell) !== null);
  return { dot, sum: dot[3], cells, cellSet: new Set(cells) };
});

// Twenty galaxies do not fit in a 9-value overlay, but two galaxies with
// disjoint candidate sets can share a label value with no ambiguity: inside one
// galaxy's candidate cells, that value can only mean that galaxy. Greedily
// colour the "candidate sets intersect" graph, largest candidate set first.
const byWidestFirst = galaxies.map((g, i) => i).sort(
  (i, j) => galaxies[j].cells.length - galaxies[i].cells.length || i - j);
const colour = galaxies.map(() => 0);
for (const i of byWidestFirst) {
  const clash = new Set(byWidestFirst.filter(
    j => colour[j] && galaxies[j].cells.some(c => galaxies[i].cellSet.has(c)))
    .map(j => colour[j]));
  let c = 1;
  while (clash.has(c)) c++;
  colour[i] = c;
}
if (Math.max(...colour) >= STAR) throw new Error('galaxy labels exhausted');

// Each label cell may only name a galaxy that could reach it, or be a star.
const labelDomains = graph.cells().map(cell => new Given(
  label.at(cell),
  ...galaxies.flatMap((g, i) => g.cellSet.has(cell) ? [colour[i]] : []).sort(),
  STAR));

// Rotational symmetry: the two cells of a half-turn orbit are in the galaxy
// together or not at all. Keys are per label value, so cache them.
const symmetryKeys = new Map();
const symmetryKey = (value) => {
  if (!symmetryKeys.has(value)) {
    symmetryKeys.set(value, Pair.fnToKey(
      (a, b) => (a === value) === (b === value), shape));
  }
  return symmetryKeys.get(value);
};
const symmetry = galaxies.flatMap((g, i) => {
  const paired = new Set();
  return g.cells.flatMap(cell => {
    const other = rotate(g.dot, cell);
    if (other === cell || paired.has(cell)) return [];
    paired.add(cell);
    paired.add(other);
    return [new Pair(symmetryKey(colour[i]), 'galaxy symmetry',
                     label.at(cell), label.at(other))];
  });
});

// Sum and no-repeat for one galaxy, scanning its candidate cells as
// [label, digit, label, digit, ...]. State: the digits taken by this galaxy so
// far, plus which of the three reads comes next -- a label, a digit that this
// galaxy takes, or a digit belonging to some other galaxy or to a star. A
// branch dies as soon as a digit repeats or the running total passes the clue,
// so the state count stays near (subsets summing to at most the clue) x 3.
const galaxyMachine = (value, total) => NFA.encodeSpec({
  startState: { next: 'label', digits: [] },
  transition: ({ next, digits }, v) => {
    if (next === 'label') return { next: v === value ? 'take' : 'skip', digits };
    if (next === 'skip') return { next: 'label', digits };
    if (digits.includes(v)) return undefined;
    const taken = digits.concat([v]).sort((a, b) => a - b);
    if (taken.reduce((a, b) => a + b, 0) > total) return undefined;
    return { next: 'label', digits: taken };
  },
  accept: ({ next, digits }) =>
    next === 'label' && digits.reduce((a, b) => a + b, 0) === total,
}, shape);
const galaxyTotals = galaxies.map((g, i) => new NFA(
  galaxyMachine(colour[i], g.sum), `galaxy ${g.sum}`,
  ...g.cells.flatMap(cell => [label.at(cell), cell])));

// Exactly two lone stars per row, column and box.
const starCounts = graph.rowsColumnsBoxes().map(
  cells => new ContainExact(`${STAR}_${STAR}`, ...label.at(cells)));

// No two lone stars touch, orthogonally or diagonally. The four steps cover
// every king-move pair once; each is one template stamped over every position
// where the step stays on the grid.
const noTouchKey = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), shape);
const noTouch = [[0, 1], [1, -1], [1, 0], [1, 1]].map(([dR, dC]) => {
  // Anchor the template at the earlier cell of the pair in reading order, so
  // no target precedes the origin.
  const anchor = makeCellId(1, dC < 0 ? 1 - dC : 1);
  const partner = graph.step(anchor, dR, dC);
  const targets = graph.cells().filter(c => graph.step(c, dR, dC) !== null);
  return new Replicate(
    [new Pair(noTouchKey, 'lone stars do not touch',
              label.at(anchor), label.at(partner))],
    Replicate.encodeTargetCells(label.at(targets), label.at(anchor), label),
    label.at(anchor));
});

return [
  shape,
  label.toVar('galaxy of each cell'),
  ...labelDomains,
  ...symmetry,
  ...galaxyTotals,
  ...starCounts,
  ...noTouch,
];
