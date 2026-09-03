// Title: Magic Clones?
// Author: Botaku
// Video: https://www.youtube.com/watch?v=qI-PpkB1F9g
// Source: https://app.crackingthecryptic.com/webapp/P4fBQGPP64

// Rules: Normal sudoku rules apply. Clues outside the grid give the sum of the
// cells along the indicated diagonal; digits may repeat along these diagonals.
// In addition, the grid contains two sets of clones: 8 little clones, all
// identical, of 3 cells each, and 3 big clones, all identical, of 5 cells each.
// Clones have an orthogonally connected shape and no two clones overlap. Digits
// on little clones cannot be the same if they are separated by a knight's move;
// the big clones do not touch one another orthogonally, but each of them touches
// a different number of little clones orthogonally. The grey cell belongs to one
// of the clones.
//
// Encoded here: normal sudoku, the seven givens, and the two outside diagonal
// sums.
//
// Omitted: the entire clone system -- the existence, shape, congruence,
// non-overlap and connectivity of the 8 three-cell clones and the 3 five-cell
// clones, the knight's-move rule on little-clone digits, the no-orthogonal-touch
// rule between big clones, the requirement that the three big clones touch
// pairwise different numbers of little clones, and the requirement that the grey
// cell R8C2 lies on a clone. No clone cell is drawn in the source, so all eleven
// regions are solver-discovered, and the rules do not say whether "identical"
// allows rotation and reflection or only translation.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  new Given('R1C1', 6),
  new Given('R1C9', 8),
  new Given('R5C1', 7),
  new Given('R5C5', 5),
  new Given('R9C1', 2),
  new Given('R9C5', 9),
  new Given('R9C9', 4),

  // Outside diagonals. Each arrow is drawn from the centre of an outside cell to
  // the grid corner it meets; the ray continued from that corner gives the cells.
  // Clue "13" sits above the grid between C4 and C5 and points down-right, so it
  // runs R1C5-R5C9; clue "16" sits right of R6 and points down-left, R7C9-R9C7.
  LittleKiller.fromCells(13, graph.ray('R1C5', 1, 1), geometry),
  LittleKiller.fromCells(16, graph.ray('R7C9', 1, -1), geometry),
];
