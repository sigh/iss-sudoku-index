// Title: Noughts and Crosses Somedoku
// Author: blackjackfitz
// Video: https://www.youtube.com/watch?v=ouHKWufGUP4
// Source: https://app.crackingthecryptic.com/917ci3wr7m
//
// Fill each cell with a digit 1-9. Row n and column n (n = 1..9) each hold
// exactly n distinct digits, the rest of that row/column being repeats --
// so no row, column or box is all-different, and the grid uses the Raw type
// with no implicit rules at all. A digit in a circle counts how many circled
// cells (of all 21 drawn) hold that same digit. Cells joined by a small X sum
// to 10.

const graph = cellGraph('9x9');

// Row/column distinct-digit counts. Each row/column n needs an aux cell
// pinned to n and tied to that row/column by CountDistinct, forcing exactly
// n distinct values among its 9 cells (repeats fill the remainder).
const rowCount = new Var('R', 'row distinct-digit count', 9);
const colCount = new Var('C', 'col distinct-digit count', 9);
const distinctCounts = [];
for (let n = 1; n <= 9; n++) {
  const rowCtrl = rowCount.cell(n);
  const colCtrl = colCount.cell(n);
  distinctCounts.push(
    new Given(rowCtrl, n),
    new CountDistinct(rowCtrl, ...graph.row(n)),
    new Given(colCtrl, n),
    new CountDistinct(colCtrl, ...graph.column(n)),
  );
}

// Circled cells (plain circles, no printed digit, 21 in total). One
// CountingCircles group: "a digit in a circle indicates exactly how many
// circles contain that digit" ties every circle's own value to how many
// circles (of this one set) share it.
const circles = [
  'R1C9',
  'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C7', 'R2C8', 'R2C9',
  'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6',
  'R8C1', 'R8C3', 'R8C4', 'R8C5', 'R8C6',
  'R9C1', 'R9C6',
];

// X pairs (25 edge-sized rounded "X" overlays). "Cells separated by an X sum
// to 10"; only the drawn pairs are constrained (the rules never claim every
// unmarked adjacent pair is exempt), so one X per marked edge.
const xPairs = [
  ['R8C3', 'R9C3'], ['R8C4', 'R9C4'], ['R8C5', 'R9C5'],
  ['R3C6', 'R3C7'], ['R4C6', 'R4C7'], ['R5C6', 'R5C7'], ['R6C6', 'R6C7'], ['R7C6', 'R7C7'],
  ['R4C7', 'R4C8'], ['R5C7', 'R5C8'], ['R6C7', 'R6C8'], ['R7C7', 'R7C8'],
  ['R7C8', 'R7C9'], ['R6C8', 'R6C9'],
  ['R7C4', 'R8C4'], ['R9C5', 'R9C6'], ['R6C4', 'R6C5'], ['R3C5', 'R3C6'],
  ['R3C4', 'R4C4'], ['R4C4', 'R4C5'], ['R4C2', 'R4C3'], ['R5C4', 'R5C5'],
  ['R6C3', 'R7C3'], ['R5C3', 'R6C3'], ['R6C1', 'R6C2'],
];

return [
  new Shape('9x9', '', 'Raw'),
  rowCount,
  colCount,
  ...distinctCounts,
  new CountingCircles(...circles),
  ...xPairs.map(([a, b]) => new X(a, b)),
];
