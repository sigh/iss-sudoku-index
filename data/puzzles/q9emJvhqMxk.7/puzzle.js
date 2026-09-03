// Title: 10/25/22: First Seen Odd/Even
// Author: GAS Who?
// Video: https://www.youtube.com/watch?v=q9emJvhqMxk
// Source: https://tinyurl.com/mrb57c2t

// Normal 6x6 Sudoku rules apply (rows, columns and 2x3 boxes each hold 1-6 once).
// A clue outside a row or column gives either the first odd digit or the first
// even digit seen in that line from the clue's direction. The clue's own parity
// decides which of the two is meant: an even clue value cannot be a first odd
// digit and an odd clue value cannot be a first even digit, so every clue reads
// as "the first digit sharing my parity, seen from here, is me". The rules text
// applies it that way in its own worked example ("looking at column 4 from
// below, the first even digit seen is a 2" for the even clue 2 under column 4).
const graph = cellGraph('6x6');
const reversed = (cells) => [...cells].reverse();

// Givens transcribed from the grid.
const givens = [
  ['R2C3', 3], ['R3C4', 4], ['R4C3', 6], ['R5C4', 5],
];

// The eight numbers printed around the frame, each as
// [clue value, that clue's line read inward from the clue].
const outsideClues = [
  [1, graph.row(3)],               // left of row 3
  [4, graph.row(4)],               // left of row 4
  [2, reversed(graph.row(3))],     // right of row 3
  [3, reversed(graph.row(4))],     // right of row 4
  [2, graph.column(3)],            // top of column 3
  [5, graph.column(5)],            // top of column 5
  [5, reversed(graph.column(2))],  // bottom of column 2
  [2, reversed(graph.column(4))],  // bottom of column 4
];

// Match digits of the opposite parity up to the first digit of the clue's own
// parity, which must be the clue value; the rest of the line is unrestricted.
const firstOfParity = (value) => `${value % 2 ? '[246]' : '[135]'}*${value}.*`;

return [
  new Shape('6x6'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...outsideClues.map(([value, cells]) => new Regex(firstOfParity(value), ...cells)),
];
