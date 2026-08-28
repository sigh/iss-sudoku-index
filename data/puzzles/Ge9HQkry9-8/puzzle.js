// Title: Solver's Badge
// Author: Seren
// Video: https://www.youtube.com/watch?v=Ge9HQkry9-8
// Source: https://tinyurl.com/yc3zztxz

// Normal sudoku rules apply.
//
// Rule 2: every group of 3 consecutive cells along a drawn line sums to a
// multiple of 4, independently per group of 3 (the multiple may differ
// between overlapping groups on the same line). Encoded as Or(Sum(4)..
// Sum(24)) -- the only multiples of 4 reachable by three 1-9 digits -- over
// every sliding window of 3 consecutive cells on each line.
//
// Rule 3: for a cell in column 1, value V means that cell (row, V) holds the
// value 1; likewise column 5 -> value 5, column 9 -> value 9. This is
// exactly the built-in Indexing('C', ...) semantics (cell (R,C)=V implies
// cell (R,V)=C) applied to the cells of column C, since C is 1, 5 and 9 in
// turn -- so the "target digit" the rule names always equals the column's
// own index. The pink shading over columns 1/5/9 is decorative and needs no
// separate constraint.

const graph = cellGraph('9x9');

// The 5 drawn lines that rule 2 applies to.
const lines = [
  ['R3C6', 'R4C7', 'R4C6', 'R3C5', 'R4C4', 'R5C5', 'R6C6', 'R7C5', 'R6C4', 'R6C3', 'R7C4'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R6C2', 'R7C2', 'R8C2'],
  ['R7C3', 'R8C4', 'R8C5', 'R8C6', 'R7C7', 'R6C8'],
  ['R3C7', 'R2C6', 'R2C5', 'R2C4', 'R3C3', 'R4C2'],
];

// Multiples of 4 reachable by summing three digits from 1-9 (range 3..27).
const FOUR_MULTIPLES = [4, 8, 12, 16, 20, 24];

const lineSumConstraints = [];
for (const line of lines) {
  for (let i = 0; i + 3 <= line.length; i++) {
    const window = line.slice(i, i + 3);
    lineSumConstraints.push(
      new Or(FOUR_MULTIPLES.map(m => new Sum(m, ...window))));
  }
}

// Self-indexing columns (rule 3): one Indexing('C', ...) per column, over
// that column's own 9 cells as control cells.
const indexingConstraints = [
  new Indexing('C', ...graph.column(1)),
  new Indexing('C', ...graph.column(5)),
  new Indexing('C', ...graph.column(9)),
];

return [
  new Shape('9x9'),
  ...lineSumConstraints,
  ...indexingConstraints,
];
