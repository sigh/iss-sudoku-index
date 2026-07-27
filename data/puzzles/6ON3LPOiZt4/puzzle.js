// Title: You Know How I Roll
// Author: Arctan
// Video: https://www.youtube.com/watch?v=6ON3LPOiZt4
// Source: https://sudokupad.app/18p5s54kcz

// Normal sudoku rules apply (default Shape('9x9') row/column/box constraints;
// no givens). Digits separated by a V sum to five (V). Digits separated by a
// white dot are consecutive (WhiteDot). Digits separated by a black dot are
// in a 1:2 ratio (BlackDot). Fog-of-war reveal state is solving UI, not a
// grid rule, and is not encoded.

// V-marked edges, transcribed from the puzzle's drawn "V" edge marks.
const vEdges = [
  ['R1C1', 'R1C2'],
  ['R2C1', 'R2C2'],
  ['R5C2', 'R5C3'],
  ['R5C7', 'R5C8'],
  ['R8C6', 'R8C7'],
  ['R3C9', 'R4C9'],
];

// White-dot edges, transcribed from the puzzle's drawn white edge dots.
const whiteDotEdges = [
  ['R2C5', 'R2C6'],
  ['R2C6', 'R2C7'],
  ['R5C3', 'R6C3'],
  ['R8C1', 'R9C1'],
  ['R7C3', 'R8C3'],
  ['R7C5', 'R7C6'],
  ['R8C8', 'R8C9'],
];

// Black-dot edges, transcribed from the puzzle's drawn black edge dots.
const blackDotEdges = [
  ['R1C2', 'R2C2'],
  ['R2C2', 'R3C2'],
  ['R9C3', 'R9C4'],
  ['R9C4', 'R9C5'],
  ['R9C5', 'R9C6'],
  ['R9C8', 'R9C9'],
  ['R5C5', 'R6C5'],
  ['R6C5', 'R6C6'],
  ['R3C3', 'R4C3'],
];

return [
  new Shape('9x9'),
  ...vEdges.map(cells => new V(...cells)),
  ...whiteDotEdges.map(cells => new WhiteDot(...cells)),
  ...blackDotEdges.map(cells => new BlackDot(...cells)),
];
