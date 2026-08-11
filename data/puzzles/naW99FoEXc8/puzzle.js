// Title: Sagitta
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=naW99FoEXc8
// Source: https://app.crackingthecryptic.com/sudoku/J22PtJqGP7

// Rules encoded: normal sudoku (standard rows/columns/3x3 boxes, matching the
// payload's drawn regions); each arrow's arm digits sum to its circled digit;
// and, as a blanket rule with no drawn markers, every pair of orthogonally
// adjacent cells anywhere in the grid must not sum to 5 or 10.

// Arrows: circle cell first, then arm cells, per the drawn geometry.
const arrows = [
  new Arrow('R5C2', 'R5C1', 'R4C2', 'R5C3'),
  new Arrow('R5C6', 'R4C6', 'R4C5'),
  new Arrow('R6C4', 'R5C4', 'R5C5'),
  new Arrow('R4C8', 'R4C9', 'R5C8', 'R4C7'),
  new Arrow('R7C9', 'R6C8', 'R6C7'),
  new Arrow('R7C6', 'R7C7', 'R7C8'),
  new Arrow('R7C5', 'R8C5', 'R9C5'),
  new Arrow('R9C1', 'R8C2', 'R7C3'),
];

// Global "not 5, not 10" adjacent-sum rule: a negated-predicate Pair applied
// to every orthogonal edge in the grid. One horizontal-offset template and
// one vertical-offset template, each Replicated onto every cell that has a
// right (resp. down) neighbour, covers all 144 edges exactly once.
const notFiveOrTen = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);
const graph = cellGraph('9x9');
const rightEdgeStarts = graph.cells().filter(c => graph.step(c, 0, 1));
const downEdgeStarts = graph.cells().filter(c => graph.step(c, 1, 0));
const adjacentSumBans = [
  graph.makeReplicate(
    new Pair(notFiveOrTen, 'not 5 or 10', 'R1C1', 'R1C2'), rightEdgeStarts),
  graph.makeReplicate(
    new Pair(notFiveOrTen, 'not 5 or 10', 'R1C1', 'R2C1'), downEdgeStarts),
];

return [
  new Shape('9x9'),
  ...arrows,
  ...adjacentSumBans,
];
