// Title: Minesweeper Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ArgRV3ZugGg
// Source: https://cracking-the-cryptic.web.app/sudoku/8qdnRF7Gg3

// Rules (transcribed from the video's on-screen rules panel):
//   "Each row, column and box contains the numbers 1-7 and TWO mines. Grey
//   cells are the ONLY cells that give the correct number of mines in
//   adjacent cells (including diagonally adjacent cells)."
// So every row/column/box holds the digits 1-7 once each plus two mine
// cells (9 cells total); a mine cell carries no digit. Grey cells always
// hold a digit (never a mine) equal to the count of mines among their up to
// eight king-move neighbours; a non-grey digit cell's value carries no such
// meaning.
//
// Rows repeat a "value" (two mines share no digit at all), so this is not a
// latin-square grid: built on the Raw grid type, with mines held as digit 0
// and the real digits shifted onto 1-7. Row/column/box membership (1-7
// once, 0 exactly twice) is then a literal ContainExact multiset per house,
// not an all-different.
const shape = new Shape('9x9', '0-7', 'Raw');
const graph = cellGraph(shape);
const allCells = graph.cells();
const boxes = [];
for (const topRow of [1, 4, 7]) {
  for (const topCol of [1, 4, 7]) {
    boxes.push(graph.block(makeCellId(topRow, topCol), 3, 3));
  }
}
const houses = [...graph.rows(), ...graph.columns(), ...boxes];

// Givens: normal sudoku digits, transcribed from the puzzle's drawn cells.
const givens = {
  R1C6: 3, R2C5: 6, R4C1: 1, R5C2: 5, R5C8: 7, R6C9: 2, R8C5: 1, R9C4: 3,
};

// Grey single-cell shading (#CFCFCF), transcribed from the puzzle's drawn
// geometry; disjoint from the givens above.
const greyCells = [
  'R1C2', 'R1C4', 'R3C1', 'R3C3', 'R2C6', 'R2C8', 'R4C5', 'R4C6', 'R6C5',
  'R6C6', 'R5C7', 'R5C9', 'R5C3', 'R7C8', 'R7C7', 'R8C7', 'R9C7',
];

// Boolean mine-flag overlay, one per grid cell: 1 iff that cell is a mine.
const flagOverlay = graph.makeOverlay('VF');
const flags = flagOverlay.toVar('mine flags');

return [
  shape,
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),

  // 1-7 once each plus two mines (0) per row, column and box.
  ...houses.map(house => new ContainExact('0_0_1_2_3_4_5_6_7', ...house)),

  flags,
  // Grey cells always hold a digit -- they are never themselves a mine.
  ...greyCells.map(cell => new Given(cell, 1, 2, 3, 4, 5, 6, 7)),

  // Tie each flag to its own cell: mine (0) <-> flag 1, digit (1-7) <-> flag
  // 0. There is no native way to make the neighbour-count rule below read
  // "is this cell a mine" directly off the 0-7 grid value, hence this
  // explicit biconditional.
  ...allCells.map(cell => {
    const flag = flagOverlay.at(cell);
    return new Or([
      new And([new Given(cell, 0), new Given(flag, 1)]),
      new And([new Given(cell, 1, 2, 3, 4, 5, 6, 7), new Given(flag, 0)]),
    ]);
  }),

  // Each grey cell's digit equals the number of mine flags among its
  // king-move neighbours.
  ...greyCells.map(cell => new EqualSum(
    [cell], flagOverlay.at(graph.kingNeighbours(cell)))),
];
