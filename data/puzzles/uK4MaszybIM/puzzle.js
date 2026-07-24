// Title: Spotlight Fracture
// Author: Claude Opus 4.6
// Video: https://www.youtube.com/watch?v=uK4MaszybIM
// Source: https://sudokupad.app/4awj1whza3
//
// Normal 6x6 sudoku rules (rows/columns), no given digits. Chaos
// Construction: the grid divides into 6 orthogonally-connected 6-cell
// regions, each holding 1-6 once, and no region may contain a 2x2 block
// of cells. Spotlight ("s") cells: the cell's digit equals the number of
// its orthogonal neighbours that share its own region (self excluded).
// Kropki dots: a white dot means the two cells are consecutive; a black
// dot means one is exactly double the other -- only the marked pairs are
// constrained. Row diversity: exactly 2 distinct regions have a cell in
// row 1.
//
// Encoding notes: ChaosConstruction is the native ISS handler for the
// unknown regions (region size = numValues = 6 automatically). The
// no-2x2-block rule and the row-diversity count both reduce to "count the
// distinct region labels over an explicit cell set", so both use
// CountDistinct against an aux Var control cell whose domain is restricted
// to the values that satisfy the rule (2-4 distinct regions per 2x2 block;
// exactly 2 distinct regions across row 1). The spotlight rule reduces to
// ChaosCount with offset=1 (exclude the reference cell from the count),
// listing the cell's own region label first as the reference, then its
// orthogonal neighbours' region labels.

const graph = cellGraph('6x6');
const cc = graph.makeOverlay('CC');

const base = [
  new Shape('6x6'),
  new NoBoxes(),
  new ChaosConstruction(),
];

// --- Kropki dots (only the drawn pairs; see header note). ---
const WHITE_DOTS = [
  ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R2C2', 'R1C2'], ['R1C5', 'R1C4'],
  ['R2C3', 'R2C4'], ['R3C2', 'R3C3'], ['R2C3', 'R3C3'], ['R2C4', 'R3C4'],
  ['R2C5', 'R3C5'], ['R6C3', 'R5C3'], ['R6C4', 'R5C4'], ['R6C5', 'R5C5'],
  ['R3C1', 'R2C1'], ['R4C6', 'R3C6'], ['R4C1', 'R4C2'], ['R4C2', 'R5C2'],
  ['R6C3', 'R6C2'], ['R6C4', 'R6C3'], ['R6C6', 'R6C5'], ['R5C1', 'R6C1'],
];
const BLACK_DOTS = [
  ['R1C1', 'R2C1'], ['R3C3', 'R3C4'], ['R3C5', 'R4C5'], ['R3C2', 'R4C2'],
  ['R5C6', 'R6C6'],
];
const dots = [
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
];

// --- Spotlight cells: digit == count of orthogonal same-region
// neighbours, excluding the cell itself. ---
const SPOTLIGHT_CELLS = [
  'R1C4', 'R1C6', 'R2C5', 'R3C5', 'R2C1',
  'R4C4', 'R3C3', 'R5C2', 'R6C2', 'R6C3',
];
const spotlights = SPOTLIGHT_CELLS.map(cell =>
  new ChaosCount(cell, 1, cc.at(cell), ...cc.at(graph.neighbours(cell))));

// --- No region may contain a 2x2 block: every 2x2 window must show at
// least 2 distinct region labels among its 4 cells (1 would mean all four
// share one region). One aux control cell per window, restricted to
// {2,3,4}, tied to the window's distinct-region count.
const BLOCK_TOPS = [];
for (let r = 1; r <= 5; r++) for (let c = 1; c <= 5; c++) BLOCK_TOPS.push([r, c]);
const blockCount = new Var('B', 'block-distinct-regions', BLOCK_TOPS.length);
const blocks = BLOCK_TOPS.flatMap(([r, c], i) => {
  const control = blockCount.cell(i + 1);
  const cells = graph.block(makeCellId(r, c), 2, 2);
  return [
    new Given(control, 2, 3, 4),
    new CountDistinct(control, ...cc.at(cells)),
  ];
});

// --- Row diversity: exactly 2 distinct regions touch row 1. ---
const rowDiversityCount = new Var('RD', 'row1-distinct-regions', 1);
const rowDiversity = [
  new Given(rowDiversityCount.cell(1), 2),
  new CountDistinct(rowDiversityCount.cell(1), ...cc.at(graph.row(1))),
];

return [
  ...base,
  ...dots,
  ...spotlights,
  blockCount,
  ...blocks,
  rowDiversityCount,
  ...rowDiversity,
];
