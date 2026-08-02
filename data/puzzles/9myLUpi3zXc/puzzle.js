// Title: Intens Knights
// Author: Vesafary
// Video: https://www.youtube.com/watch?v=9myLUpi3zXc
// Source: https://app.crackingthecryptic.com/Hph6RP8Ggp

// Normal Sudoku; knight-move cells do not sum to 10; the two blue diagonals
// have no repeats; grey thermometers rise from their circles; and the arrow
// arm sums to its white circle.
const graph = cellGraph('9x9');
const notTen = Pair.fnToKey((a, b) => a + b !== 10, 9);
// One translated pair family per forward knight offset covers every undirected
// knight edge exactly once.
const starts = (rows, cols) => graph.cells().filter(cell => {
  const {row, col} = parseCellId(cell);
  return row <= rows && col <= cols;
});
const knightRules = [
  graph.makeReplicate(new Pair(notTen, 'knight-not-10', 'R1C1', 'R2C3'), starts(8, 7)),
  graph.makeReplicate(new Pair(notTen, 'knight-not-10', 'R1C1', 'R3C2'), starts(7, 8)),
  graph.makeReplicate(new Pair(notTen, 'knight-not-10', 'R1C3', 'R2C1'), starts(8, 7)),
  graph.makeReplicate(new Pair(notTen, 'knight-not-10', 'R3C1', 'R1C2'), starts(7, 8)),
];

// The three lists are the drawn grey thermometers, transcribed bulb-first.
const thermometers = [
  ['R3C3', 'R2C3', 'R3C2', 'R3C1', 'R2C2'],
  ['R3C7', 'R2C7', 'R3C8', 'R3C9', 'R2C8', 'R1C7'],
  ['R7C2', 'R8C3', 'R8C2', 'R8C1', 'R9C2'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 4),
  new Given('R1C9', 7),
  new Given('R5C5', 5),
  ...knightRules,
  // Diagonal takes a numeric direction: -1 is the '\' diagonal R1C1-R9C9,
  // +1 is the '/' diagonal R1C9-R9C1. Both are drawn in blue.
  new Diagonal(-1),
  new Diagonal(1),
  ...thermometers.map(cells => new Thermo(...cells)),
  new Arrow('R2C4', 'R3C4', 'R2C5', 'R2C6'),
];
