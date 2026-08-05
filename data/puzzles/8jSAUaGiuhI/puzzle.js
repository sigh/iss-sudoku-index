// Title: Diagonal movements
// Author: Adem Jaziri
// Video: https://www.youtube.com/watch?v=8jSAUaGiuhI
// Source: https://app.crackingthecryptic.com/sudoku/BjQP3L8QFr

// Standard Sudoku, anti-knight, the two drawn cages, the six outside diagonal
// sums, and the pink diagonal containing exactly two distinct digits.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// From the drawn cage outlines and their top-left totals.
const cages = [
  new Sum(22, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Sum(20, 'R8C8', 'R8C9', 'R9C8'),
];

// From the six outside arrowheads and their printed totals.
const littleKillers = [
  LittleKiller.fromCells(30, graph.ray('R5C1', -1, 1), geometry),
  LittleKiller.fromCells(20, graph.ray('R9C1', -1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R9C4', -1, 1), geometry),
  LittleKiller.fromCells(6, graph.ray('R9C7', -1, 1), geometry),
  LittleKiller.fromCells(22, graph.ray('R1C4', 1, 1), geometry),
  LittleKiller.fromCells(32, graph.ray('R5C9', -1, -1), geometry),
];

// The pink stroke covers these cells. Each alternative permits one digit pair
// everywhere on the line and requires both members of that pair to occur.
const pinkDiagonal = ['R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'];
const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const twoDistinct = new Or(
  digits.flatMap(a => digits.filter(b => b > a).map(b => new And([
    ...pinkDiagonal.map(cell => new Given(cell, a, b)),
    new ContainAtLeast(`${a}_${b}`, ...pinkDiagonal),
  ])))
);

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages,
  ...littleKillers,
  twoDistinct,
];
