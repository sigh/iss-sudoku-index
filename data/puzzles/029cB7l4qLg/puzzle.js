// Title: Shade Some More Sum Lines
// Author: Xendari
// Video: https://www.youtube.com/watch?v=029cB7l4qLg
// Source: https://app.crackingthecryptic.com/sudoku/QgtR8b9Mr2

// Rules encoded here, in full:
//  * Normal sudoku.
//  * Some cells are shaded; all shaded cells are orthogonally connected.
//  * Within each 3x3 box, every separate orthogonally connected group of
//    shaded cells sums to N, and N is the same for every box.
//  * A circled cell may be shaded or unshaded; its digit is the number of
//    shaded cells in its own 3x3 box.
//  * A squared cell is shaded; its digit is the number of shaded cells seen
//    from it along its row and its column combined, itself included once,
//    with unshaded cells blocking sight.
//  * A diamond cell is unshaded; its digit is the size of the orthogonally
//    connected group of unshaded cells containing it.
//
// Nothing is omitted.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Drawn badges, transcribed from the source's underlay and line art: round
// white underlays are circles, square white underlays are squares, and each
// closed four-point line path through one cell's edge midpoints is a diamond.
// R9C2 carries both a circle and a diamond, and R9C9 both a circle and a
// square; in each the two badges are separate marks drawn concentrically,
// the smaller circle inside the larger badge, so both rules apply there.
const CIRCLES = ['R2C1', 'R3C8', 'R4C4', 'R5C2', 'R5C7', 'R9C2', 'R9C4', 'R9C9'];
const SQUARES = ['R3C7', 'R7C2', 'R9C9'];
const DIAMONDS = ['R2C6', 'R4C5', 'R4C9', 'R9C2'];

// Every shade Var holds one of the two shading states.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

const squaresShaded = SQUARES.map(c => new Given(shade.at(c), SHADED));
const diamondsUnshaded = DIAMONDS.map(c => new Given(shade.at(c), UNSHADED));

const boxes = graph.boxes();
const boxOf = (cell) => boxes.find(box => box.includes(cell));

// A box holds k shaded cells exactly when its nine shade Vars total 18 - k,
// so the circled cell's own digit plus that total is 18.
const circleCounts = CIRCLES.map(
  cell => new Sum(18, ...shade.at(boxOf(cell)), cell));

// N is carried by two Var cells as N = 9*(VN1 - 1) + VN2. That reaches a
// box group's largest possible sum (45) with exactly one representation per
// value, so the split adds no extra solutions of its own.
const nVar = new Var('N', 'shared group sum', 2);
const [nHigh, nLow] = nVar.cells();
const nHighDomain = new Given(nHigh, 1, 2, 3, 4, 5);
const groupSum = (cells) => new Sum(-9, ...cells, [nHigh, -9], [nLow, -1]);

// One disjunction per connected cell set C inside a box, standing for the
// implication: if every cell of C is shaded and every in-box neighbour of C
// is unshaded -- that is, if C is exactly one of the box's groups -- then C
// sums to N. Each box's groups are always sets of this form, so the 218
// connected sets per box cover the rule. Enumerated, not hand-listed. The
// two negative alternatives are `ContainAtLeast` rather than a Given per
// cell: one handler over the whole set instead of nine.
const boxGroupSums = boxes.flatMap((box) => {
  const subsets = [];
  for (let mask = 1; mask < (1 << box.length); mask++) {
    const cells = box.filter((_, i) => (mask >> i) & 1);
    if (!graph.connected(cells)) continue;
    const member = new Set(cells);
    const rim = box.filter(
      c => !member.has(c) && graph.neighbours(c).some(n => member.has(n)));
    subsets.push(new Or([
      new ContainAtLeast(String(UNSHADED), ...shade.at(cells)),
      ...(rim.length
        ? [new ContainAtLeast(String(SHADED), ...shade.at(rim))] : []),
      groupSum(cells),
    ]));
  }
  return subsets;
});

// A square's sight count is 1 plus the four run lengths leading away from it.
// Each run length gets its own Var, holding length + 1 because Var values
// start at 1; a run of n is pinned exact by shading its n cells and unshading
// the cell just past it, which is absent when the run reaches the grid edge.
const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];
const runVar = new Var(
  'R', 'square sight runs', `${SQUARES.length}x${DIRECTIONS.length}`);
const runCell = (i, j) => runVar.cell(i + 1, j + 1);

const sightRuns = SQUARES.flatMap((cell, i) => DIRECTIONS.map(([dr, dc], j) => {
  const beyond = graph.ray(cell, dr, dc).slice(1);
  const lengths = Array.from({ length: beyond.length + 1 }, (_, n) => n);
  return new Or(lengths.map(n => new And([
    new Given(runCell(i, j), n + 1),
    ...beyond.slice(0, n).map(c => new Given(shade.at(c), SHADED)),
    ...(n < beyond.length ? [new Given(shade.at(beyond[n]), UNSHADED)] : []),
  ])));
}));

const sightCounts = SQUARES.map((cell, i) => new Sum(
  -3, cell, ...DIRECTIONS.map((_, j) => [runCell(i, j), -1])));

// One membership layer per diamond, marking the unshaded group that diamond
// belongs to. Each IN cell is unshaded, and each unshaded neighbour of an IN
// cell is itself IN, so the IN set is closed under unshaded neighbours; with
// its cells connected and the diamond pinned IN, the IN set is exactly the
// diamond's unshaded group, and 162 minus the layer total is its size.
const IN = 1;
const OUT = 2;
const DIAMOND_PREFIXES = ['VD', 'VE', 'VF', 'VG'];

const diamondGroups = DIAMONDS.flatMap((cell, i) => {
  const prefix = DIAMOND_PREFIXES[i];
  const layer = graph.makeOverlay(prefix);
  return [
    layer.toVar('unshaded group at ' + cell),
    layer.makeReplicate(new Given(layer.cells()[0], IN, OUT)),
    new Given(layer.at(cell), IN),
    ...graph.cells().map(c => new Or([
      new Given(layer.at(c), OUT),
      new Given(shade.at(c), UNSHADED),
    ])),
    ...graph.cells().flatMap(a => graph.neighbours(a).map(b => new Or([
      new Given(layer.at(a), OUT),
      new Given(layer.at(b), IN),
      new Given(shade.at(b), SHADED),
    ]))),
    new ConnectedValues(prefix, IN),
    new Sum(162, ...layer.cells(), cell),
  ];
});

return [
  new Shape('9x9'),
  new Given('R3C3', 7),
  new Given('R5C7', 2),
  new Given('R7C6', 5),
  new Given('R9C4', 2),
  new Given('R9C9', 5),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  ...squaresShaded,
  ...diamondsUnshaded,
  ...circleCounts,
  nVar,
  nHighDomain,
  ...boxGroupSums,
  runVar,
  ...sightRuns,
  ...sightCounts,
  ...diamondGroups,
];
