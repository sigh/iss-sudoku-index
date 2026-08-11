// Title: Tiger
// Author: Aspartagcus
// Video: https://www.youtube.com/watch?v=PJrf30wExkA
// Source: https://app.crackingthecryptic.com/sudoku/jrB7Q9FQqh

// Normal sudoku rules apply. Four killer cages: the digits in each cage sum
// to the number printed in its upper-left cell (Cage enforces both the sum
// and no repeated digit within the cage; the two multi-cell cages' cells
// already share a box or a row, so the no-repeat part is redundant with
// base sudoku and only the sum is new information). Green lines are German
// whisper lines: neighbouring digits along a line differ by at least 5.
//
// Three of the six drawn line strokes join into two branching figures
// (one set of strokes shares cells at R2C5 and R3C5; another set shares a
// cell at R5C5) rather than three separate simple lines. Whisper enforces
// only its own consecutive-pair chain, so each branching figure is split at
// its branch cell(s) into non-overlapping simple-path segments that together
// cover every drawn edge exactly once (16 edges for the R2C5/R3C5 figure,
// 10 edges for the R5C5 figure).

const cages = [
  ['R2C3'],
  ['R4C3'],
  ['R6C1', 'R6C2', 'R6C3'],
  ['R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8'],
];
const cageSums = [1, 2, 20, 22];

// Branching figure at R2C5 (degree 3) and R3C5 (degree 3), drawn as three
// touching strokes: R1C5-R2C5-R3C5, R2C5-R2C6, and R4C8..R3C5..R9C1.
// Split into 3 simple paths covering all 16 edges once, cut at both branch
// cells so no path revisits a cell.
const whiskerFigureA = [
  ['R2C6', 'R2C5', 'R1C5'],
  ['R2C5', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C1'],
  ['R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C8'],
];

// Branching figure at R5C5 (degree 4), drawn as two touching strokes:
// R5C3-R5C4-R5C5-R5C6-R5C7 and R4C5-R5C5-R6C5-R6C6-R6C7-R6C8-R5C8.
// Split into 2 simple paths covering all 10 edges once, cut at the branch
// cell.
const whiskerFigureB = [
  ['R5C3', 'R5C4', 'R5C5', 'R4C5'],
  ['R5C7', 'R5C6', 'R5C5', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R5C8'],
];

// The sixth drawn stroke: a single simple path, no branching.
const whiskerLineC = [
  'R9C3', 'R8C4', 'R7C4', 'R7C5', 'R7C6', 'R8C6', 'R9C6', 'R9C7', 'R8C8',
];

return [
  ...cages.map((cells, i) => new Cage(cageSums[i], ...cells)),
  ...whiskerFigureA.map(cells => new Whisper(5, ...cells)),
  ...whiskerFigureB.map(cells => new Whisper(5, ...cells)),
  new Whisper(5, ...whiskerLineC),
];
