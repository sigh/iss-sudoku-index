// Title: Fortune Cookie II
// Author: pieguy
// Video: https://www.youtube.com/watch?v=gD7gio1xuvU
// Source: https://sudokupad.app/hyeayc375h

// Normal sudoku rules apply (default row/column/box all-different).
// White dot: WhiteDot enforces the two cells are consecutive.
// Black dot: BlackDot enforces one cell is double the other.
// "Orthogonally adjacent digits may not sum to 7 or 13" is a separate global
// rule applying to every orthogonally adjacent cell pair in the grid,
// including dotted pairs (a dot's consecutive/ratio relation does not exempt
// it from this sum restriction). Encoded as a Pair over every edge from
// cellGraph, rather than hand-enumerating the 144 edges.

// White-dot pairs, one per box, from the drawn white-dot clues.
const WHITE_DOTS = [
  ['R1C2', 'R1C3'], ['R2C1', 'R2C2'], ['R3C2', 'R3C3'], // box 1
  ['R1C4', 'R1C5'], ['R1C6', 'R2C6'], ['R3C4', 'R3C5'], // box 2
  ['R1C7', 'R2C7'], ['R1C8', 'R1C9'], ['R3C7', 'R3C8'], // box 3
  ['R4C1', 'R5C1'], ['R4C3', 'R5C3'], ['R6C1', 'R6C2'], // box 4
  ['R4C5', 'R5C5'], ['R4C6', 'R5C6'], ['R6C5', 'R6C6'], // box 5
  ['R4C7', 'R5C7'], ['R4C8', 'R5C8'], ['R6C7', 'R6C8'], // box 6
  ['R7C2', 'R7C3'], ['R8C2', 'R8C3'], ['R9C2', 'R9C3'], // box 7
  ['R7C5', 'R7C6'], ['R8C4', 'R8C5'], ['R8C6', 'R9C6'], // box 8
  ['R7C7', 'R8C7'], ['R7C8', 'R7C9'], ['R9C8', 'R9C9'], // box 9
];

// Black-dot pair, from the drawn black-dot clue (box 5).
const BLACK_DOTS = [
  ['R5C4', 'R6C4'],
];

// Every orthogonal edge of the grid, as two Replicate templates (rightward
// and downward offset) rather than 144 hand-stamped Pair copies: one
// template per relative offset, shifted onto every cell that has a
// same-offset in-grid neighbour.
const graph = cellGraph('9x9');
const notSum7Or13Key = Pair.fnToKey((a, b) => a + b !== 7 && a + b !== 13, 9);
const rightTargets = graph.cells().filter(c => graph.step(c, 0, 1));
const downTargets = graph.cells().filter(c => graph.step(c, 1, 0));

return [
  new Shape('9x9'),
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
  graph.makeReplicate(
    new Pair(notSum7Or13Key, 'not sum 7 or 13', 'R1C1', 'R1C2'), rightTargets),
  graph.makeReplicate(
    new Pair(notSum7Or13Key, 'not sum 7 or 13', 'R1C1', 'R2C1'), downTargets),
];
