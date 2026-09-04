// Title: Zombie!
// Author: Shintaro Fushida-Hardy
// Video: https://www.youtube.com/watch?v=xyO6aLa1nz0
// Source: https://sudokupad.app/rn6u1h8v9k?setting-conflictchecker=0

// Rules encoded here:
//  * Yin-Yang: shade some cells so that all shaded cells are orthogonally
//    connected, all unshaded cells are orthogonally connected, and no 2x2 box
//    is entirely one shade.
//  * Araf: divide the grid into orthogonally connected regions, each holding
//    exactly two of the 22 printed number clues; a region's cell count is
//    strictly between its two clues.
//  * Interaction 1: within each region, the shaded cells are themselves one
//    connected group and the unshaded cells are themselves one connected
//    group (a per-region Yin-Yang).
//  * Interaction 2: each region's two clues take opposite shades (one shaded,
//    one unshaded).
//  * Interaction 3: one of a region's two clues equals the exact count of
//    shaded cells in that region (either clue may be the one that matches).
//
// Omitted: the app's answer-check convention ("enter the region's size, last
// digit only, in every unshaded cell with no printed clue") is not modelled.
// It is a digit-transcription of the partition/shading already enforced
// below, not additional solving content, and broadcasting a region's
// discovered size to every one of its cells (some regions run past 90 cells)
// has no construction that fits inside ISS's per-build cell budget on this
// 156-cell board. The main grid therefore only carries the five single-digit
// printed givens; every other cell is pinned to a filler value with no
// meaning of its own.

const GRID = '12x13';

// The 22 printed clue numbers, transcribed from the payload as [row, col,
// value]: R2C2/R2C3/R3C2/R3C3/R9C11 are real single-digit grid givens; the
// other 17 print 10 or more and are drawn as floating text overlays instead,
// since a cell given cannot exceed 9. Row/column go through makeCellId,
// never a hand-written "R#C#" literal, since this board's rows run past 9
// and cell ids beyond single digits are not decimal (R10 is "RaC...").
const CLUE_LIST = [
  [1, 11, 10], [1, 13, 99],
  [2, 2, 1], [2, 3, 1],
  [3, 2, 1], [3, 3, 1],
  [4, 9, 12],
  [5, 8, 12],
  [6, 7, 12], [6, 10, 15], [6, 11, 16], [6, 12, 17],
  [7, 6, 12],
  [8, 5, 12],
  [9, 10, 18], [9, 11, 5],
  [10, 1, 10],
  [11, 10, 20], [11, 11, 20], [11, 12, 20],
  [12, 1, 99], [12, 5, 18],
];
const CLUES = Object.fromEntries(
  CLUE_LIST.map(([r, c, v]) => [makeCellId(r, c), v]));

const graph = cellGraph(GRID);
const cells = graph.cells();
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);
const isClue = (cell) => CLUES[cell] !== undefined;

// Cells in reading order (row-major) carrying a clue, and their values in the
// same order.
const clueCells = cells.filter(isClue);
const clueValues = clueCells.map((c) => CLUES[c]);
const NUM_REGIONS = clueCells.length / 2; // 22 clues, two per region -> 11.
const labels = range(1, NUM_REGIONS);

// Distinct printed values: a region's shaded-count clue must be one of these,
// since it is always one of the two printed numbers in that region.
const DISTINCT_VALUES = [...new Set(clueValues)].sort((a, b) => a - b);

// Shape carries three auxiliary layers -- the region label (1..NUM_REGIONS),
// and the region label masked to each shade (0..NUM_REGIONS, 0 meaning "not
// this shade") -- so its value range is widened to 0-11 and every main-grid
// cell is pinned below; none of the puzzle's own logic lives on the main
// grid.
const shape = new Shape(GRID, '0-11', 'Raw');

const lb = graph.makeOverlay('VB'); // this cell's region label, 1..NUM_REGIONS
const yy = graph.makeOverlay('YY'); // YinYang's own shading group
const sr = graph.makeOverlay('VS'); // label if shaded, else 0
const ur = graph.makeOverlay('VU'); // label if unshaded, else 0

const SHADED = 0;
const UNSHADED = 1; // YinYang() uses the grid's two lowest values, in order.

// --- Main grid: no logic, just the five real givens plus a filler value ---
const singleDigitClueCells = clueCells.filter((c) => CLUES[c] <= 9);
const fillerCells = cells.filter((c) => !singleDigitClueCells.includes(c));
const mainGrid = [
  ...singleDigitClueCells.map((c) => new Given(c, CLUES[c])),
  graph.makeReplicate(new Given(fillerCells[0], 0), fillerCells),
];

// --- Region label: every cell takes a label 1..NUM_REGIONS ----------------
const labelDomain = lb.makeReplicate(new Given(lb.cells()[0], ...labels));

// Every region is one connected orthogonal area (the Araf partition itself).
const regionConnected = labels.map((l) => new ConnectedValues('VB', l));

// Exactly two clues carry each label (each region holds exactly two clues).
const twoCluesPerRegion = new ContainExact(
  labels.flatMap((l) => [l, l]).join('_'), ...lb.at(clueCells));

