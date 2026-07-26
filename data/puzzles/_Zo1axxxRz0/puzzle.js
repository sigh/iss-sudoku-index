// Title: Picky neighbors
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=_Zo1axxxRz0
// Source: https://sudokupad.app/25xvdpdyba

// Normal sudoku on a 9x9 grid with standard 3x3 boxes, no givens.
// Ten blue lines (equal colour/thickness; drawn cell paths below, taken from
// `lines[].wayPoints`). Each carries two rules at once:
//   1. Where a box border crosses the line it splits into segments; all of a
//      line's segments share one sum, but different lines may use different
//      sums -- exactly RegionSumLine.
//   2. Every two cells consecutive along the line's drawn path must hold
//      digits x, y with |x - y| dividing both x and y (which also forbids
//      x == y, since only 0 is "a multiple of 0"). No native class covers
//      this, so it's a custom Pair relation applied along each line's path.
const divisorAdjacencyKey = Pair.fnToKey((a, b) => {
  const d = Math.abs(a - b);
  return d !== 0 && a % d === 0 && b % d === 0;
}, 9);

const lines = [
  ['R8C3', 'R8C4', 'R8C5', 'R8C6'],
  ['R7C4', 'R6C4', 'R5C4'],
  ['R5C5', 'R5C6', 'R5C7'],
  ['R4C7', 'R3C6', 'R2C5'],
  ['R4C6', 'R4C5', 'R3C4', 'R2C4'],
  ['R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1'],
  ['R7C2', 'R7C1', 'R6C1', 'R5C1', 'R4C1'],
  ['R9C8', 'R9C7', 'R9C6', 'R9C5'],
  ['R7C9', 'R6C8', 'R6C9'],
  ['R5C9', 'R5C8', 'R4C8', 'R3C8', 'R2C9', 'R2C8', 'R3C7'],
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new RegionSumLine(...cells)),
  ...lines.map(cells => new Pair(divisorAdjacencyKey, 'Picky neighbors', ...cells)),
];
