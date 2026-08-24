// Title: Return of the Pentominous Odds
// Author: Lucy Audrin
// Video: https://www.youtube.com/watch?v=gdNjBL2sLXU
// Source: https://app.crackingthecryptic.com/sudoku/3BF29n48bh

// Normal sudoku rules apply (default row/column/box all-different). In
// every 3x3 box, the odd digits form a pentomino shape (a connected region
// of 5 cells; the box always holds exactly five odd digits 1,3,5,7,9 by
// normal sudoku rules, so no shape is named beyond connectivity). The
// circled cell (grey circle, drawn art) is odd. Each inequality chevron
// (drawn art) points to the smaller of the two cells it sits between.

const graph = cellGraph('9x9');
const boxes = graph.boxes();   // 9 arrays of 9 cells, row-major within box

// ConnectedValues needs a whole var-cell group as its layer (its own
// contiguous block, with an explicit row/col shape for adjacency) -- a real
// grid box is not addressable that way except box 1. So each box gets a
// same-shaped '3x3' Var group as a shadow copy of that box's digits, linked
// cell-for-cell by equality, and ConnectedValues runs on the shadow copy's
// odd-valued cells.
const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
const shadowVars = LETTERS.map(L => new Var(L, `box ${L} shadow`, '3x3'));
const shadows = LETTERS.map((L, i) => graph.makeOverlay('V' + L, boxes[i]));

const shadowLinks = boxes.flatMap((cells, i) =>
  cells.map(cell => new SameValues(2, cell, shadows[i].at(cell))));

const ODD_DIGITS = [1, 3, 5, 7, 9];
const oddPentominoes = LETTERS.map(L => new ConnectedValues('V' + L, ODD_DIGITS, 5));

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
const givens = [
  new Given('R1C9', 5),
  new Given('R2C5', 6),
  new Given('R2C7', 2),
  new Given('R2C9', 4),
  new Given('R4C1', 2),
  new Given('R6C2', 5),
  new Given('R6C6', 1),
  new Given('R6C8', 3),
  new Given('R7C2', 2),
  new Given('R8C6', 3),
  new Given('R9C1', 7),
  new Given('R9C2', 4),
];

return [
  new Shape('9x9'),
  ...givens,
  ...shadowVars,
  ...shadowLinks,
  ...oddPentominoes,

  // The circled cell is odd. Drawn art: grey circle underlay, R1C5.
  new Given('R1C5', ...ODD_DIGITS),

  // Inequality chevrons, tip toward the smaller cell (drawn art, wayPoints
  // read as [row, col]): GreaterThan(bigger, smaller).
  new GreaterThan('R6C1', 'R5C1'),
  new GreaterThan('R5C3', 'R5C4'),
  new GreaterThan('R2C2', 'R2C3'),
  new GreaterThan('R2C4', 'R2C5'),
  new GreaterThan('R3C4', 'R3C5'),
  new GreaterThan('R3C5', 'R3C6'),
  new GreaterThan('R1C6', 'R1C5'),
];
