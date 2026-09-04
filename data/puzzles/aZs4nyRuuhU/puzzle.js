// Title: Aqraf
// Author: CJK
// Video: https://www.youtube.com/watch?v=aZs4nyRuuhU
// Source: https://app.crackingthecryptic.com/sudoku/7QN6Nr4tLq

// Aqraf ("Aqre" + "Araf"). Divide the grid into regions of orthogonally
// connected cells so that every cell lies in exactly one region. Each region
// contains exactly two of the ten circled numbers, and the number of cells in
// a region is strictly greater than the smaller of its two numbers and
// strictly less than the larger (the Araf half; the source's own wording only
// says "a size that lies between the two numbers", but the strict reading is
// this genre's standing convention -- see I_7KGPqz99Q and M3oVi4cBRxE). No
// region may contain a run of more than three consecutive cells,
// horizontally or vertically, within a single row or column (the Aqre half).
//
// Nothing is written into the cells: the answer is the partition itself. The
// board is a Raw 9x9 -- no row, column or box rule -- whose value range is
// widened to 5, a cell's value being the label of the region it belongs to.
// Ten circles at two per region make exactly five regions, so five labels
// suffice.

// The ten drawn circles, in reading order: [row, column, printed number].
const CLUES = [
  [1, 3, 6],
  [3, 1, 1],
  [4, 3, 1], [4, 5, 1], [4, 8, 30],
  [6, 1, 99],
  [7, 9, 99],
  [9, 1, 1], [9, 4, 99], [9, 7, 1],
];

const NUM_REGIONS = CLUES.length / 2;
const shape = new Shape('9x9', NUM_REGIONS, 'Raw');
const graph = cellGraph(shape);
const allCells = graph.cells();
const clueCells = CLUES.map(([r, c]) => makeCellId(r, c));
const clueValues = CLUES.map(([, , v]) => v);
const labels = Array.from({ length: NUM_REGIONS }, (_, i) => i + 1);

// A region's cell count sits strictly inside its own pair, so across the
// whole board it is bounded by the smallest and largest printed numbers. It
// is also bounded by the board itself: the partition covers all 81 cells,
// and every other region needs at least 2 cells to hold its own two distinct
// circled cells, so one region can take at most 81 - 2*(NUM_REGIONS - 1).
const minSize = Math.min(...clueValues) + 1;
const maxSize = Math.min(
  Math.max(...clueValues) - 1,
  allCells.length - 2 * (NUM_REGIONS - 1));
const sizes = Array.from(
  { length: maxSize - minSize + 1 }, (_, i) => minSize + i);

// Every circle lies in some region and every region takes two of them.
const twoCirclesPerRegion = new ContainExact(
  labels.flatMap(label => [label, label]).join('_'), ...clueCells);

// The cells of one region are one orthogonally connected area.
const connected = labels.map(label => new ConnectedValues('', label));

// Size and pair together, one disjunction per region: in the branch where
// region `label` has `size` cells, exactly one of its two circles prints less
// than `size` and exactly one prints more. Circles printing exactly `size` are
// left out of both lists, and twoCirclesPerRegion stops the region taking one
// as a third circle.
const sizeInsidePair = labels.map(label => new Or(
  sizes.map(size => new And([
    new ContainExact(Array(size).fill(label).join('_'), ...allCells),
    new ContainExact(String(label), ...clueCells.filter(
      (_, i) => clueValues[i] < size)),
    new ContainExact(String(label), ...clueCells.filter(
      (_, i) => clueValues[i] > size)),
  ]))));

// Region labels carry no meaning of their own, so any permutation of them
// describes the same partition. This machine pins one representative: reading
// the circles in reading order, a label may only be introduced one higher
// than the highest seen so far, so region k is the region whose first circle
// comes k-th.
const labelOrder = new NFA(
  NFA.encodeSpec({
    startState: 0,
    transition: (highest, label) => (
      label <= highest ? highest
        : label === highest + 1 ? label
          : undefined),
    accept: (highest) => highest === NUM_REGIONS,
  }, shape),
  'labelOrder', ...clueCells);

// No run of more than three consecutive cells of one region, in any row or
// column (Aqre): an NFA tracking the length of the current same-label run,
// rejecting on a fourth repeat.
const runLengthMachine = NFA.encodeSpec({
  startState: { prev: null, run: 0 },
  transition: ({ prev, run }, value) => {
    const nextRun = value === prev ? run + 1 : 1;
    if (nextRun > 3) return undefined;
    return { prev: value, run: nextRun };
  },
  accept: () => true,
}, shape);
const noLongRuns = [...graph.rows(), ...graph.columns()].map(
  (line, i) => new NFA(runLengthMachine, `no-long-run-${i}`, ...line));

return [
  shape,
  twoCirclesPerRegion,
  labelOrder,
  ...connected,
  ...sizeInsidePair,
  ...noLongRuns,
];
