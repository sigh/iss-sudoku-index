// Title: Let's Sausage!
// Author: Scojo
// Video: https://www.youtube.com/watch?v=hGCEG4_r9iI
// Source: https://sudokupad.app/27z6ar78be

// Rules encoded here:
//   Normal sudoku rules apply: place the digits 1-9 once each in every row,
//   column, and 3x3 box.
//   The difference between the sums of two linked sausages on a chain must be
//   exactly equal to the number of sausages in that chain.
// Nothing is omitted.
//
// "Two linked sausages" is read as a pair joined by one of the drawn link dots.
// Reading it as any two sausages on the same chain is unsatisfiable for a chain
// of three or more: a - b and b - c both +/- N leaves a - c equal to 0 or 2N,
// never N, and six of the eight chains here hold more than two sausages.
// The rules text places no distinctness requirement inside a sausage, so a
// sausage total is a plain Sum rather than a Cage.

// Drawn data, one entry per sausage stroke: the cells whose centres the stroke
// runs over. Sausages lie orthogonally or diagonally, and #3 is a single curved
// stroke arching over six cells.
const SAUSAGES = [
  ['R2C1'],                                         //  0
  ['R3C1', 'R4C1'],                                 //  1
  ['R2C2', 'R3C3'],                                 //  2
  ['R1C5', 'R1C6', 'R2C4', 'R2C6', 'R3C4', 'R3C6'], //  3
  ['R3C7', 'R4C8', 'R5C8'],                         //  4
  ['R2C7'],                                         //  5
  ['R1C7', 'R1C8'],                                 //  6
  ['R2C8', 'R2C9'],                                 //  7
  ['R1C1'],                                         //  8
  ['R1C2'],                                         //  9
  ['R3C9'],                                         // 10
  ['R4C9'],                                         // 11
  ['R5C9'],                                         // 12
  ['R6C8', 'R6C9'],                                 // 13
  ['R5C7', 'R6C7'],                                 // 14
  ['R5C6', 'R6C6'],                                 // 15
  ['R6C5', 'R7C4', 'R8C3'],                         // 16
  ['R6C1', 'R7C2'],                                 // 17
  ['R5C2'],                                         // 18
  ['R2C5', 'R3C5'],                                 // 19
  ['R4C5', 'R5C4'],                                 // 20
  ['R6C3'],                                         // 21
  ['R6C4'],                                         // 22
  ['R5C5'],                                         // 23
  ['R7C1', 'R8C1'],                                 // 24
  ['R9C2', 'R9C3'],                                 // 25
  ['R8C4', 'R8C5', 'R9C4'],                         // 26
  ['R7C6', 'R7C7'],                                 // 27
  ['R8C6', 'R9C5'],                                 // 28
];

// Drawn data, from the 21 small dots: each dot sits on the join between the near
// ends of two sausages. No sausage end carries more than one dot, so the dots
// group the sausages into eight open chains; each row lists one chain's
// sausages in link order, so consecutive entries are the linked pairs and the
// row's length is that chain's sausage count.
const CHAINS = [
  [0, 8, 9],
  [1, 2, 3, 4],
  [5, 6, 7],
  [10, 11, 12],
  [13, 14, 15, 16, 17, 18],
  [19, 20, 21],
  [22, 23],
  [24, 25, 26, 28, 27],
];

// sum(a) - sum(b) = +n or -n, as a coefficient Sum over the two sausages' cells
// under each sign.
const linkedDifference = (a, b, n) => {
  const terms = [...SAUSAGES[a], ...SAUSAGES[b].map(cell => [cell, -1])];
  return new Or([new Sum(n, ...terms), new Sum(-n, ...terms)]);
};

const sausageChains = CHAINS.flatMap(
  chain => chain.slice(1).map(
    (sausage, i) => linkedDifference(chain[i], sausage, chain.length)));

return [
  new Shape('9x9'),

  new Given('R3C8', 4),
  new Given('R6C2', 5),
  new Given('R8C9', 6),

  ...sausageChains,
];
