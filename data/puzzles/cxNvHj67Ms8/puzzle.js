// Title: RAT RUN 24: Between You and Me
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=cxNvHj67Ms8
// Source: https://sudokupad.app/1b3iaeit8s

// Normal sudoku rules apply (standard rows/columns/3x3 boxes).
//
// This is a Rat Run maze puzzle: two rats (Finkz at R8C7, Phinx at R9C7)
// must each find a self-avoiding path through a walled maze to a shared
// cupcake cell (R8C8), never crossing a thick maze wall, never crossing
// their own or each other's path, and converging only at the cupcake cell.
// Movement is orthogonal, plus diagonal through any open 2x2 space, except
// diagonally through a round wall-spot on a cell corner. The grid is also
// divided into cages (no repeats, all cages share one deduced total); an
// electricity-bolt cell in a cage marks its shock value, and a cage whose
// shock value is 5+ may not be entered by either rat.
//
// None of the maze/path/cage machinery above is encoded here: the path is
// solver-discovered and diagonal movement makes orthogonal-adjacency
// connectivity unsound, and the cage boundaries are carried by the same
// unrecovered wall geometry.
//
// FORBIDDEN DOORS: a red X between two digits means they sum to 10. The
// puzzle draws exactly one such X, on the shared edge between the two
// rats' starting cells (R8C7/R9C7) -- a plain, path-independent digit pair.
return [
  new Shape('9x9'),
  new X('R8C7', 'R9C7'),
];
