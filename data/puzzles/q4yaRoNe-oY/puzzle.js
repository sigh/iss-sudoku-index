// Title: Just An Anti-King Killer
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=q4yaRoNe-oY
// Source: https://app.crackingthecryptic.com/sudoku/hHfFRPBJr2

// Every answer row, column, and 3x3 box contains 1, 1, 2, 2, 3, 3, 4, 5, 6.
// Cells a king's move apart differ. The drawn six-cell cage sums to 25;
// the rules do not require its digits to be distinct.
const graph = cellGraph('9x9');
const overlay = graph.makeOverlay('VA');
const gridCells = graph.cells();
const answer = (row, col) => overlay.at(gridCells[row * 9 + col]);
const units = [
  ...Array.from({ length: 9 }, (_, row) =>
    Array.from({ length: 9 }, (_, col) => answer(row, col))),
  ...Array.from({ length: 9 }, (_, col) =>
    Array.from({ length: 9 }, (_, row) => answer(row, col))),
  ...Array.from({ length: 3 }, (_, boxRow) =>
    Array.from({ length: 3 }, (_, boxCol) =>
      Array.from({ length: 9 }, (_, i) => answer(
        boxRow * 3 + Math.floor(i / 3), boxCol * 3 + i % 3)))).flat(),
];
const kingBlocks = Array.from({ length: 8 }, (_, row) =>
  Array.from({ length: 8 }, (_, col) => [
    answer(row, col), answer(row, col + 1),
    answer(row + 1, col), answer(row + 1, col + 1),
  ])).flat();

return [
  // A fixed one-cell host supplies the 1-6 alphabet; the answer is the Var grid.
  new Shape('1x1', 6),
  overlay.toVar('answer grid'),
  new Given('R1C1', 1),
  ...units.map(unit => new ContainExact('1_1_2_2_3_3_4_5_6', ...unit)),
  ...kingBlocks.map(block => new AllDifferent(...block)),
  // Drawn cage cells, in source order.
  new Sum(25, answer(0, 4), answer(1, 4), answer(2, 4), answer(2, 3), answer(3, 4), answer(4, 4)),
];
