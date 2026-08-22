// Title: No Squares
// Author: Joe Moed
// Video: https://www.youtube.com/watch?v=f_3wrcDqZls
// Source: https://app.crackingthecryptic.com/sudoku/HD9TQDhLqp

// Normal sudoku rules apply.
//
// No-squares adjacency (global, every orthogonal pair in the grid): reading
// two orthogonally neighbouring cells as a two-digit number, in either
// direction, must not give a perfect square. With digits 1-9 (no zero) the
// only such squares are 16, 25, 36, 49, 64, 81, so e.g. 1 can never sit next
// to 6 (16) and 6 can never sit next to 4 (64), independently of 3 next to 6
// (36).
//
// Marked cages are drawn with no printed total: the rule itself supplies
// the total, which is why none is printed. The 4-cell cage's distinctness
// comes from the killer-cage reading of a marked, undotted cage.

const isSquare = (n) => Number.isInteger(Math.sqrt(n));
// Forbid a pair if either concatenation order reads as a two-digit square.
const noSquareKey = Pair.fnToKey(
  (a, b) => !isSquare(10 * a + b) && !isSquare(10 * b + a), 9);

// One Replicate per offset (right, down) shifts a single template Pair over
// every cell that has that neighbour, instead of listing 144 individual
// Pair constraints for the same relation.
const graph = cellGraph('9x9');
const rightOrigins = graph.cells().filter((cell) => graph.step(cell, 0, 1));
const downOrigins = graph.cells().filter((cell) => graph.step(cell, 1, 0));
const noSquares = [
  graph.makeReplicate(
    new Pair(noSquareKey, 'No squares', 'R1C1', 'R1C2'), rightOrigins),
  graph.makeReplicate(
    new Pair(noSquareKey, 'No squares', 'R1C1', 'R2C1'), downOrigins),
];

// Single-cell cage (R1C6): its "sum" is just the cell's value, so it must
// itself be a square digit.
const singleCellCage = new Given('R1C6', 1, 4, 9);

// 4-cell cage (R6C5-R9C5): distinct digits (killer-cage reading) whose sum
// is a square. Four distinct digits from 1-9 sum to between 10 (1+2+3+4) and
// 30 (6+7+8+9); the only squares in that range are 16 and 25.
const fourCellCage = ['R6C5', 'R7C5', 'R8C5', 'R9C5'];
const fourCellCageConstraints = [
  new AllDifferent(...fourCellCage),
  new Or([new Sum(16, ...fourCellCage), new Sum(25, ...fourCellCage)]),
];

return [
  new Shape('9x9'),

  new Given('R2C8', 6),
  new Given('R3C3', 3),
  new Given('R5C1', 4),
  new Given('R5C3', 9),
  new Given('R5C9', 2),
  new Given('R6C3', 5),
  new Given('R6C5', 7),
  new Given('R6C8', 4),
  new Given('R8C1', 3),
  new Given('R8C2', 8),
  new Given('R8C7', 1),

  singleCellCage,
  ...fourCellCageConstraints,

  ...noSquares,
];
