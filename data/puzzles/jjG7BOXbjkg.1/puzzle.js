// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=jjG7BOXbjkg
// Source: https://cracking-the-cryptic.web.app/sudoku/Qnjrdrg4fd

// NANRO (SIGNPOST), 6x6. Label some cells with numbers so that:
//  - every bold region contains at least one labelled cell;
//  - all labels within a region are the same number, and that number equals
//    the count of labelled cells in the region;
//  - the small number drawn in a region's top-left corner (its signpost) is
//    that region's label; one region carries no signpost;
//  - two labelled cells that share an edge and lie in different regions hold
//    different numbers;
//  - all labelled cells form a single orthogonally connected group;
//  - no 2x2 block of cells is entirely labelled.
// There are no sudoku rules: a row or column may repeat a label freely, so the
// board is a Raw grid. A cell's value is 0 when it is unlabelled and its label
// otherwise; labels run 1..6 because 6 is the largest region size.

const shape = new Shape('6x6', '0-6', 'Raw');
const graph = cellGraph(shape);
const at = (rc) => makeCellId(...rc);
const EMPTY = 0;

// Read off the drawn region borders and the seven small corner numbers;
// `signpost: null` is the one region with no number drawn in its corner.
const REGIONS = [
  { signpost: 4, cells: [[1, 1], [1, 2], [2, 1], [2, 2], [3, 1], [4, 1]] },
  { signpost: 2, cells: [[1, 3], [1, 4], [2, 3], [2, 4]] },
  { signpost: null, cells: [[1, 5], [1, 6], [2, 5], [2, 6]] },
  { signpost: 3, cells: [[3, 2], [3, 3], [4, 2], [4, 3]] },
  { signpost: 3, cells: [[3, 4], [3, 5], [4, 4], [4, 5]] },
  { signpost: 3, cells: [[3, 6], [4, 6], [5, 5], [5, 6], [6, 5], [6, 6]] },
  { signpost: 1, cells: [[5, 1], [5, 2], [6, 1], [6, 2]] },
  { signpost: 2, cells: [[5, 3], [5, 4], [6, 3], [6, 4]] },
].map(({ signpost, cells }) => ({ signpost, cells: cells.map(at) }));

// A region whose label is n: each of its cells is empty or n, and exactly n of
// them hold n. Together these say "all labels equal, and equal to the count",
// and n >= 1 gives the region its at-least-one labelled cell.
const labelledWith = (n, cells) => [
  ...cells.map(cell => new Given(cell, EMPTY, n)),
  new ContainExact(Array(n).fill(n).join('_'), ...cells),
];

const regionRules = REGIONS.flatMap(({ signpost, cells }) =>
  signpost !== null
    ? labelledWith(signpost, cells)
    // Unsignposted region: its label is unknown, so disjoin over every count
    // its size allows.
    : [new Or(cells.map((_, i) => new And(labelledWith(i + 1, cells))))]);

const regionOf = new Map(
  REGIONS.flatMap(({ cells }, i) => cells.map(cell => [cell, i])));

// True unless both cells are labelled with the same number; equal empties are
// not two equal labels.
const differentLabelKey = Pair.fnToKey((a, b) => a !== b || a === EMPTY, shape);
const regionBorders = graph.cells().flatMap(
  cell => [graph.step(cell, 0, 1), graph.step(cell, 1, 0)]
    .filter(other => other !== null && regionOf.get(other) !== regionOf.get(cell))
    .map(other => new Pair(differentLabelKey, 'region border', cell, other)));

// Every 2x2 block, named by its top-left cell, must contain an empty cell.
const noFullBlocks = graph.cells()
  .filter(cell => graph.step(cell, 1, 1) !== null)
  .map(cell => new Quad(cell, EMPTY));

// The labelled cells -- every value other than EMPTY -- are one connected area.
const connected = new ConnectedValues('', [1, 2, 3, 4, 5, 6]);

return [shape, ...regionRules, ...regionBorders, ...noFullBlocks, connected];
