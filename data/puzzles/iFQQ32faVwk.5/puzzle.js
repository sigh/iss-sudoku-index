// Title: Comeback Kid
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=iFQQ32faVwk
// Source: https://tinyurl.com/bed8j34b

// Normal sudoku, no givens. Purple lines hold a consecutive, non-repeating
// digit set in any order (Renban). Each quadruple clue lists digits that
// must appear somewhere in the surrounding 2x2 block; Quad's anchor is the
// block's top-left cell.

const renbanLines = [
  ['R1C2', 'R1C3', 'R2C2', 'R2C3'],
  ['R8C7', 'R8C8', 'R9C7', 'R9C8'],
  ['R8C2', 'R8C3', 'R9C2', 'R9C3'],
  ['R1C7', 'R1C8', 'R2C7', 'R2C8'],
  ['R7C5', 'R7C6', 'R7C7'],
  ['R3C3', 'R3C4', 'R3C5'],
  ['R6C2', 'R7C1', 'R7C2'],
  ['R3C8', 'R3C9', 'R4C8'],
  ['R4C4', 'R4C5', 'R5C4'],
  ['R5C6', 'R6C5', 'R6C6'],
];

const quads = [
  ['R1C1', 1, 2, 3, 4],
  ['R8C8', 6, 7, 8, 9],
  ['R7C1', 5, 7, 9],
  ['R2C8', 1, 3, 5],
  ['R8C6', 2, 3],
  ['R1C3', 7, 8],
  ['R3C1', 4, 5],
  ['R6C8', 5, 6],
];

return [
  new Shape('9x9'),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...quads.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
];
