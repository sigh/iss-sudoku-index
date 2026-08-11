// Title: 10-Line
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=Zu6X5a6d0WU
// Source: https://app.crackingthecryptic.com/sudoku/6BDF4d9G7r

// Normal sudoku rules apply (default row/column/box all-different, no
// givens). Adjacent digits along a line must sum to 10 or more: encoded as
// one Pair group per drawn line, binding consecutive cells in path order.
// Closed loops repeat the start cell at the end of their list to cover the
// wrap-around edge; cell lists are taken from the drawn line geometry. A
// 16th line-list entry carries only styling and no coordinates; it draws
// nothing and is omitted.

const sumAtLeastTen = Pair.fnToKey((a, b) => a + b >= 10, 9);

const lines = [
  ['R2C1', 'R1C1', 'R1C2', 'R2C1'],
  ['R1C3', 'R2C4', 'R1C4', 'R1C3'],
  ['R2C5', 'R1C5', 'R1C6', 'R2C5'],
  ['R2C6', 'R2C7'],
  ['R1C8', 'R2C9', 'R1C9', 'R1C8'],
  ['R3C3', 'R3C4', 'R4C5'],
  ['R4C6', 'R5C6', 'R6C6', 'R5C7', 'R4C6'],
  ['R4C4', 'R5C4', 'R6C4', 'R5C3', 'R4C4'],
  ['R5C8', 'R6C8'],
  ['R8C8', 'R9C8', 'R9C9', 'R8C8'],
  ['R8C7', 'R9C7', 'R9C6', 'R8C7'],
  ['R8C5', 'R8C4'],
  ['R8C3', 'R9C3', 'R9C4', 'R8C3'],
  ['R8C2', 'R9C2', 'R9C1', 'R8C2'],
  ['R5C2', 'R6C3'],
];

return [
  new Shape('9x9'),
  ...lines.map(
    (cells, i) => new Pair(sumAtLeastTen, `line ${i + 1}`, ...cells)),
];
