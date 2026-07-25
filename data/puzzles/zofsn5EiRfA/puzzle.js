// Title: Bishopsgate
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=zofsn5EiRfA
// Source: https://sudokupad.app/k1h02y7ke0

// Normal Sudoku rules apply: default row, column, and 3x3 box all-different
// (regions are the standard boxes; no NoBoxes needed).
//
// Bishop's constraint: "the cells on each white diagonal are different."
// Checkerboard coloring is fixed by the drawn art, not the rule text: the 40
// underlay-shaded cells in the source are exactly the cells with R+C odd
// (1-indexed), and R1C1 is unshaded, so unshaded ("white") squares are
// R+C even. A checkerboard diagonal is monochromatic in both diagonal
// directions, so every "\" diagonal with R-C even and every "/" diagonal
// with R+C even lies entirely on white squares; those are the diagonals this
// rule constrains. Diagonals of length 1 (the four grid corners) impose no
// constraint and are skipped.
const diagonals = [];
for (let k = -8; k <= 8; k += 2) { // "\": R - C = k, white when k is even.
  const cells = [];
  for (let r = 1; r <= 9; r++) {
    const c = r - k;
    if (c >= 1 && c <= 9) cells.push(makeCellId(r, c));
  }
  if (cells.length >= 2) diagonals.push(cells);
}
for (let k = 2; k <= 18; k += 2) { // "/": R + C = k, white when k is even.
  const cells = [];
  for (let r = 1; r <= 9; r++) {
    const c = k - r;
    if (c >= 1 && c <= 9) cells.push(makeCellId(r, c));
  }
  if (cells.length >= 2) diagonals.push(cells);
}
const bishopDiagonals = diagonals.map(cells => new AllDifferent(...cells));

// V / X dots: adjacent cells sum to 5 / 10 (edge-marker overlay text "V"/"X";
// each pair below cites the marker's edge).
const vDots = [
  ['R1C5', 'R1C6'], // overlay #0
  ['R4C2', 'R5C2'], // overlay #1
  ['R4C8', 'R5C8'], // overlay #2
  ['R7C5', 'R7C6'], // overlay #3
].map(cells => new V(...cells));

const xDots = [
  ['R4C6', 'R5C6'], // overlay #4
  ['R4C5', 'R5C5'], // overlay #5
  ['R1C8', 'R2C8'], // overlay #6
  ['R6C6', 'R7C6'], // overlay #7
  ['R6C5', 'R7C5'], // overlay #8
  ['R1C2', 'R2C2'], // overlay #9
  ['R7C4', 'R8C4'], // overlay #10
  ['R8C8', 'R9C8'], // overlay #11
  ['R1C1', 'R2C1'], // overlay #12
  ['R6C1', 'R7C1'], // overlay #13
  ['R6C2', 'R7C2'], // overlay #14
].map(cells => new X(...cells));

// White dot: adjacent cells are consecutive (unlabelled white-filled,
// black-bordered edge overlays, matching the rule text's "white dot").
const whiteDots = [
  ['R1C6', 'R2C6'], // overlay #15
  ['R4C3', 'R5C3'], // overlay #16
].map(cells => new WhiteDot(...cells));

return [
  new Shape('9x9'),
  ...bishopDiagonals,
  ...vDots,
  ...xDots,
  ...whiteDots,
];
