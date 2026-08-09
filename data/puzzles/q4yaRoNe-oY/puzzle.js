// Title: Just An Anti-King Killer
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=q4yaRoNe-oY
// Source: https://app.crackingthecryptic.com/sudoku/hHfFRPBJr2

// Every answer row, column, and 3x3 box contains 1, 1, 2, 2, 3, 3, 4, 5, 6.
// Cells a king's move apart differ. The drawn six-cell cage sums to 25;
// the rules do not require its digits to be distinct.
const shape = new Shape('9x9', 6, 'Raw');
const graph = cellGraph(shape);
const boxes = [];
for (let r = 1; r <= 9; r += 3)
  for (let c = 1; c <= 9; c += 3)
    boxes.push(graph.block(makeCellId(r, c), 3, 3));
const units = [...graph.rows(), ...graph.columns(), ...boxes];
// Slide a 2x2 window from every cell (self, right, down, down-right); each
// king-adjacent pair falls inside exactly one window, off-grid members drop.
const kingBlocks = graph.cells()
  .map(cell => [cell, graph.step(cell, 0, 1), graph.step(cell, 1, 0), graph.step(cell, 1, 1)]
    .filter(c => c !== null))
  .filter(block => block.length > 1);

return [
  shape,
  ...units.map(unit => new ContainExact('1_1_2_2_3_3_4_5_6', ...unit)),
  ...kingBlocks.map(block => new AllDifferent(...block)),
  // Drawn cage cells, in source order.
  new Sum(25, 'R1C5', 'R2C5', 'R3C5', 'R3C4', 'R4C5', 'R5C5'),
];
