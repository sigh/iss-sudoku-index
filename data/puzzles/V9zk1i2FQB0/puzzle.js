// Title: A Gorgeous Logical Path
// Author: Unknown
// Video: https://www.youtube.com/watch?v=V9zk1i2FQB0
// Source: https://cracking-the-cryptic.web.app/sudoku/BLRjmH2nqH

// Normal sudoku rules apply (default Shape regions/rows/cols/boxes, no
// givens). This is a Quad Sudoku: each circle's number is the sum of the
// digits in the four cells at its corner -> Sum(sum, ...cells), with cells
// for each 2x2 anchor taken from Quad.cells (Quad's own DESCRIPTION
// confirms it anchors a 2x2 square at its given top-left cell; Sum's own
// DESCRIPTION confirms values need not be unique, so no distinctness is
// implied among a quad's 4 cells). The payload carries no rules text; the
// video description is the sole source for the sum semantics: "This Quad
// Sudoku gives clues which are the sum of the four surrounding cells."
//
// Quad-sum table below is hand-transcribed from the payload's own overlay
// centers, cross-checked against an independent geometry readout of the
// same payload.

const quadSums = [
  ['R1C1', 10],
  ['R7C2', 10],
  ['R2C7', 10],
  ['R8C8', 10],
  ['R2C3', 17],
  ['R4C1', 21],
  ['R5C3', 26],
  ['R7C6', 26],
  ['R8C4', 28],
  ['R4C6', 30],
  ['R1C5', 25],
  ['R5C8', 23],
];

const sums = quadSums.map(
  ([topLeftCell, sum]) => new Sum(sum, ...Quad.cells(topLeftCell)));

return [
  new Shape('9x9'),
  ...sums,
];
