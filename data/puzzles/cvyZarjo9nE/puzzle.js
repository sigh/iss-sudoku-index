// Title: Chess & Checkers
// Author: LJC
// Video: https://www.youtube.com/watch?v=cvyZarjo9nE
// Source: https://sudokupad.app/qs3bg2421i

// Normal 6x6 sudoku rules (rows, columns, and the default 2x3 boxes, which
// match the puzzle's own drawn regions) come from the default Shape.
// Knight's Move: cells a knight's move apart may not share a digit.
// Little Killer: digits along each marked diagonal sum to the given total.
//
// Two of the five outside badges both read "X" instead of a number. Ray-casting
// each arrow's own drawn direction to the grid edge (down-right from both
// R6C1 and R1C6, the grid's two true corners on that heading) shows each of
// those two diagonals is just its single corner cell -- so "X" is simply the
// shared digit of R6C1 and R1C6, and the puzzle never states it more directly
// than that. The other two little-killer badges, marked "X+5" and "X+1", give
// that same digit's diagonal total plus a fixed offset; the fifth is a plain
// fixed total. Encoded as an explicit equality between the two corner cells
// and as Sum constraints that reference R6C1 as the X term for the offset
// diagonals.

const graph = cellGraph('6x6');
const geometry = cellGeometry('6x6');

return [
  new Shape('6x6'),
  new AntiKnight(),

  // "X" diagonals: 1-cell rays down-right from the two true corners (arrow
  // heading taken from the drawn arrowheads); the ray exits the grid
  // immediately from each, so R6C1 and R1C6 are each their own whole
  // diagonal and must share the same total.
  new SameValues(2, 'R6C1', 'R1C6'),

  // "X+5" diagonal: down-right ray from R1C4 to the right edge.
  new Sum(5, ...graph.ray('R1C4', 1, 1), ['R6C1', -1]),

  // "X+1" diagonal: down-right ray from R4C1 to the bottom edge.
  new Sum(1, ...graph.ray('R4C1', 1, 1), ['R6C1', -1]),

  // "18" diagonal: down-left ray from R2C6 to the bottom edge.
  LittleKiller.fromCells(18, graph.ray('R2C6', 1, -1), geometry),
];
