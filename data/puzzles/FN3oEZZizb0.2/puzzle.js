// Title: April 6, 2023: Bent Quadruples
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=FN3oEZZizb0
// Source: https://tinyurl.com/bd9brmca

// Normal sudoku on the 9x9 grid; no given digits.
//
// Arrow: the bulb (control) cell's digit equals the sum of the arm cells.
// `Arrow` takes the bulb first, then the arm cells in order, and permits
// repeats along the arm (only normal-sudoku row/column/box rules restrict
// them here). Each arrow is bent within one quadruple's 2x2 block, per the
// drawn paths -- 4 arrows cover all 4 block cells, the other 4 cover 3 of
// the 4 (transcribed from the source's `arrow[].lines`).
//
// Quadruple: `Quad(topLeftCell, ...values)` anchors at the block's top-left
// cell; all listed values must appear among its 2x2 block (transcribed from
// `quadruple[].cells`/`values`).

const arrows = [
  ['R1C4', 'R2C4', 'R2C3', 'R1C3'],
  ['R4C9', 'R4C8', 'R3C8', 'R3C9'],
  ['R9C6', 'R8C6', 'R8C7', 'R9C7'],
  ['R7C2', 'R7C1', 'R6C1', 'R6C2'],
  ['R7C4', 'R8C4', 'R8C3'],
  ['R6C7', 'R6C8', 'R7C8'],
  ['R3C6', 'R2C6', 'R2C7'],
  ['R4C3', 'R4C2', 'R3C2'],
].map(cells => new Arrow(...cells));

const quads = [
  ['R1C3', 1, 2, 3, 6],
  ['R3C8', 1, 2, 4, 7],
  ['R8C6', 1, 2, 5, 8],
  ['R6C1', 1, 2, 6, 9],
  ['R3C2', 4, 5, 8, 9],
  ['R7C3', 2, 3, 4, 5],
  ['R6C7', 3, 5, 7, 8],
  ['R2C6', 3, 4, 7, 9],
].map(([topLeft, ...values]) => new Quad(topLeft, ...values));

return [
  new Shape('9x9'),
  ...arrows,
  ...quads,
];
