// Title: Quadrangling
// Author: Tallcat
// Video: https://www.youtube.com/watch?v=iDeRWnQPqLQ
// Source: https://app.crackingthecryptic.com/sudoku/BbRdtpt28f

// Normal sudoku rules apply. Pink lines are Renban lines (a set of
// consecutive, non-repeating digits, any order). Each white circle is a
// quadruple clue: every listed digit must appear at least once in the
// surrounding 2x2 block of cells. No givens.

// Renban lines, drawn cell order (mediumorchid polylines).
const renbanLines = [
  ['R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R5C4', 'R4C5', 'R5C6'],
  ['R4C3', 'R3C4', 'R3C5', 'R3C6', 'R4C7'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8'],
  ['R8C6', 'R9C5', 'R8C4'],
  ['R6C3', 'R7C4', 'R7C5', 'R7C6', 'R6C7'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2'],
];

// Quadruple clues: [top-left cell of the 2x2 block, ...digits]. Six circles
// show their digits split across two small edge-hugging text overlays (a
// rendering choice - the circle is too small for 3 digits); four show all
// digits directly inside the circle. Both are the same clue, read as the
// full digit list for the block.
const quads = [
  ['R3C2', 2, 3, 4],
  ['R2C3', 6, 7, 8],
  ['R3C7', 4, 5, 6],
  ['R7C3', 2, 3, 4],
  ['R7C6', 5, 6, 7],
  ['R2C6', 1, 2, 3],
  ['R4C1', 5, 7],
  ['R6C1', 1],
  ['R4C8', 2, 8],
  ['R6C8', 1],
];

return [
  new Shape('9x9'),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...quads.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
];
