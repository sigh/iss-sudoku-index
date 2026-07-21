// Title: Pink Haze
// Author: Buttons
// Video: https://www.youtube.com/watch?v=HibdtVhbgVc
// Source: https://sudokupad.app/gts1vy5zk4

// Normal Sudoku rules are supplied by the 9x9 shape.
const oddCells = ['R2C2', 'R2C8', 'R8C2', 'R8C8'];
const evenCells = ['R2C5', 'R5C2', 'R5C8', 'R8C5'];

const blackDots = [
  ['R5C2', 'R6C2'],
  ['R6C2', 'R6C3'],
  ['R6C3', 'R6C4'],
];

const palindrome = [
  'R5C2', 'R6C2', 'R6C3', 'R6C4', 'R7C4',
  'R7C5', 'R8C6', 'R8C7', 'R7C6',
];

const arrows = [
  ['R5C5', 'R5C4', 'R4C3'],
  ['R5C5', 'R4C5', 'R3C5', 'R2C5'],
  ['R5C5', 'R5C6', 'R4C6'],
];

const betweenLine = [
  'R7C7', 'R8C7', 'R9C7', 'R9C6', 'R9C5', 'R9C4',
];

const pinkCells = [
  'R1C1', 'R1C9', 'R3C5', 'R5C3', 'R5C5',
  'R5C7', 'R7C5', 'R9C1', 'R9C9',
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  new Diagonal(-1),
  new Diagonal(1),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  new Palindrome(...palindrome),
  ...arrows.map(cells => new Arrow(...cells)),
  new Between(...betweenLine),
  new AllDifferent(...pinkCells),
];
