// Title: Little Miracle
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=Aq5OlY57S4k
// Source: https://sudokupad.app/zos75s0s5z

// Only the printed given is encoded. The region, loop, row/column, and diagonal
// rules are omitted pending a source-consistent interpretation.
const shape = new Shape('9x9');
const answer = new Var('G', 'Little Miracle answer', '9x9');
const a = (row, col) => answer.cell(row, col);

// Pin the otherwise unused main grid to a Latin square.
const parkedGrid = Array.from({length: 9}, (_, r) =>
  Array.from({length: 9}, (_, c) => new Given(makeCellId(r + 1, c + 1), (r + c) % 9 + 1)));

return [
  shape,
  new NoBoxes(),
  ...parkedGrid,
  answer,
  new Given(a(8, 7), 7),
];
