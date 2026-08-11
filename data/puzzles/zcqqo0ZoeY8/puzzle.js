// Title: Cross Purposes
// Author: tallcat
// Video: https://www.youtube.com/watch?v=zcqqo0ZoeY8
// Source: https://app.crackingthecryptic.com/sudoku/pHThh8HNj6

// Rules encoded here, in full:
//  * Normal sudoku: 1-9 once per row, column and 3x3 box.
//  * Anti-king: cells a king's move apart cannot hold the same digit.
//  * Killer cages: digits in a cage sum to the total printed in its top-left
//    cell; digits within a cage do not repeat (standard cage convention).
//  * Circles: each circle sits at the shared corner of a 2x2 block of four
//    cells. The sum of three of the four cells equals the fourth, but the
//    rule does not name which cell plays the "fourth" role, so each circle
//    is encoded as a disjunction over the four choices of which cell is the
//    sum. "Not all circles have been given" means only the eight marked
//    circles are constrained; no claim is made about any other 2x2 block.

const CAGES = [
  // [total, cells...] -- the drawn 2-cell cages and their top-left totals
  [13, 'R6C3', 'R7C3'],
  [12, 'R6C6', 'R7C6'],
  [11, 'R6C9', 'R7C9'],
];

const CIRCLES = [
  // Each entry is the 2x2 block of cells sharing one drawn circle, listed
  // as the four corner cells the circle touches.
  ['R1C2', 'R1C3', 'R2C2', 'R2C3'],
  ['R1C4', 'R1C5', 'R2C4', 'R2C5'],
  ['R4C1', 'R4C2', 'R5C1', 'R5C2'],
  ['R4C4', 'R4C5', 'R5C4', 'R5C5'],
  ['R7C1', 'R7C2', 'R8C1', 'R8C2'],
  ['R8C4', 'R8C5', 'R9C4', 'R9C5'],
  ['R2C6', 'R2C7', 'R3C6', 'R3C7'],
  ['R4C8', 'R4C9', 'R5C8', 'R5C9'],
];

// One of the four cells equals the sum of the other three; which cell plays
// that role is unspecified by the rules, so try each in turn. EqualSum ties
// the 3-cell segment's total to the 1-cell segment's total.
const circleRule = (cells) => new Or(
  cells.map((sumCell, i) => {
    const others = cells.filter((_, j) => j !== i);
    return new EqualSum(others, [sumCell]);
  })
);

return [
  new Shape('9x9'),
  new AntiKing(),
  ...CAGES.map(([total, ...cells]) => new Cage(total, ...cells)),
  ...CIRCLES.map(circleRule),
];