// Canonical label numbering: reading the clues in reading order, a label may
// only be introduced one higher than the highest seen so far (region k is
// the region whose first clue comes k-th). Breaks the label-permutation
// symmetry without touching which partition is chosen.
const labelOrder = new NFA(
  NFA.encodeSpec({
    startState: 0,
    transition: (highest, label) => (
      label <= highest ? highest
        : label === highest + 1 ? label
          : undefined),
    accept: (highest) => highest === NUM_REGIONS,
  }, shape),
  'labelOrder', ...lb.at(clueCells));

// A region's cell count sits strictly inside its own pair, so across the
// whole board it is bounded by the smallest and largest printed numbers.
const minSize = Math.min(...clueValues) + 1;
const maxSize = Math.max(...clueValues) - 1;
const sizes = range(minSize, maxSize);

// One disjunction per region tying its size to its pair of clues: in the
// branch where region `label` holds `size` cells, exactly one of its two
// clues (found anywhere on the board, since only a region's own two clues
// can satisfy this) prints less than `size` and exactly one prints more.
// Clues printing exactly `size` fall in neither list, and twoCluesPerRegion
// stops the region from taking a third clue to make up the gap.
const sizeInsidePair = labels.map((label) => new Or(
  sizes.map((size) => new And([
    new ContainExact(Array(size).fill(label).join('_'), ...lb.cells()),
    new ContainExact(String(label), ...lb.at(clueCells.filter(
      (c) => CLUES[c] < size))),
    new ContainExact(String(label), ...lb.at(clueCells.filter(
      (c) => CLUES[c] > size))),
  ]))));

// --- Shading: global Yin-Yang, plus a symmetry pin -------------------------
// The rules never anchor "shaded" to a physical cell, so the whole grid's
// shading can be swapped end to end and still satisfy every rule below.
// Pin one representative: the first clue in reading order is shaded.
const yinYang = new YinYang();
const shadeSwapPin = new Given(yy.at(clueCells[0]), SHADED);

// --- Region label combined with shade, split across two masked layers -----
// SR holds this cell's label when it is shaded, else 0; UR mirrors it for
// unshaded cells. Two Pair relations per cell pin each: one ties the masked
// value to LB (it may only be 0 or LB's own value), the other ties it to YY
// (it must be 0 exactly when the shade does not match); their intersection is
// always the single correct value, so together they make SR/UR a function of
// (LB, YY) with no extra state machine.
const labelOrZero = Pair.fnToKey((label, masked) => masked === 0 || masked === label, shape);
const shadedMatch = Pair.fnToKey(
  (shade, masked) => (shade === SHADED) === (masked !== 0), shape);
const unshadedMatch = Pair.fnToKey(
  (shade, masked) => (shade === UNSHADED) === (masked !== 0), shape);

const maskRules = cells.flatMap((cell) => [
  new Pair(labelOrZero, 'sr-label', lb.at(cell), sr.at(cell)),
  new Pair(shadedMatch, 'sr-shade', yy.at(cell), sr.at(cell)),
  new Pair(labelOrZero, 'ur-label', lb.at(cell), ur.at(cell)),
  new Pair(unshadedMatch, 'ur-shade', yy.at(cell), ur.at(cell)),
]);

// Interaction 1: within each region, the shaded cells are one connected group
// and the unshaded cells are one connected group. SR/UR are single-value,
// disjoint by construction (a cell can hold its label on at most one of the
// two layers), so one ConnectedValues per label per layer is exactly this.
const shadeConnected = labels.flatMap((l) => [
  new ConnectedValues('VS', l),
  new ConnectedValues('VU', l),
]);

// Interaction 2: each region's two clues take opposite shades. Among the 22
// clues, each label must appear exactly once on the SR layer -- the shaded
// one of that region's pair -- which (with twoCluesPerRegion already pinning
// two clues per label) forces the other clue of the pair to be unshaded.
const oneShadedClue = new ContainExact(
  labels.join('_'), ...sr.at(clueCells));

// Interaction 3: one of a region's two clues gives the exact shaded count.
// One disjunction per region over the finitely many candidate counts (a
// count is only ever checked against a printed clue value, so only the
// distinct printed values are live candidates): the branch fixes the
// region's shaded-cell total via SR, then requires that count to match one of
// the region's own two clues by the same "appears once among the clues"
// trick used for the size-and-pair rule above.
const shadedCountMatchesClue = labels.map((label) => new Or(
  DISTINCT_VALUES.map((count) => new And([
    new ContainExact(Array(count).fill(label).join('_'), ...sr.cells()),
    new ContainExact(String(label), ...lb.at(clueCells.filter(
      (c) => CLUES[c] === count))),
  ]))));

return [
  shape,
  ...mainGrid,
  lb.toVar('label'),
  sr.toVar('shadedLabel'),
  ur.toVar('unshadedLabel'),
  labelDomain,
  yinYang,
  shadeSwapPin,
  ...regionConnected,
  twoCluesPerRegion,
  labelOrder,
  ...sizeInsidePair,
  ...maskRules,
  ...shadeConnected,
  oneShadedClue,
  ...shadedCountMatchesClue,
];
