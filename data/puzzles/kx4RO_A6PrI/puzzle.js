// Title: Ludoku
// Author: questionable_compensation
// Video: https://www.youtube.com/watch?v=kx4RO_A6PrI
// Source: https://app.crackingthecryptic.com/sudoku/76q9qg3JDg

// Normal sudoku rules apply (default Shape('9x9') regions: rows, columns,
// 3x3 boxes). No givens.
//
// Four 12-cell lines run out from the centre cell, one per drawn colour:
//   green  -> Whisper(5): adjacent digits differ by >= 5
//   yellow -> Entropic: every 3 consecutive cells hold one of {1,2,3},
//             one of {4,5,6}, one of {7,8,9}
//   blue   -> Between: every interior cell lies strictly between the values
//             at the line's two ends
//   red    -> Modular(3): every 3 consecutive cells hold one of {1,4,7},
//             one of {2,5,8}, one of {3,6,9}
// Cell lists are transcribed from the four drawn line paths.
//
// The centre cell (R5C5) carries a 4-armed minimum marker: its digit is
// smaller than each orthogonally adjacent digit. GreaterThan binds by grid
// adjacency (not list order), so listing the four neighbours before the
// centre cell makes each neighbour > centre for every adjacent pair; the
// neighbours are not adjacent to each other, so no other pair is affected.
//
// Four of the sixteen drawn white circles show a digit; the other twelve are
// undigited and read as decoration, not clues (no rule constrains an empty
// circle). Each shown digit must appear in one of the circle's 4 touched
// cells, encoded as a single-value Quad anchored at the circle's top-left
// cell.

const green = ['R3C3', 'R2C3', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R3C2', 'R4C2', 'R5C2', 'R5C3', 'R5C4'];
const yellow = ['R4C5', 'R3C5', 'R2C5', 'R2C6', 'R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R3C8', 'R3C7'];
const blue = ['R5C6', 'R5C7', 'R5C8', 'R6C8', 'R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R8C7', 'R7C7'];
const red = ['R6C5', 'R7C5', 'R8C5', 'R8C4', 'R8C3', 'R9C3', 'R9C2', 'R9C1', 'R8C1', 'R7C1', 'R7C2', 'R7C3'];

return [
  new Shape('9x9'),

  new Whisper(5, ...green),
  new Entropic(...yellow),
  new Between(...blue),
  new Modular(3, ...red),

  new GreaterThan('R4C5', 'R6C5', 'R5C4', 'R5C6', 'R5C5'),

  new Quad('R1C1', 7),
  new Quad('R1C8', 6),
  new Quad('R8C1', 5),
  new Quad('R8C8', 8),
];
