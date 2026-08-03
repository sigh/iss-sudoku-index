// Title: Neapolitan
// Author: Pieguy
// Video: https://www.youtube.com/watch?v=QHlmImQDc8Q
// Source: https://app.crackingthecryptic.com/sudoku/jLG3TdLNHM
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Identical digits cannot be a knight's move apart -> AntiKnight.
// Cells joined by a black dot are in a 2:1 ratio -> BlackDot.
// Cells joined by a white dot are consecutive -> WhiteDot.
// Cells joined by an X sum to 10 -> X.
// All dots/X marks sit only on the two horizontal box-boundary lines
// (rows 3/4 and rows 6/7); no other edges carry a mark, and the rules
// do not say marks are exhaustively drawn, so undrawn edges get no
// constraint.
//
// Marks were read off the overlay geometry: each is centred on the shared
// edge between one cell in the upper row and one in the lower row of a
// box-boundary, keyed by its fill colour (white/black) or its "X" text.
const whiteDots = [
  ['R3C4', 'R4C4'], ['R3C5', 'R4C5'], ['R3C6', 'R4C6'],
  ['R6C2', 'R7C2'], ['R6C4', 'R7C4'], ['R6C6', 'R7C6'], ['R6C8', 'R7C8'],
];
const blackDots = [
  ['R3C7', 'R4C7'], ['R3C8', 'R4C8'], ['R3C9', 'R4C9'],
  ['R6C1', 'R7C1'], ['R6C5', 'R7C5'], ['R6C9', 'R7C9'],
];
const xMarks = [
  ['R3C1', 'R4C1'], ['R3C2', 'R4C2'], ['R3C3', 'R4C3'],
  ['R6C3', 'R7C3'], ['R6C7', 'R7C7'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...xMarks.map(cells => new X(...cells)),
];
