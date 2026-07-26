// Title: Foggy Index Strips
// Author: Blobz
// Video: https://www.youtube.com/watch?v=F_sQp_aZ_PQ
// Source: https://sudokupad.app/blobz/foggy-index-strips
//
// Normal sudoku. Killer cages: digits in a cage don't repeat, and sum to the
// printed total when one is shown.
//
// Index strips (pink-shaded cells, hidden in fog during solving -- fog reveal
// itself is UI only and is not encoded): a vertical strip lies in one column
// N; a digit d in one of its cells means digit N sits in column d of that
// same row. A horizontal strip lies in one row N; a digit d in one of its
// cells means digit N sits in row d of that same column. The pink shading
// gives 25 cells that split unambiguously into 9 maximal same-row/same-column
// runs of length >= 2 -- every pink cell has a pink neighbour in exactly one
// direction (row or column, never both), so no cell could belong to both a
// horizontal and a vertical run. ISS's native Indexing constraint applies
// this rule cell-by-cell over the cell's own full row/column, so only each
// cell's orientation needs encoding, not the strips' exact boundaries.
//
// A "foglight" cage (R8C1,R8C2,R8C3) is a fog-of-war UI marker (a light
// source that reveals a wider fog radius once solved), not a real cage --
// omitted.

const cages = [
  new Cage(7, 'R8C1', 'R8C2', 'R9C2'),
  new Cage(15, 'R2C4', 'R2C5', 'R3C5', 'R3C6'),
  new Cage(14, 'R8C8', 'R9C8'),
  new Cage(12, 'R8C6', 'R8C7'),
  new Cage(5, 'R8C3', 'R8C4'),
  new Cage(29, 'R4C3', 'R5C3', 'R6C2', 'R6C3', 'R7C3'),
  new Cage(13, 'R2C1', 'R3C1'),
  new Cage(12, 'R1C2', 'R1C3'),
  new Cage(9, 'R5C5', 'R5C6', 'R6C6'),
];

// No-total killer cage: cages without a printed total are distinct-only.
const noTotalCage = new AllDifferent('R3C7', 'R3C8', 'R3C9', 'R4C7', 'R4C9');

// Vertical index strips: cell (r, N) with digit d means cell (r, d) has value
// N (N = the strip's own column). Cells listed column-by-column, top to
// bottom, per the pink-shading decode above.
const verticalIndexing = new Indexing('C',
  'R2C1', 'R3C1',
  'R3C4', 'R4C4', 'R5C4',
  'R7C5', 'R8C5', 'R9C5',
  'R3C7', 'R4C7',
  'R7C7', 'R8C7',
  'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9',
);

// Horizontal index strips: cell (N, c) with digit d means cell (d, c) has
// value N (N = the strip's own row).
const horizontalIndexing = new Indexing('R',
  'R1C2', 'R1C3', 'R1C5', 'R1C6',
  'R9C1', 'R9C2', 'R9C3',
);

return [
  new Shape('9x9'),
  ...cages,
  noTotalCage,
  verticalIndexing,
  horizontalIndexing,
];
