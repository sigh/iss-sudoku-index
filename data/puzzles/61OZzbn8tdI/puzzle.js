// Title: Ms Roberts ....
// Author: Joe Bloggs
// Video: https://www.youtube.com/watch?v=61OZzbn8tdI
// Source: https://app.crackingthecryptic.com/sudoku/RNmbtPH94J

// Rules encoded here:
//   - Normal sudoku (9x9, standard boxes).
//   - The cage shows its sum.
//   - Digits on an arrow sum to the number in the circle, or to the two-digit
//     number in the pill, which reads from left to right.
// The circles and the pill are drawn empty, so their values are solved digits.
// Not encoded: the 21 coloured cells. The rules text never mentions them; the
// source explains them only in its post-solve message ("The coloured cells
// represent numbers between 1 and 26, which can be translated to corresponding
// letters from A to Z"), which describes how to read a message off the finished
// grid and places no condition on the digits.

// Drawn givens, row by row.
const givens = [
  ['R1C7', 6],
  ['R3C7', 4], ['R3C9', 2],
  ['R4C8', 8],
  ['R5C9', 7],
  ['R6C3', 3], ['R6C8', 4],
  ['R7C4', 7],
  ['R8C5', 5],
  ['R9C1', 2], ['R9C3', 6], ['R9C5', 4],
];

// The five single-circle arrows: circle cell first, then the arm cells in
// drawn path order.
const circleArrows = [
  ['R1C4', 'R2C4', 'R2C5'],
  ['R2C6', 'R2C7', 'R2C8'],
  ['R5C8', 'R4C9', 'R3C9', 'R3C8'],
  ['R6C7', 'R5C7', 'R6C6', 'R5C5'],
  ['R5C1', 'R4C2', 'R3C2'],
];

// The pill arrow: the pill covers R7C2-R7C3, and its arm runs from the pill's
// right end through box 8 to R9C8.
const pillCells = ['R7C2', 'R7C3'];
const pillArm = [
  'R7C4', 'R8C4', 'R9C4', 'R9C5', 'R8C5', 'R8C6', 'R9C6', 'R9C7', 'R9C8',
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),

  // Drawn cage in box 4, total 39.
  new Cage(39, 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R5C2', 'R5C3'),

  ...circleArrows.map((cells) => new Arrow(...cells)),

  // PillArrow(pillSize, ...): the first 2 cells are the pill digits, read left
  // to right, and the rest are the arm.
  new PillArrow(2, ...pillCells, ...pillArm),
];
