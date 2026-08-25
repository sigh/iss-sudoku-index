// Title: XV Kropki Sudoku
// Author: Philipp Huber
// Video: https://www.youtube.com/watch?v=TT-6BfDeCdc
// Source: https://app.crackingthecryptic.com/webapp/LTR8GR7D84

// Normal sudoku, standard 3x3 boxes, no givens. Cells joined by a black dot
// are in a 1:2 ratio (BlackDot); by a white dot are consecutive (WhiteDot);
// by an X sum to 10 (X); by a V sum to 5 (V). Rules state no negative
// constraint applies, so only the marked edges below are constrained --
// StrictKropki/StrictXV (which would also forbid the relation on every
// unmarked pair) do not apply.

// Black dot edges, from the drawn black-filled rounded overlays.
const blackDots = [
  ['R2C5', 'R2C6'],
  ['R3C1', 'R4C1'],
  ['R4C6', 'R5C6'],
  ['R5C6', 'R6C6'],
];

// White dot edges, from the drawn white-filled black-bordered rounded overlays.
const whiteDots = [
  ['R3C2', 'R3C3'],
  ['R4C3', 'R5C3'],
  ['R5C2', 'R6C2'],
  ['R8C4', 'R8C5'],
  ['R8C6', 'R8C7'],
];

// V edges, from the drawn "V" text overlays.
const vEdges = [
  ['R2C1', 'R3C1'],
  ['R1C7', 'R2C7'],
  ['R8C2', 'R8C3'],
  ['R8C8', 'R8C9'],
];

// X edges, from the drawn "X" text overlays.
const xEdges = [
  ['R2C1', 'R2C2'],
  ['R3C1', 'R3C2'],
  ['R1C7', 'R1C8'],
  ['R2C7', 'R2C8'],
  ['R7C8', 'R8C8'],
  ['R7C9', 'R8C9'],
  ['R8C2', 'R9C2'],
  ['R8C3', 'R9C3'],
  ['R5C4', 'R5C5'],
];

return [
  new Shape('9x9'),
  ...blackDots.map((cells) => new BlackDot(...cells)),
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
  ...vEdges.map((cells) => new V(...cells)),
  ...xEdges.map((cells) => new X(...cells)),
];
