// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=CuIHDxowMWM
// Source: https://app.crackingthecryptic.com/sudoku/62qPpjJMBT

// Rules encoded here, in full:
//  * Normal sudoku rules apply: rows, columns and 3x3 boxes.
//  * Each marked 10-cell line contains all the digits from 1-9 and one
//    repeated digit. The repeated digits must be at the ends of the line.
// Nothing is omitted.

// The three drawn grey strokes, each transcribed end to end as the 10 cells it
// covers (a stroke waypoint run is expanded through the cells it passes).
const LINES = [
  ['R2C3', 'R2C2', 'R3C1', 'R4C2', 'R5C2', 'R6C1', 'R7C1', 'R7C2', 'R8C3', 'R9C2'],
  ['R3C9', 'R2C8', 'R2C7', 'R2C6', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R6C6', 'R5C6'],
  ['R5C7', 'R4C7', 'R4C8', 'R5C8', 'R6C9', 'R7C8', 'R8C7', 'R8C6', 'R9C6', 'R9C5'],
];

// The 21 printed given digits.
const GIVENS = [
  new Given('R1C1', 5), new Given('R1C5', 3), new Given('R1C7', 6),
  new Given('R1C9', 4), new Given('R2C4', 1), new Given('R3C2', 8),
  new Given('R3C8', 2), new Given('R4C1', 7), new Given('R4C4', 8),
  new Given('R4C9', 1), new Given('R5C3', 3), new Given('R5C4', 5),
  new Given('R6C2', 1), new Given('R6C8', 9), new Given('R7C3', 4),
  new Given('R7C5', 8), new Given('R8C4', 6), new Given('R8C9', 2),
  new Given('R9C1', 6), new Given('R9C7', 5), new Given('R9C9', 3),
];

// Ten cells holding the nine digits 1-9 with one of them twice, both copies at
// the ends, is exactly these two statements:
//   - the two end cells hold the same digit -- SameValues over two one-cell
//     sets, i.e. first == last;
//   - drop one end and the remaining nine cells are nine distinct digits,
//     which on a 9-valued grid is all of 1-9.
// Together they also force the repeat to be the end digit and no other, since
// the nine kept cells are already pairwise distinct.
const lineConstraints = LINES.flatMap((cells) => [
  new SameValues(2, cells[0], cells[cells.length - 1]),
  new AllDifferent(...cells.slice(0, cells.length - 1)),
]);

return [
  new Shape('9x9'),
  ...GIVENS,
  ...lineConstraints,
];
