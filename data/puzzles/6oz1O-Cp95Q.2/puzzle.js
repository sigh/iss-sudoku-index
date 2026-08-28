// Title: May 19, 2021: Fortress Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=6oz1O-Cp95Q
// Source: https://tinyurl.com/59m7v3bz

// Standard 9x9 sudoku. Fortress rule: whenever a shaded cell and an unshaded
// cell are orthogonally adjacent, the shaded cell holds the higher digit.
// Shaded cells (source: cell background colour #A8A8A8): R3C3, R3C9, R5C2,
// R5C5, R5C8, R7C1, R7C7. No two shaded cells are adjacent to each other, so
// each fortress cell's orthogonal neighbours in the grid are all unshaded.
//
// GreaterThan(...cells) enforces, over every grid-adjacent pair drawn from
// its cell list, that the cell appearing earlier in the list is greater than
// the one appearing later. Listing the shaded cell first, followed only by
// its own unshaded neighbours (which are never adjacent to each other),
// gives exactly "shaded > each unshaded neighbour" with no accidental
// ordering imposed between the neighbour cells themselves.
const givens = [
  ['R1C1', 4], ['R1C2', 6], ['R1C3', 8], ['R1C6', 3],
  ['R2C7', 3],
  ['R3C8', 4],
  ['R4C1', 8], ['R4C6', 2], ['R4C9', 4],
  ['R5C5', 7],
  ['R6C1', 3], ['R6C4', 1], ['R6C9', 9],
  ['R7C2', 3],
  ['R8C3', 4],
  ['R9C4', 4], ['R9C7', 6], ['R9C8', 9], ['R9C9', 8],
];

const fortresses = [
  ['R3C3', 'R2C3', 'R4C3', 'R3C2', 'R3C4'],
  ['R3C9', 'R2C9', 'R4C9', 'R3C8'],
  ['R5C2', 'R4C2', 'R6C2', 'R5C1', 'R5C3'],
  ['R5C5', 'R4C5', 'R6C5', 'R5C4', 'R5C6'],
  ['R5C8', 'R4C8', 'R6C8', 'R5C7', 'R5C9'],
  ['R7C1', 'R6C1', 'R8C1', 'R7C2'],
  ['R7C7', 'R6C7', 'R8C7', 'R7C6', 'R7C8'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...fortresses.map(cells => new GreaterThan(...cells)),
];
