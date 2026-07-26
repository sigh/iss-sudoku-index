// Title: Euler's Constant
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=QnxNxHWRj2U
// Source: https://sudokupad.app/xfiaf0aoqm

// Rules encoded:
// - Normal sudoku rules (default row/column/box).
// - Green line: adjacent digits differ by at least 5 -- Whisper(5).
// - No two orthogonally connected cells sum to 5 -- a global negative,
//   applied to every orthogonal domino in the grid (not just marked ones).
// - Black dot: one of the pair is double the other -- BlackDot. The rules
//   name only black dots, so the single drawn dot uses that reading; the
//   rule explicitly allows undotted pairs to also satisfy the ratio, so no
//   negative constraint is added for unmarked pairs.

const graph = cellGraph();
const allCells = graph.cells();

// The green line's drawn path interpolates to this cell sequence; the final
// cell repeats an earlier one, so the line revisits R6C3 and that cell gets
// a difference constraint against three neighbours (R7C3, R6C4, and R5C4)
// instead of two.
const greenLine = new Whisper(
  5, 'R7C5', 'R8C4', 'R7C3', 'R6C3', 'R6C4', 'R6C5', 'R5C4', 'R6C3');

// The one drawn black dot, between R8C1 and R9C1.
const blackDot = new BlackDot('R8C1', 'R9C1');

// Every orthogonally adjacent cell pair in the grid must not sum to 5 --
// replicated from one horizontal and one vertical template across every
// valid origin, rather than hand-listing 144 edges.
const noSum5Key = Pair.fnToKey((a, b) => a + b !== 5, 9);
const rightTargets = allCells.filter(cell => graph.block(cell, 1, 2) !== null);
const downTargets = allCells.filter(cell => graph.block(cell, 2, 1) !== null);
const noSum5Horizontal = graph.makeReplicate(
  [new Pair(noSum5Key, 'no orthogonal sum of 5', 'R1C1', 'R1C2')],
  rightTargets,
);
const noSum5Vertical = graph.makeReplicate(
  [new Pair(noSum5Key, 'no orthogonal sum of 5', 'R1C1', 'R2C1')],
  downTargets,
);

return [
  new Shape('9x9'),

  new Given('R1C5', 8), new Given('R2C4', 1), new Given('R2C6', 2),
  new Given('R3C3', 7), new Given('R3C7', 8), new Given('R4C2', 2),
  new Given('R4C8', 1), new Given('R5C9', 8), new Given('R6C9', 2),
  new Given('R7C8', 8), new Given('R8C7', 4), new Given('R9C6', 5),

  greenLine,
  blackDot,
  noSum5Horizontal,
  noSum5Vertical,
];
