// Title: Wheel Of Arrows
// Author: Aspartagcus
// Video: https://www.youtube.com/watch?v=j-FqjjjBxYg
// Source: https://app.crackingthecryptic.com/sudoku/DfPhM8T7bD

// Rules:
//   Normal sudoku rules apply. Digits on an arrow sum up to the digit in the
//   circle of that arrow. Clues outside the grid indicate the sum of the digits
//   along the indicated diagonal. Digits can repeat along such a diagonal.
// No given digits. Every drawn clue is encoded; nothing is omitted.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Transcribed from the eight drawn arrows. Each of the four circles carries two
// arrows: a one-cell arrow pointing towards the middle box and a three-cell
// arrow bending away from it. Listed as [circle, ...arm cells] in the order the
// stroke is drawn, from the circle rim outwards.
const arrows = [
  ['R3C3', 'R4C4'],
  ['R3C3', 'R4C2', 'R5C2', 'R6C2'],
  ['R3C7', 'R4C6'],
  ['R3C7', 'R2C6', 'R2C5', 'R2C4'],
  ['R7C7', 'R6C6'],
  ['R7C7', 'R6C8', 'R5C8', 'R4C8'],
  ['R7C3', 'R6C4'],
  ['R7C3', 'R8C4', 'R8C5', 'R8C6'],
];

// Transcribed from the six outside arrowheads and their printed totals. Each
// entry is [total, first diagonal cell, row step, column step]; the drawn
// arrowhead sits on the grid boundary and points along the diagonal, so the
// first cell is the one diagonally inside the corner it touches.
const diagonals = [
  [55, 'R1C1', 1, 1],   // head on the top-left corner, pointing down-right
  [53, 'R1C9', 1, -1],  // head on the top-right corner, pointing down-left
  [8, 'R1C3', 1, -1],   // head on the top edge between C3/C4, pointing down-left
  [26, 'R6C9', -1, -1], // head on the right edge between R6/R7, pointing up-left
  [15, 'R9C7', -1, 1],  // head on the bottom edge between C6/C7, pointing up-right
  [31, 'R4C1', 1, 1],   // head on the left edge between R3/R4, pointing down-right
];

return [
  new Shape('9x9'),

  ...arrows.map(cells => new Arrow(...cells)),

  ...diagonals.map(([total, start, dr, dc]) =>
    LittleKiller.fromCells(total, graph.ray(start, dr, dc), geometry)),
];
