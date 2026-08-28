// Title: Solve For X
// Author: ProwlingTiger
// Video: https://www.youtube.com/watch?v=FHEBQSfqErI
// Source: https://cracking-the-cryptic.web.app/sudoku/9dm8JBTdnN

// Standard 9x9 sudoku (rows, columns, boxes each 1-9 once). Killer cages:
// digits within a cage do not repeat and sum to the shown total. Little-
// killer-style outside diagonal arrows: the sum of the diagonal run of cells
// the arrow enters, digits may repeat.
//
// Several clues show their total as an expression in "x" (x, x+1, x/2,
// 3x/2, 5x/2) rather than a number: x is one unknown value shared by every
// such clue in the puzzle.
//
// The R9C9 outside diagonal is a single cell (the diagonal exits the grid
// immediately from that corner), so its "x/2" clue names R9C9's own value
// as x/2 directly -- no extra state is needed for x. Every other x-clue is
// substituted as a linear equation in R9C9: writing each clue's numerator
// over x/2 (x = 2*(x/2), x+1 = 2*(x/2)+1, 3x/2 = 3*(x/2), 5x/2 = 5*(x/2))
// gives total - k*R9C9 = c, built with Sum's coefficient form.
const halfX = 'R9C9';

// total = k*x/2 [+ c], expressed as: sum(cells) - k*halfX = c
function xTotal(cells, k, c = 0) {
  return new Sum(c, ...cells, [halfX, -k]);
}

// Killer cages whose total is an x-expression: AllDifferent (cage rule) plus
// the linear total equation (Cage can't take a variable total).
function xCage(cells, k, c = 0) {
  return [new AllDifferent(...cells), xTotal(cells, k, c)];
}

const xCages = [
  ...xCage(['R1C2', 'R2C2', 'R2C1'], 2),       // "x"
  ...xCage(['R3C7', 'R4C7'], 2),                // "x"
  ...xCage(['R4C5', 'R4C4'], 2),                // "x"
  ...xCage(['R7C1', 'R7C2'], 2),                // "x"
  ...xCage(['R8C1', 'R8C2'], 2, 1),             // "x+1"
  ...xCage(['R7C4', 'R7C5'], 2),                // "x"
  ...xCage(['R4C1', 'R4C2'], 2),                // "x"
];

// Plain-total killer cages.
const numberCages = [
  new Cage(8, 'R1C6', 'R2C6', 'R3C6'),
  new Cage(8, 'R5C6', 'R6C6'),
  new Cage(43, 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C1', 'R9C2', 'R9C3', 'R9C4'),
];

// Outside diagonal ("little killer") sum clues carrying an x-expression.
// Repeats are allowed along these diagonals, so only the Sum is added.
const xDiagonals = [
  xTotal(['R3C1', 'R2C2', 'R1C3'], 2),          // "x"
  xTotal(
    ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1'],
    5,
  ),                                              // "5x/2"
  xTotal(['R7C9', 'R8C8', 'R9C7'], 3),           // "3x/2"
  xTotal(['R8C9', 'R9C8'], 2),                   // "x"
  // R9C9 = x/2 is definitional (halfX itself); no separate clause needed.
];

return [
  new Shape('9x9'),
  new Given('R4C8', 8),
  ...xCages,
  ...numberCages,
  ...xDiagonals,
];
