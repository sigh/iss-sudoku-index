// Title: Trio of Trios A
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=8Dt_fnJaQJs
// Source: https://app.crackingthecryptic.com/sudoku/rNFffthDhj

// One puzzle across three 6x6 grids (A, B, C), each published on its own page:
//   A https://app.crackingthecryptic.com/sudoku/rNFffthDhj
//   B https://app.crackingthecryptic.com/sudoku/bMtQ29Qq7D
//   C https://app.crackingthecryptic.com/sudoku/G7MfBMnB8h
// Grid A is the main grid; grids B and C are full-grid Var overlays.
// Rules:
// - Every grid: 1-6 in each row, column and 2x3 box.
// - Grid A: digits along an arrow sum to the number in the circle.
// - Grid B: digits in a cage must not repeat, and sum to the total given.
// - Grid C: digits on a marked diagonal must not repeat (both diagonals drawn).
// - If two cells in any two grids have the same letter written in them, those
//   cells must contain the same digit.

const shape = new Shape('6x6');
const graph = cellGraph(shape);
const gridB = graph.makeOverlay('VB');
const gridC = graph.makeOverlay('VC');

// Latin-square houses of the two overlay grids (grid A's come from the Shape).
const overlayHouses = [gridB, gridC].flatMap(grid =>
  grid.rowsColumnsBoxes().map(house => new AllDifferent(...house)));

// Grid A arrows, circle first, from page A's drawn arrows.
const arrows = [
  ['R3C2', 'R2C3', 'R1C4'],
  ['R3C3', 'R2C4', 'R1C5', 'R1C6'],
  ['R4C4', 'R5C3', 'R6C2', 'R6C1'],
  ['R6C3', 'R5C4', 'R4C5'],
].map(cells => new Arrow(...cells));

// Grid B killer cages [total, cells], from page B's cage list.
const cages = [
  [8, ['R2C1', 'R3C1']],
  [6, ['R3C2', 'R2C2', 'R2C3']],
  [7, ['R2C4', 'R2C5', 'R3C5']],
  [10, ['R2C6', 'R3C6']],
  [7, ['R4C2', 'R5C2', 'R5C3']],
  [15, ['R5C4', 'R5C5', 'R4C5']],
].map(([total, cells]) => new Cage(total, ...gridB.at(cells)));

// Grid C givens, from page C's given digits.
const givens = [['R1C3', 3], ['R2C4', 3], ['R5C3', 6], ['R6C4', 1]]
  .map(([cell, value]) => new Given(gridC.at(cell), value));

// Grid C's two corner-to-corner diagonals.
const diagonals = [
  [1, 2, 3, 4, 5, 6].map(i => makeCellId(i, i)),
  [1, 2, 3, 4, 5, 6].map(i => makeCellId(i, 7 - i)),
].map(cells => new AllDifferent(...gridC.at(cells)));

// Letter positions, identical on every page that prints a letter: A-D appear in
// grids A and C, E-H in grids B and C.
const letters = {
  A: 'R1C1', B: 'R2C1', C: 'R5C6', D: 'R6C6',
  E: 'R1C6', F: 'R3C1', G: 'R4C6', H: 'R6C1',
};
const sameLetter = [
  ...['A', 'B', 'C', 'D'].map(l => [letters[l], gridC.at(letters[l])]),
  ...['E', 'F', 'G', 'H'].map(l => [gridB.at(letters[l]), gridC.at(letters[l])]),
].map(pair => new SameValues(2, ...pair));

return [
  shape,
  gridB.toVar('Grid B'),
  gridC.toVar('Grid C'),
  ...overlayHouses,
  ...arrows,
  ...cages,
  ...givens,
  ...diagonals,
  ...sameLetter,
];
