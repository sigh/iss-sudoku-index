// Title: The Ring of Cupidity
// Author: Pallando
// Video: https://www.youtube.com/watch?v=6Im6GFrgxM0
// Source: https://app.crackingthecryptic.com/sudoku/rTD6GNDFqN

// Normal sudoku rules apply. Digits along an arrow sum to the number in the
// attached circle, or pill. Digits marked in circles must appear in the
// surrounding four cells.
//
// Eight arrows: one has a 2-digit pill bulb (R2C1 tens, R2C2 units, given as
// 4 and 2) whose 16-cell path traces the ring around the R3-R7/C3-C7 block,
// giving the puzzle its title. The other seven have a plain single-cell
// circle bulb.
//
// The four corner "circles" clue (black corner dot plus two 2-digit edge
// circles) is encoded as a multi-value Given on each of the four cells
// touching that corner, restricting each cell's candidates to the four named
// digits drawn in the two edge circles at that corner. Combined with the
// existing box all-different (all four cells share a box), this forces the
// block to contain exactly that 4-digit set, matching "digits marked in
// circles must appear in the surrounding four cells".

return [
  new Shape('9x9'),

  new Given('R2C1', 4),
  new Given('R2C2', 2),

  new PillArrow(
    2, 'R2C1', 'R2C2',
    'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3',
    'R7C4', 'R7C5', 'R7C6', 'R7C7',
    'R6C7', 'R5C7', 'R4C7', 'R3C7',
    'R3C6', 'R3C5', 'R3C4'),

  new Arrow('R1C4', 'R1C3', 'R1C2'),
  new Arrow('R1C6', 'R2C6', 'R3C6'),
  new Arrow('R3C9', 'R2C9', 'R1C9'),
  new Arrow('R6C5', 'R5C5', 'R4C5', 'R3C5'),
  new Arrow('R4C6', 'R4C7', 'R4C8'),
  new Arrow('R6C9', 'R6C8', 'R6C7'),
  new Arrow('R8C4', 'R7C4', 'R6C4'),

  // Corner circle at R2C2/R2C3/R3C2/R3C3: edge circles "2 5" and "8 9".
  new Given('R2C2', 2, 5, 8, 9),
  new Given('R2C3', 2, 5, 8, 9),
  new Given('R3C2', 2, 5, 8, 9),
  new Given('R3C3', 2, 5, 8, 9),

  // Corner circle at R2C7/R2C8/R3C7/R3C8: edge circles "1 4" and "6 9".
  new Given('R2C7', 1, 4, 6, 9),
  new Given('R2C8', 1, 4, 6, 9),
  new Given('R3C7', 1, 4, 6, 9),
  new Given('R3C8', 1, 4, 6, 9),

  // Corner circle at R7C7/R7C8/R8C7/R8C8: edge circles "3 5" and "6 7".
  new Given('R7C7', 3, 5, 6, 7),
  new Given('R7C8', 3, 5, 6, 7),
  new Given('R8C7', 3, 5, 6, 7),
  new Given('R8C8', 3, 5, 6, 7),

  // Corner circle at R7C2/R7C3/R8C2/R8C3: edge circles "4 5" and "7 8".
  new Given('R7C2', 4, 5, 7, 8),
  new Given('R7C3', 4, 5, 7, 8),
  new Given('R8C2', 4, 5, 7, 8),
  new Given('R8C3', 4, 5, 7, 8),
];
