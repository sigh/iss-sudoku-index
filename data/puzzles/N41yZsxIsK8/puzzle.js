// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=N41yZsxIsK8
// Source: https://cracking-the-cryptic.web.app/sudoku/HBMQr6HjJH

// Normal Sudoku rules apply, on the nine standard 3x3 boxes.
//
// Anti-king: a digit may not repeat in two cells a king's move apart, i.e. in
// two cells that touch at a side or at a corner.
//
// Two drawn marks are not encoded, because they annotate the puzzle's Pi theme
// rather than clue anything. The twenty non-central givens read clockwise from
// R1C5 around the border spell 3 1 4 1 5 9 2 6 5 3 5 8 9 7 9 3 2 3 8 4, and
// R5C5 = 6 is the next digit of Pi.
//   - A small black dot floats inside R1C5, 0.8 of a cell down and 0.8 across:
//     low and right of the printed 3, where the decimal point of "3.1415..."
//     belongs. It lies on no cell edge and no cell corner, so no edge or corner
//     clue convention places it.
//   - A thick black segment runs along the R1C4|R1C5 border, which is interior
//     to box 2 and so not a box boundary; it is where the ring of digits
//     closes, separating the ring's last digit (R1C4 = 4) from its first
//     (R1C5 = 3). Those two cells are printed givens, and 4 and 3 are
//     consecutive, are not in ratio 1:2, and sum to 7, so the segment states
//     neither an anti-consecutive wall, nor a black Kropki dot, nor a V or X.

// The 21 printed givens, row by row.
const GIVENS = [
  ['R1C4', 4], ['R1C5', 3], ['R1C6', 1],
  ['R2C3', 8], ['R2C7', 4],
  ['R3C2', 3], ['R3C8', 1],
  ['R4C1', 2], ['R4C9', 5],
  ['R5C1', 3], ['R5C5', 6], ['R5C9', 9],
  ['R6C1', 9], ['R6C9', 2],
  ['R7C2', 7], ['R7C8', 6],
  ['R8C3', 9], ['R8C7', 5],
  ['R9C4', 8], ['R9C5', 5], ['R9C6', 3],
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  new AntiKing(),
];
