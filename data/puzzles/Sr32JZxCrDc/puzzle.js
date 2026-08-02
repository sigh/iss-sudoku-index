// Title: Bag of Tricks
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=Sr32JZxCrDc
// Source: https://sudokupad.app/4ftr2ntfg4

// Normal Sudoku rules apply. The drawn blue anti-diagonal is non-repeating.
// The two drawn cages total 11; arrows have their circle followed by their arm;
// purple lines are renbans; and the three shaded-square cells are even.
const cages = [
  // Drawn 11-sum cages.
  ['R2C2', 'R2C3', 'R3C2', 'R3C3'],
  ['R7C7', 'R7C8', 'R8C7', 'R8C8'],
];

const arrows = [
  ['R5C1', 'R5C2', 'R4C2', 'R4C3'],
  ['R1C5', 'R2C5', 'R2C4', 'R3C4'],
  ['R5C9', 'R5C8', 'R6C8', 'R6C7'],
  ['R9C5', 'R8C5', 'R8C6', 'R7C6'],
  ['R7C3', 'R8C2', 'R9C1'],
];

const renbans = [
  ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5'],
  ['R4C5', 'R5C5', 'R5C6'],
  ['R3C6', 'R4C6', 'R4C7'],
];

// The grey shaded squares in the drawing.
const shadedSquares = ['R1C9', 'R3C4', 'R8C3'];

return [
  new Shape('9x9'),
  new Diagonal(1),
  ...cages.map(cells => new Cage(11, ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
  ...renbans.map(cells => new Renban(...cells)),
  ...shadedSquares.map(cell => new Regex('[2468]', cell)),
];
