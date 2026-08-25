// Title: Little Kropkiller
// Author: Mark Sweep
// Video: https://www.youtube.com/watch?v=0sX7Ga9Dino
// Source: https://app.crackingthecryptic.com/webapp/4R79M4b7f2

// Normal sudoku rules apply. Clues outside the grid give the sum of the
// digits along the diagonal they point into (digits may repeat there,
// unless another rule forbids it -- Little Killer semantics). A white dot
// between two adjacent cells means the digits are consecutive; a black dot
// means one digit is double the other. Not all possible dots are drawn:
// an unmarked adjacent pair carries no information (no StrictKropki), which
// is why the rules separately note that a 1-and-2 pair may sit on an
// unmarked edge -- that sentence is a clarification of the non-exhaustive
// dot set, not an extra grid constraint, so it needs no encoding of its own.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// White dots: consecutive digits. Edges transcribed from the payload's
// overlay list (fillColor #FFFFFF, edge-sized rounded marks).
const whiteEdges = [
  ['R2C4', 'R2C5'], ['R2C4', 'R3C4'], ['R2C5', 'R3C5'], ['R2C7', 'R3C7'],
  ['R3C7', 'R4C7'], ['R4C7', 'R4C8'], ['R4C8', 'R4C9'], ['R7C8', 'R7C9'],
  ['R8C8', 'R8C9'], ['R6C2', 'R7C2'], ['R7C2', 'R7C3'], ['R8C4', 'R8C5'],
  ['R8C5', 'R9C5'], ['R5C1', 'R6C1'], ['R5C2', 'R6C2'], ['R5C2', 'R5C3'],
  ['R4C3', 'R5C3'], ['R4C4', 'R5C4'], ['R4C5', 'R5C5'],
];

// Black dots: 1:2 ratio. Edges transcribed from the payload's overlay list
// (fillColor #000000, edge-sized rounded marks).
const blackEdges = [
  ['R5C4', 'R5C5'], ['R1C6', 'R1C7'], ['R1C7', 'R2C7'],
];

return [
  new Shape('9x9'),

  ...whiteEdges.map(([a, b]) => new WhiteDot(a, b)),
  ...blackEdges.map(([a, b]) => new BlackDot(a, b)),

  // Outside diagonal-sum clues. Direction of each diagonal is read from the
  // drawn arrow stroke's entry corner and travel direction (down-right,
  // up-left, up-right), not assumed from the outside position alone.
  LittleKiller.fromCells(40, graph.ray('R1C2', 1, 1), geometry),
  LittleKiller.fromCells(24, graph.ray('R1C4', 1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(33, graph.ray('R6C1', -1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R9C5', -1, -1), geometry),
];
