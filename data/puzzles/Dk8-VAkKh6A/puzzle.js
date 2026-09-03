// Title: REDRUM
// Author: Gray Kanarek
// Video: https://www.youtube.com/watch?v=Dk8-VAkKh6A
// Source: https://app.crackingthecryptic.com/sudoku/9ThTbRRRt9

// Normal sudoku rules apply. Clues outside the grid give the sum of the digits
// along the indicated diagonals; these digits may repeat (subject to the rules
// of sudoku). Digits along grey lines form palindromes, i.e. they must read the
// same in both directions.
//
// The puzzle has no given digits: the nine outside clues and six grey lines
// below are the whole of its clue geometry.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// The nine drawn arrows outside the frame, each with the total printed beside
// it: [total, first cell the arrow enters, row step, column step]. The step is
// the direction the arrow head points; the diagonal runs to the far edge.
const outsideDiagonals = [
  [39, 'R1C1', 1, 1],   // top-left corner, down-right (the main diagonal)
  [10, 'R1C2', 1, -1],  // above the grid, down-left
  [10, 'R1C8', 1, 1],   // above the grid, down-right
  [17, 'R4C1', -1, 1],  // left of the grid, up-right
  [32, 'R5C1', -1, 1],
  [47, 'R6C1', -1, 1],
  [42, 'R4C9', 1, -1],  // right of the grid, down-left
  [15, 'R5C9', 1, -1],
  [21, 'R6C9', 1, -1],
];

// The six drawn grey lines, as the cells each stroke passes through.
const greyLines = [
  ['R1C4', 'R2C4', 'R3C3', 'R4C2', 'R4C1'],
  ['R9C6', 'R8C6', 'R7C7', 'R6C8', 'R6C9'],
  ['R3C5', 'R4C6', 'R5C7'],
  ['R5C3', 'R6C4', 'R7C5'],
  ['R2C6', 'R3C6', 'R4C7', 'R4C8'],
  ['R6C2', 'R6C3', 'R7C4', 'R8C4'],
];

return [
  new Shape('9x9'),

  // fromCells picks the clue whose diagonal is exactly this ray, so the entry
  // cell above need not be ISS's canonical start corner for that diagonal.
  ...outsideDiagonals.map(
    ([total, cell, dr, dc]) =>
      LittleKiller.fromCells(total, graph.ray(cell, dr, dc), geometry)),

  ...greyLines.map(cells => new Palindrome(...cells)),
];
