// Title: Ambiguity
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=PwVy38-zlLs
// Source: https://sudokupad.app/arxojcplun

// Normal sudoku rules apply, standard 3x3 boxes.
// Each gray line is either a Renban line (non-repeating consecutive digits,
// any order) or a Region Sum line (box borders split it into segments that
// all sum to the same N, chosen per line); which reading applies is not
// stated and is left as a per-line disjunction below.
// Each outside circle is an X-Sum clue: the sum of the first X digits of the
// row/column from that side, where X is the value of the first digit itself.

const lines = [
  ['R4C1', 'R3C1', 'R2C2', 'R1C3', 'R1C4'],
  ['R2C4', 'R3C4', 'R3C3'],
  ['R2C6', 'R3C6', 'R3C7'],
  ['R1C6', 'R1C7', 'R2C8', 'R3C9', 'R4C9'],
  ['R6C2', 'R6C3', 'R7C3', 'R7C4', 'R8C4'],
  ['R8C6', 'R7C6', 'R7C7', 'R6C7', 'R6C8'],
  ['R6C1', 'R7C1', 'R8C2', 'R9C3', 'R9C4'],
  ['R9C6', 'R9C7', 'R8C8', 'R7C9', 'R6C9'],
];

// Each outside-clue circle's grid-relative position (drawn center in
// overlays[]) fixes which row/column it reads and from which end.
const col = c => Array.from({ length: 9 }, (_, r) => makeCellId(r + 1, c));
const row = r => Array.from({ length: 9 }, (_, c) => makeCellId(r, c + 1));
const reversed = cells => cells.slice().reverse();

const xSums = [
  [col(3), 1],             // above C3: read top-to-bottom
  [col(5), 42],            // above C5: read top-to-bottom
  [reversed(col(3)), 28],  // below C3: read bottom-to-top
  [reversed(col(4)), 38],  // below C4: read bottom-to-top
  [reversed(col(7)), 8],   // below C7: read bottom-to-top
  [row(7), 7],             // left of R7: read left-to-right
  [reversed(row(1)), 18],  // right of R1: read right-to-left
  [reversed(row(7)), 20],  // right of R7: read right-to-left
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new Or([
    new Renban(...cells),
    new RegionSumLine(...cells),
  ])),
  ...xSums.map(([cells, value]) => XSum.fromCells(value, cells, GEOMETRY_9x9)),
];
