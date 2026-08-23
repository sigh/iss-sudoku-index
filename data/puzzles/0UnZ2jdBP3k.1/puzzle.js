// Title: Bent Diagonals Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=0UnZ2jdBP3k
// Source: https://app.crackingthecryptic.com/sudoku/d2THtpfPJB

// Normal Sudoku rules apply. There are four "bent diagonals" in the grid
// which must each contain the digits 1-9.
//
// The source draws four line strokes: two run the whole way from one grid
// corner to another via the centre cell R5C5 (top-left corner to bottom-left
// corner, and top-right corner to bottom-right corner); the other two are
// short arcs confined entirely within R5C5, one across its top edge and one
// across its bottom edge. Read together they split the two ordinary main
// diagonals (R1C1-R9C9 and R1C9-R9C1) into four 5-cell arms meeting at the
// shared centre cell R5C5, then re-pair the arms two at a time -- one arm
// from each original diagonal -- into four 9-cell paths that each turn 90
// degrees at R5C5. The two long strokes draw the left- and right-hand
// pairings directly; the two short centre arcs mark the top and bottom
// pairings, whose arms are already drawn by the long strokes on either side.

const topLeftArm = ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5'];
const topRightArm = ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5'];
const bottomLeftArm = ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5'];
const bottomRightArm = ['R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5'];

// Each bent diagonal is one arm of the R1C1-R9C9 diagonal (topLeftArm or
// bottomRightArm) paired with one arm of the R1C9-R9C1 diagonal (topRightArm
// or bottomLeftArm), sharing R5C5 once. Pairing two arms of the *same*
// original diagonal (topLeftArm with bottomRightArm, or topRightArm with
// bottomLeftArm) would just reconstruct the two ordinary straight diagonals,
// not bent ones.
const bentDiagonals = [
  [...topLeftArm, ...topRightArm.slice(0, -1).reverse()], // line 2 (top arc)
  [...topLeftArm, ...bottomLeftArm.slice(0, -1).reverse()], // line 0
  [...bottomRightArm, ...topRightArm.slice(0, -1).reverse()], // line 1
  [...bottomRightArm, ...bottomLeftArm.slice(0, -1).reverse()], // line 3 (bottom arc)
];

return [
  new Shape('9x9'),

  new Given('R1C3', 2), new Given('R1C5', 1), new Given('R1C7', 3),
  new Given('R2C4', 7), new Given('R2C6', 6),
  new Given('R3C1', 1), new Given('R3C5', 2), new Given('R3C9', 4),
  new Given('R4C2', 6), new Given('R4C8', 9),
  new Given('R5C1', 8), new Given('R5C3', 3), new Given('R5C5', 5),
  new Given('R5C7', 1), new Given('R5C9', 7),
  new Given('R6C2', 1), new Given('R6C8', 3),
  new Given('R7C1', 2), new Given('R7C5', 4), new Given('R7C9', 3),
  new Given('R8C4', 3), new Given('R8C6', 7),
  new Given('R9C3', 1), new Given('R9C5', 6), new Given('R9C7', 4),

  ...bentDiagonals.map((cells) => new AllDifferent(...cells)),
];
