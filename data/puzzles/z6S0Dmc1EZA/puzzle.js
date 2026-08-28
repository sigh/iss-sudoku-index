// Title: Knight Kropki Sudoku
// Author: Aris Martinian
// Video: https://www.youtube.com/watch?v=z6S0Dmc1EZA
// Source: https://cracking-the-cryptic.web.app/sudoku/j29FBRt4f6

// Normal sudoku rules apply (default row/col/box all-different; the
// payload's 9 regions coincide with the default 3x3 boxes). Antiknight:
// identical digits cannot be a knight's move apart. Every Kropki dot is
// exhaustively marked -- black dot (one value double the other, including
// the 1-2 pair) and white dot (consecutive, except 1-2, which is drawn
// black instead) -- so every unmarked adjacent pair is neither consecutive
// nor in a 2:1 ratio: StrictKropki over the whole grid, exempting the
// drawn edges below.

// White dots: consecutive digits. Edges transcribed from the payload's
// overlay list (backgroundColor #ffffff, edge-sized rounded marks).
const whiteEdges = [
  ['R5C1', 'R6C1'], ['R5C2', 'R5C3'], ['R6C2', 'R6C3'], ['R5C2', 'R6C2'],
  ['R2C1', 'R2C2'], ['R1C1', 'R1C2'], ['R3C4', 'R3C5'], ['R3C4', 'R4C4'],
  ['R4C4', 'R4C5'], ['R7C1', 'R8C1'], ['R8C2', 'R8C3'], ['R8C5', 'R8C6'],
  ['R1C8', 'R2C8'], ['R3C9', 'R4C9'], ['R5C8', 'R5C9'], ['R4C7', 'R5C7'],
  ['R5C6', 'R5C7'], ['R7C8', 'R7C9'], ['R8C8', 'R8C9'], ['R1C6', 'R2C6'],
];

// Black dots: one value double the other. Edges transcribed from the
// payload's overlay list (backgroundColor #000000, edge-sized rounded
// marks).
const blackEdges = [
  ['R4C8', 'R4C9'], ['R4C8', 'R5C8'], ['R1C6', 'R1C7'], ['R1C7', 'R2C7'],
  ['R8C7', 'R9C7'], ['R9C6', 'R9C7'], ['R7C4', 'R7C5'], ['R6C5', 'R7C5'],
  ['R6C5', 'R6C6'], ['R4C5', 'R5C5'], ['R5C1', 'R5C2'], ['R8C3', 'R9C3'],
  ['R9C3', 'R9C4'],
];

return [
  new Shape('9x9'),

  new Given('R6C1', 7),

  new AntiKnight(),

  ...whiteEdges.map(([a, b]) => new WhiteDot(a, b)),
  ...blackEdges.map(([a, b]) => new BlackDot(a, b)),

  // All dots are drawn, so every other adjacent pair is negatively
  // constrained (StrictKropki auto-exempts the WhiteDot/BlackDot edges
  // already listed above).
  new StrictKropki(),
];
