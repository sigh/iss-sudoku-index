// Title: Hex-Proof
// Author: Qoala
// Video: https://www.youtube.com/watch?v=BYD4TsYH9lU
// Source: https://sudokupad.app/jzsgcc1kn9

// Hexed: every row, column, and box holds the same set of 9 numbers, chosen
// from 1-15 -- a widened alphabet with RegionSameValues over the default
// (size-9) rows/columns/boxes, which are already the puzzle's regions.
// No given digits.
const shape = new Shape('9x9', 15);

// Killer cages -- transcribed from the payload's `killercage` array
// (cells, sum).
const cages = [
  [31, 'R2C4', 'R3C4', 'R3C5', 'R4C4'],
  [29, 'R4C1', 'R4C2'],
  [14, 'R1C8', 'R2C8', 'R2C9', 'R3C8'],
  [22, 'R6C6', 'R7C5', 'R7C6', 'R8C6'],
  [29, 'R7C3', 'R8C2', 'R8C3', 'R9C3'],
];

// Full Kropki: white dots (consecutive) from the payload's `difference`
// array, black dots (1:2 ratio) from the `ratio` array. "ALL possible dots
// are given" (including the 1/2 edge case, which may show as either colour)
// makes this a global negative -- StrictKropki below.
const whiteDots = [
  ['R4C1', 'R4C2'], ['R4C8', 'R4C9'], ['R6C8', 'R6C9'], ['R6C4', 'R6C5'],
  ['R8C6', 'R9C6'], ['R8C6', 'R8C7'], ['R9C7', 'R9C8'],
];
const blackDots = [
  ['R9C2', 'R9C3'], ['R7C1', 'R7C2'], ['R8C9', 'R9C9'], ['R6C7', 'R7C7'],
  ['R6C5', 'R6C6'], ['R6C5', 'R7C5'], ['R4C4', 'R4C5'], ['R3C5', 'R4C5'],
  ['R1C4', 'R2C4'], ['R5C2', 'R5C3'],
];

return [
  shape,
  new RegionSameValues(),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),

  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  new StrictKropki(),
];
