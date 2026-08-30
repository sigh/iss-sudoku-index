// Title: Parquet Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=j4Tz1rHWCOg
// Source: https://tinyurl.com/2grxnkau

// Fill each cell with 1-9 so that each of the 12 rows, 12 columns and 9
// regions contains every number exactly once. Some cells span across two
// rows or two columns, and the digit in that cell is counted as part of
// every row and column it stretches over.
//
// The 12x12 grid is split by two full-height and two full-width lines into
// a 3x3 arrangement of nine 4x4 regions. Within each region the unit
// squares are merged (no border drawn) into nine "parquet" pieces -- one
// full 1-9 set apiece, and every one of the 12 rows/columns crosses exactly
// nine pieces too. Every region uses the same pinwheel layout: four single
// cells, four dominoes (two horizontal, two vertical), and one 2x2 piece at
// the centre that spans both two rows and two columns.
//
// Encoded on a Raw 9x9 grid with no implicit rules, since neither the
// board's rows/columns nor its regions match a plain 9x9 layout: Raw row =
// region (1-9, reading order), Raw column = an arbitrary stable position
// (1-9) of the piece within that region. Region membership is then simply
// "same Raw row"; the real 12 rows and 12 columns are built explicitly below
// from which unit squares each piece covers.

// Every region's nine pieces, as the list of unit squares [row, col]
// (1-indexed on the drawn 12x12 grid) each piece covers -- transcribed from
// the puzzle's drawn cell borders, one region per line, pieces in reading
// order (top-left square first).
const REGIONS = [
  [[[1,1], [1,2]], [[1,3]], [[1,4], [2,4]], [[2,1]], [[2,2], [2,3], [3,2], [3,3]], [[3,1], [4,1]], [[3,4]], [[4,2]], [[4,3], [4,4]]],
  [[[1,5], [2,5]], [[1,6]], [[1,7], [1,8]], [[2,6], [2,7], [3,6], [3,7]], [[2,8]], [[3,5]], [[3,8], [4,8]], [[4,5], [4,6]], [[4,7]]],
  [[[1,9], [1,10]], [[1,11]], [[1,12], [2,12]], [[2,9]], [[2,10], [2,11], [3,10], [3,11]], [[3,9], [4,9]], [[3,12]], [[4,10]], [[4,11], [4,12]]],
  [[[5,1], [6,1]], [[5,2]], [[5,3], [5,4]], [[6,2], [6,3], [7,2], [7,3]], [[6,4]], [[7,1]], [[7,4], [8,4]], [[8,1], [8,2]], [[8,3]]],
  [[[5,5], [5,6]], [[5,7]], [[5,8], [6,8]], [[6,5]], [[6,6], [6,7], [7,6], [7,7]], [[7,5], [8,5]], [[7,8]], [[8,6]], [[8,7], [8,8]]],
  [[[5,9], [6,9]], [[5,10]], [[5,11], [5,12]], [[6,10], [6,11], [7,10], [7,11]], [[6,12]], [[7,9]], [[7,12], [8,12]], [[8,9], [8,10]], [[8,11]]],
  [[[9,1], [9,2]], [[9,3]], [[9,4], [10,4]], [[10,1]], [[10,2], [10,3], [11,2], [11,3]], [[11,1], [12,1]], [[11,4]], [[12,2]], [[12,3], [12,4]]],
  [[[9,5], [10,5]], [[9,6]], [[9,7], [9,8]], [[10,6], [10,7], [11,6], [11,7]], [[10,8]], [[11,5]], [[11,8], [12,8]], [[12,5], [12,6]], [[12,7]]],
  [[[9,9], [9,10]], [[9,11]], [[9,12], [10,12]], [[10,9]], [[10,10], [10,11], [11,10], [11,11]], [[11,9], [12,9]], [[11,12]], [[12,10]], [[12,11], [12,12]]],
];

const shape = new Shape('9x9', 9, 'Raw');
const graph = cellGraph(shape);

// Map every unit square (as a "row,col" key) to the Raw cell id of the
// piece that covers it.
const cellOf = {};
REGIONS.forEach((pieces, regionIdx) => {
  pieces.forEach((squares, posIdx) => {
    const id = makeCellId(regionIdx + 1, posIdx + 1);
    for (const [r, c] of squares) cellOf[`${r},${c}`] = id;
  });
});

// Regions: each Raw row is exactly one region's nine pieces.
const regionConstraints = graph.rows().map(row => new AllDifferent(...row));

// Rows and columns: the distinct pieces whose covered unit squares include
// that row/column (a piece appears once per row/column it spans, and only
// once, since no piece spans three rows or three columns).
const rowConstraints = [];
for (let r = 1; r <= 12; r++) {
  const ids = new Set();
  for (let c = 1; c <= 12; c++) ids.add(cellOf[`${r},${c}`]);
  rowConstraints.push(new AllDifferent(...ids));
}
const colConstraints = [];
for (let c = 1; c <= 12; c++) {
  const ids = new Set();
  for (let r = 1; r <= 12; r++) ids.add(cellOf[`${r},${c}`]);
  colConstraints.push(new AllDifferent(...ids));
}

// Given digits, transcribed from the puzzle image ([row, col, value] on the
// drawn 12x12 grid).
const GIVENS = [
  [1,3,3], [1,4,2], [1,5,5], [1,6,4], [1,11,1], [1,12,7], [2,1,9],
  [6,2,2], [6,4,3], [6,5,4], [6,6,5], [6,10,8], [6,12,9],
  [7,1,1], [7,8,6], [7,9,7],
  [11,1,4], [11,8,2], [11,9,5], [11,12,1],
  [12,2,8], [12,7,9], [12,10,6],
];
const givens = GIVENS.map(([r, c, v]) => new Given(cellOf[`${r},${c}`], v));

return [shape, ...regionConstraints, ...rowConstraints, ...colConstraints, ...givens];
