// Title: Technically correct
// Author: Lorena
// Video: https://www.youtube.com/watch?v=xRI_eNfqM0U
// Source: https://sudokupad.app/4o3b5oqvf2

// The rules only require "digits" that "cannot repeat in any row, column or
// [3x3] box" -- never 1-9. The grid holds nine cells per row/column/box, but
// the alphabet is the ten digits 0-9: each unit places nine of the ten and
// omits one, and which digit is omitted varies by unit.
//
// Standard sudoku (rows, columns, marked 3x3 boxes) over that alphabet, plus:
// - Large circles: each digit printed inside one must appear somewhere among
//   the 2x2 block of cells the circle touches (Quad). Which of the four
//   cells holds which printed digit is not given -- the printed position
//   inside the circle is a layout choice, not a placement hint: reading the
//   four-digit circles' positions as literal givens would force, on at least
//   one of their two diagonals, a pair that is not a 2x ratio, contradicting
//   the diagonal rule below.
// - Every large circle additionally acts as a diagonal black-kropki dot: on
//   each of its two diagonals (top-left/bottom-right and top-right/
//   bottom-left), one of the pair must be double the other. 0 qualifies
//   against itself (0 = 2x0), which only matters because 0 is in the
//   alphabet.
// - White dots: the two joined cells hold consecutive digits. Not every
//   consecutive pair is dotted (no negative inference from an undotted
//   pair).

const shape = new Shape('9x9', '0-9');

// Circles: [topLeftCell, ...printedDigits]. topLeftCell anchors the 2x2 block
// the circle touches (Quad derives the other three cells itself).
const circles = [
  ['R6C1', 3, 6],
  ['R8C6', 4, 8],
  ['R3C8', 3, 6],
  ['R7C8', 1, 2],
  ['R5C4', 3, 6],
  ['R8C3', 1, 2],
  ['R1C3', 4, 8],
  ['R6C3', 1, 2],
  ['R3C1', 4, 8, 1, 2],
  ['R1C6', 1, 2, 3, 6],
  ['R5C7', 1, 2, 4, 8],
];

const quads = circles.map(([topLeft, ...values]) => new Quad(topLeft, ...values));

// Diagonal black-kropki pairs for every circle above, derived from the same
// topLeftCell: (topLeft, bottomRight) and (topRight, bottomLeft).
const doubleKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, shape);
const diagonalDots = circles.flatMap(([topLeft]) => {
  const { row, col } = parseCellId(topLeft);
  const topRight = makeCellId(row, col + 1);
  const bottomLeft = makeCellId(row + 1, col);
  const bottomRight = makeCellId(row + 1, col + 1);
  return [
    new Pair(doubleKey, '', topLeft, bottomRight),
    new Pair(doubleKey, '', topRight, bottomLeft),
  ];
});

// White dot edges.
const whiteDots = [
  new WhiteDot('R8C2', 'R9C2'),
  new WhiteDot('R5C2', 'R5C3'),
  new WhiteDot('R4C3', 'R5C3'),
  new WhiteDot('R1C8', 'R2C8'),
  new WhiteDot('R9C1', 'R9C2'),
  new WhiteDot('R7C5', 'R7C6'),
  new WhiteDot('R3C6', 'R3C7'),
  new WhiteDot('R4C6', 'R4C7'),
  new WhiteDot('R2C2', 'R2C3'),
];

return [
  shape,
  new Given('R1C1', 1),
  new Given('R5C6', 1),
  ...quads,
  ...diagonalDots,
  ...whiteDots,
];
