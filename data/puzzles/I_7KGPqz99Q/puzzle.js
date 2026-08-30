// Title: Araf
// Author: Murat Can Tonta
// Video: https://www.youtube.com/watch?v=I_7KGPqz99Q
// Source: https://cracking-the-cryptic.web.app/sudoku/pJQdGGb3bb

// Araf. Divide the 10x10 grid along the cell borders so that every cell lies in
// exactly one region. Each region contains exactly two of the 32 circled
// numbers, and the number of cells in a region is strictly greater than the
// smaller of its two numbers and strictly less than the larger.
//
// Nothing is written into the cells: the answer is the partition itself. So the
// board is a Raw 10x10 -- no row, column or box rule -- whose value range is
// widened to 16, and a cell's value is the label of the region it belongs to.
// 32 circles at two per region make exactly 16 regions, so 16 labels suffice.

// The 32 drawn circles, in reading order: [row, column, printed number].
const CLUES = [
  [1, 3, 4], [1, 5, 4], [1, 6, 5], [1, 8, 2],
  [2, 3, 12], [2, 8, 6],
  [3, 1, 13], [3, 2, 1], [3, 9, 14], [3, 10, 5],
  [4, 5, 5], [4, 6, 9],
  [5, 1, 2], [5, 4, 11], [5, 7, 7], [5, 10, 2],
  [6, 1, 5], [6, 4, 3], [6, 7, 8], [6, 10, 4],
  [7, 5, 10], [7, 6, 1],
  [8, 1, 3], [8, 2, 2], [8, 9, 4], [8, 10, 4],
  [9, 3, 5], [9, 8, 2],
  [10, 3, 5], [10, 5, 2], [10, 6, 1], [10, 8, 3],
];

const NUM_REGIONS = CLUES.length / 2;
const shape = new Shape('10x10', NUM_REGIONS, 'Raw');
const allCells = cellGraph(shape).rows().flat();
const clueCells = CLUES.map(([r, c]) => makeCellId(r, c));
const clueValues = CLUES.map(([, , v]) => v);
const labels = Array.from({ length: NUM_REGIONS }, (_, i) => i + 1);

// A region's cell count sits strictly inside its own pair, so across the whole
// board it is bounded by the smallest and largest printed numbers.
const minSize = Math.min(...clueValues) + 1;
const maxSize = Math.max(...clueValues) - 1;
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
// as a third circle. ConnectedValues stays outside the disjunction; only the
// cell count is branched on.
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
// the circles in reading order, a label may only be introduced one higher than
// the highest seen so far, so region k is the region whose first circle comes
// k-th. The state is that highest label; the final state must be NUM_REGIONS,
// which is also every label being used.
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

return [
  shape,
  twoCirclesPerRegion,
  labelOrder,
  ...connected,
  ...sizeInsidePair,
];
