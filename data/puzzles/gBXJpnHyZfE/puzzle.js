// Title: Event Horizon
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=gBXJpnHyZfE
// Source: https://sudokupad.app/giuk6t4rfg

// Rules encoded here:
//   * Normal 9x9 Sudoku.
//   * The value of a digit inside the black dot -- the disc drawn over box 5,
//     R4C4-R6C6 -- is double its normal value; anywhere else a digit's value is
//     the digit itself. Every total below is a total of values, so a black dot
//     cell enters it with coefficient 2.
//   * KILLER: digits in a cage do not repeat, and their values sum to the
//     number in the cage's upper left corner. Two of the drawn cages print no
//     number, so only the no-repeat half of the rule applies to them.
//   * LITTLE KILLER: values on an indicated diagonal sum to the number by the
//     arrow.
//   * RENBAN: values on a pink line form a consecutive non-repeating set. Only
//     the non-repeating half is encoded -- see the omissions.
//
// The black disc is opaque, and it is drawn over the ends of two clues, so what
// those clues cover inside box 5 is not on the board. Both are omitted here:
//
//   * The total 70 printed on the cage drawn over R2C5 and R3C5. Both cells are
//     outside the black dot, so their values are their digits and total at most
//     17: the drawn outline is only the visible part of that cage and the rest
//     lies under the disc. Which cells under the disc it covers is not drawn,
//     and neither is whether it re-emerges at the no-total outline below it in
//     column 5, at the no-total outline to its right in row 6, or not at all.
//     The no-repeat half of the cage rule is kept.
//   * The consecutiveness of the pink line. Each pink stroke runs past the
//     centre of its last visible cell, crosses the border of box 5 and is then
//     cut off by the disc, so neither stroke ends where it stops being visible
//     and the cells it covers under the disc are not drawn. What survives is
//     that the values a pink stroke does cover are non-repeating, which holds
//     however far the line runs on; no drawn pink cell is inside the black dot,
//     so those values are the digits themselves.

const inBlackDot = (cell) => {
  const { row, col } = parseCellId(cell);
  return row >= 4 && row <= 6 && col >= 4 && col <= 6;
};

// Sum takes [cell, coeff] pairs; a doubled digit enters a value total twice.
const valueTerm = (cell) => (inBlackDot(cell) ? [cell, 2] : cell);

// The drawn cage outlines and the number printed in each one's upper left
// corner; `null` where no number is printed, and for the 70 above.
const CAGES = [
  { total: 20, cells: ['R1C2', 'R2C1', 'R2C2'] },
  { total: 10, cells: ['R1C8', 'R2C8', 'R2C9'] },
  { total: 20, cells: ['R8C1', 'R8C2', 'R9C1'] },
  { total: 20, cells: ['R4C2', 'R4C3', 'R4C4'] },
  { total: null, cells: ['R2C5', 'R3C5'] },   // prints 70; omitted
  { total: null, cells: ['R6C6', 'R6C7', 'R6C8'] },
  { total: null, cells: ['R7C5', 'R8C5'] },
];

const cageConstraints = ({ total, cells }) => {
  if (total === null) return [new AllDifferent(...cells)];
  // Cage carries the no-repeat rule and the total together, but has no room
  // for a doubling coefficient, so a cage reaching into the black dot is split
  // into a weighted value total plus the no-repeat rule.
  if (!cells.some(inBlackDot)) return [new Cage(total, ...cells)];
  return [new Sum(total, ...cells.map(valueTerm)), new AllDifferent(...cells)];
};

// Each little killer arrow sits outside the frame pointing along one diagonal;
// the diagonal starts at the first grid cell on the ray and runs to the edge.
const LITTLE_KILLERS = [
  { total: 30, start: 'R1C9', dr: 1, dc: -1 },  // arrow above the top right corner
  { total: 30, start: 'R1C6', dr: 1, dc: -1 },  // arrow above C7
  { total: 30, start: 'R1C2', dr: 1, dc: 1 },   // arrow above C1
];

const diagonalCells = ({ start, dr, dc }) => {
  const cells = [];
  let { row, col } = parseCellId(start);
  while (row >= 1 && row <= 9 && col >= 1 && col <= 9) {
    cells.push(makeCellId(row, col));
    row += dr;
    col += dc;
  }
  return cells;
};

// The cells each pink stroke visibly runs through, taken from its drawn path.
const PINK_STROKES = [
  ['R6C2', 'R7C3', 'R7C4'],
  ['R2C5', 'R3C6'],
];

return [
  new Shape('9x9'),
  ...CAGES.flatMap(cageConstraints),
  ...LITTLE_KILLERS.map(lk => new Sum(lk.total, ...diagonalCells(lk).map(valueTerm))),
  ...PINK_STROKES.map(cells => new AllDifferent(...cells)),
];
