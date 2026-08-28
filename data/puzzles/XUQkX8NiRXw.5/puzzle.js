// Title: March 13, 2022: Stacking
// Author: clover!
// Video: https://www.youtube.com/watch?v=XUQkX8NiRXw
// Source: https://tinyurl.com/5cxxk372

// Rules: normal sudoku rules do NOT apply. Only digits 1-6 are entered into
// the 9x9 grid; each row, column and 3x3 box contains each of 1-6 exactly
// once, and the remaining 3 cells of every row/column/box are blank.
// Whenever two filled cells are vertically adjacent, the bottom digit must
// be greater than the top digit; a blank on either side voids the
// comparison.
//
// Modeled on a Raw 9x9 grid over 0-6 (0 = blank), since the default Sudoku
// grid type always enforces 9-way all-different per row/column/box, which
// cannot hold with only 7 available values (0-6). Row/column/box content is
// stated explicitly with ContainExact: the digits 1-6 once each, plus three
// 0s. Boxes are the standard 3x3 tiling built by hand, since a Raw grid
// carries no default boxes.

const shape = new Shape('9x9', '0-6', 'Raw');
const graph = cellGraph(shape);

// Each row/column/box must hold 1-6 once each, and exactly three blanks (0).
const CONTENT = '0_0_0_1_2_3_4_5_6';
const rows = graph.rows().map(cells => new ContainExact(CONTENT, ...cells));
const cols = graph.columns().map(cells => new ContainExact(CONTENT, ...cells));

// Raw grids have no default boxes; build the standard 3x3 tiling explicitly.
const boxCells = [];
for (let boxRow = 0; boxRow < 3; boxRow++) {
  for (let boxCol = 0; boxCol < 3; boxCol++) {
    const cells = [];
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        cells.push(makeCellId(boxRow * 3 + r + 1, boxCol * 3 + c + 1));
      }
    }
    boxCells.push(cells);
  }
}
const boxes = boxCells.map(cells => new ContainExact(CONTENT, ...cells));

// Vertical-touch ordering: for each column, top-to-bottom, consecutive
// (Pair binds by list position) cells must have the lower one greater than
// the upper one, unless either is blank (0).
const verticalOrder = graph.columns().map(
  (cells, i) => new Pair(
    Pair.fnToKey((top, bottom) => top === 0 || bottom === 0 || bottom > top, shape),
    `col${i + 1}-stack`,
    ...cells));

// Givens.
const givens = [
  new Given('R2C5', 4), new Given('R2C7', 3), new Given('R2C9', 1),
  new Given('R3C6', 5), new Given('R3C8', 2),
  new Given('R4C1', 1), new Given('R4C2', 3), new Given('R4C3', 5),
  new Given('R6C7', 2), new Given('R6C8', 4), new Given('R6C9', 6),
  new Given('R7C2', 5), new Given('R7C4', 2),
  new Given('R8C1', 6), new Given('R8C3', 4), new Given('R8C5', 1),
];

return [shape, ...rows, ...cols, ...boxes, ...verticalOrder, ...givens];
