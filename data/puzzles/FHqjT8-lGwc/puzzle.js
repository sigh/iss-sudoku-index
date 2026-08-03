// Title: Mishaps 1: Amplification
// Author: 99% Sneaky
// Video: https://www.youtube.com/watch?v=FHqjT8-lGwc
// Source: https://app.crackingthecryptic.com/sudoku/b2qP7TL9D3

// Normal sudoku rules apply (default 9x9 boxes; no givens).
// White dots: consecutive digits, adjacent cells only (WhiteDot).
// Black dots: digits in a 1:2 ratio, adjacent cells only (BlackDot).
// The sum of the digits on the 7 colored 3-cell lines equals double the sum
// of the digits on the white line in row 7 (Sum with coefficients).
// The "prism (grey line)" is stated in the rules to be cosmetic and is
// omitted; no distinct grey line geometry exists in the source payload beyond
// the elements already encoded below.

// Kropki dot edges, transcribed from the payload's `overlays` array (edge
// marks distinguished by fill colour: white fill = white dot, black fill =
// black dot).
const whiteDotEdges = [
  ['R8C5', 'R8C6'],
  ['R3C2', 'R4C2'],
  ['R8C3', 'R8C4'],
  ['R1C5', 'R1C6'],
  ['R1C2', 'R1C3'],
  ['R8C8', 'R8C9'],
  ['R2C8', 'R2C9'],
  ['R5C6', 'R6C6'],
  ['R7C1', 'R8C1'],
  ['R5C3', 'R5C4'],
  ['R3C5', 'R4C5'],
  ['R4C8', 'R5C8'],
];

const blackDotEdges = [
  ['R7C6', 'R8C6'],
  ['R4C1', 'R4C2'],
  ['R8C3', 'R9C3'],
  ['R1C5', 'R2C5'],
  ['R1C2', 'R2C2'],
  ['R8C9', 'R9C9'],
  ['R2C9', 'R3C9'],
  ['R6C6', 'R6C7'],
  ['R8C1', 'R8C2'],
];

// The 7 colored 3-cell lines, transcribed from `lines[]` entries 0-6
// (wayPoints interpolated to cells).
const coloredLineCells = [
  ['R2C9', 'R3C8', 'R4C7'], // yellowgreen
  ['R5C9', 'R6C8', 'R7C7'], // purple (a)
  ['R3C9', 'R4C8', 'R5C7'], // deepskyblue
  ['R4C9', 'R5C8', 'R6C7'], // purple (b)
  ['R2C8', 'R3C7', 'R4C6'], // gold (a)
  ['R2C7', 'R3C6', 'R4C5'], // gold (b)
  ['R2C6', 'R3C5', 'R4C4'], // chocolate
].flat();

// The white line in row 7, from `lines[]` entry 7.
const rowSevenLineCells = ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5'];

return [
  new Shape('9x9'),

  ...whiteDotEdges.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDotEdges.map(([a, b]) => new BlackDot(a, b)),

  // sum(coloredLineCells) - 2 * sum(rowSevenLineCells) = 0
  new Sum(
    0,
    ...coloredLineCells,
    ...rowSevenLineCells.map(c => [c, -2]),
  ),
];
