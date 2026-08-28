// Title: Late 4 The Party
// Author: Botaku
// Video: https://www.youtube.com/watch?v=An6g3alv2Nk
// Source: https://tinyurl.com/Late4ThePartyBotaku

// Usual sudoku rules apply (default rows/columns/boxes all-different; no
// givens).
//
// Four little-killer diagonals sum to the printed totals; the ruleset states
// digits may repeat along them, so they are modelled with LittleKiller
// (repeats allowed), not a distinct-cage sum.
//
// Four congruent 7-cell regions ("the four clones", shaded grey in the
// source) hold the same digits in the same relative positions. The source
// payload's `clone` array gives three cell-for-cell pairings that chain all
// four regions together (A<->B, C<->B, D<->A); each is encoded as one
// SameValues(2, x, y) per corresponding position -- cell-wise equality, not
// a same-multiset match over the whole region.

// Clone region cell lists, transcribed from the source payload's drawn
// clone pairings, list order preserved so index i on one side pairs with
// index i on the other.
const A = ['R6C1', 'R7C1', 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C3'];
const B = ['R1C2', 'R2C2', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C4'];
const C = ['R2C7', 'R3C7', 'R3C9', 'R4C7', 'R4C8', 'R4C9', 'R5C9'];
const D = ['R5C6', 'R6C6', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C8'];

// One SameValues(2, ., .) per corresponding cell pair, for one clone
// pairing.
const clonePairs = (xs, ys) => xs.map((x, i) => new SameValues(2, x, ys[i]));

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  ...clonePairs(A, B),
  ...clonePairs(C, B),
  ...clonePairs(D, A),

  // Little-killer diagonals, one per drawn outside clue; each ray runs from
  // the entry cell to the grid boundary in the drawn direction.
  LittleKiller.fromCells(40, graph.ray('R1C5', 1, 1), geometry),
  LittleKiller.fromCells(40, graph.ray('R1C3', 1, 1), geometry),
  LittleKiller.fromCells(40, graph.ray('R7C1', -1, 1), geometry),
  LittleKiller.fromCells(25, graph.ray('R6C9', -1, -1), geometry),
];
