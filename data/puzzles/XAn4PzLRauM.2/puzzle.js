// Title: Vama
// Author: shye
// Video: https://www.youtube.com/watch?v=XAn4PzLRauM
// Source: https://tinyurl.com/dawcxs85

// Rules: shade some cells so that every row, every column and every outlined
// region contains exactly 2 shaded cells, and all shaded cells in the grid
// form one connected network, orthogonally or diagonally (i.e. king moves).
// Nothing else is drawn on the board: no givens, no digits.
//
// The board holds the shading itself, on a Raw grid so that no Sudoku
// row/column/box rules are added: 1 = unshaded, 2 = shaded.

const UNSHADED = 1;
const SHADED = 2;

const shape = new Shape('10x10', 2, 'Raw');
const graph = cellGraph(shape);
const rows = graph.rows();

// Region layout transcribed from the drawn region outlines: one letter per
// cell, row-major, one string per board row.
const REGION_MAP = [
  'AAAAAAABBB',
  'CCCCCCCBCB',
  'DDDDDDCCCD',
  'EEEEEDDDDD',
  'EEEEEEEEFF',
  'GGGGGEEEFF',
  'HIIJGEEEEF',
  'HIIJGEEEEF',
  'HJJJGEEEEF',
  'HHHEEEEEEF',
];

const regions = new Map();
REGION_MAP.forEach((rowLabels, r) => {
  [...rowLabels].forEach((label, c) => {
    if (!regions.has(label)) regions.set(label, []);
    regions.get(label).push(rows[r][c]);
  });
});

const exactlyTwoShaded = (cells) =>
  new ContainExact(`${SHADED}_${SHADED}`, ...cells);

const counts = [
  ...rows.map(exactlyTwoShaded),
  ...graph.columns().map(exactlyTwoShaded),
  ...[...regions.values()].map(exactlyTwoShaded),
];

// Connectivity layer. ConnectedValues tests orthogonal adjacency only, so the
// king-move network is carried on a 19x10 copy of the board: layer row 2i-1
// holds board row i, and the bridge row 2i between them holds, in column j,
// "board RiCj or R(i+1)Cj is shaded".
//
// The layer's adjacencies: a bridge cell touches the two board cells directly
// above and below it, and the bridge cells to its left and right. So two
// shaded board cells in the same row touch each other directly; two in the
// same column meet at the bridge cell between them; two on a diagonal meet at
// the two adjacent bridge cells between their rows. In the other direction, a
// shaded bridge cell is shaded because of the board cell above or below it,
// and each of its shaded bridge neighbours because of the board cell above or
// below that one, and any two such board cells are king-adjacent.
const layer = new Var(
  'S', 'connectivity', `${2 * rows.length - 1}x${rows[0].length}`);

// The layer's rows, top to bottom: board row 1, the bridge below it, board
// row 2, and so on -- board row i is layerRows[2i-2], and the bridge under it
// is layerRows[2i-1].
const layerRows = Array.from(
  { length: 2 * rows.length - 1 },
  (_, r) => rows[0].map((__, c) => layer.cell(r + 1, c + 1)));

// The layer's board rows repeat the board.
const layerLinks = rows.flatMap((row, i) => row.map(
  (cell, j) => new SameValues(2, cell, layerRows[2 * i][j])));

// A bridge cell is shaded exactly when a board cell above or below it is
// shaded: read down a layer column, the triple (board, bridge, board) spells
// one of 111, 122, 221, 222 in the UNSHADED/SHADED values above.
const bridges = rows.slice(1).flatMap((_, i) => rows[0].map(
  (__, j) => new Regex(
    '111|122|221|222',
    layerRows[2 * i][j], layerRows[2 * i + 1][j], layerRows[2 * i + 2][j])));

return [
  shape,
  ...counts,
  layer,
  ...layerLinks,
  ...bridges,
  new ConnectedValues('VS', SHADED),
];
