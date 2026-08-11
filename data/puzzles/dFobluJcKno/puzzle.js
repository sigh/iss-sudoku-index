// Title: Tennis Anyone?
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=dFobluJcKno
// Source: https://app.crackingthecryptic.com/sudoku/mq6MdnhmtD

// Normal sudoku rules apply (9x9, standard rows/columns/boxes, no givens).
// "The numbers in the balls (circles) must appear in the four surrounding
// cells" -- one Quad per drawn ball, anchored at the intersection's
// top-left cell.
// "One racquet (grey line) must consist of all odd numbers and the other
// racquet (grey line) must have all even numbers" -- the two grey lines are
// visually identical (same colour/thickness, 180-degree rotations of each
// other) and the rule names neither one, so which racquet is odd and which
// is even is left open: encode both assignments as an Or.
// "Digits do not repeat on each marked diagonal" -- the two drawn diagonal
// lines are exactly the grid's main and anti diagonals.

// Balls: each ball's intersection cells (the main corner circle plus its
// satellite digit circles at that same intersection).
const quads = [
  ['R1C1', [1]],
  ['R2C3', [2, 7, 9]],
  ['R2C6', [1, 2, 3, 4]],
  ['R1C8', [2, 7, 9]],
  ['R8C1', [1, 3, 4]],
  ['R7C3', [6, 8, 9]],
  ['R7C6', [1, 2, 3, 4]],
  ['R8C8', [6]],
];

// Racquets: distinct cells of each grey line (each line's drawn path
// revisits its loop cell once -- R4C4 / R6C6 -- which needs no special
// handling since only cell membership matters for parity).
const racquet1 = [
  'R2C6', 'R3C5', 'R4C4', 'R4C3', 'R4C2',
  'R5C1', 'R6C1', 'R7C2', 'R7C3', 'R6C4', 'R5C4',
];
const racquet2 = [
  'R8C4', 'R7C5', 'R6C6', 'R5C6', 'R4C6',
  'R3C7', 'R3C8', 'R4C9', 'R5C9', 'R6C8', 'R6C7',
];
const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];
const allParity = (cells, values) => cells.map(cell => new Given(cell, ...values));

return [
  new Shape('9x9'),

  ...quads.map(([topLeft, values]) => new Quad(topLeft, ...values)),

  new Or([
    new And([...allParity(racquet1, ODD), ...allParity(racquet2, EVEN)]),
    new And([...allParity(racquet1, EVEN), ...allParity(racquet2, ODD)]),
  ]),

  new Diagonal(-1),
  new Diagonal(1),
];
