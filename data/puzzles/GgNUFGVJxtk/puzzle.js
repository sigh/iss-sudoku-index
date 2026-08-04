// Title: Coordinate Arrows
// Author: Piatato
// Video: https://www.youtube.com/watch?v=GgNUFGVJxtk
// Source: https://app.crackingthecryptic.com/sudoku/bNjqp79Rpn

// Normal sudoku rules (9 rows, 9 columns, 9 boxes, digits 1-9, no repeats).
// Each arrow has a start cell (a row digit) and a tip cell (a column digit);
// the cell at that (row, column) must equal the sum of the two digits. All
// arrows must resolve to different (row, column) pairs. Digits may repeat on
// an arrow -- no extra all-different constraint applies to an arrow's own
// two cells beyond ordinary sudoku.
//
// Only 12 of the 14 drawn arrows have recoverable cells; the other 2 (source
// `arrows[2]` and `arrows[13]`) carry no waypoint data in the source payload
// at all, so neither the coordinate-sum rule nor the distinct-coordinates
// rule can be applied to them -- both are omitted here.

// [start, tip] cell pairs for the 12 recoverable arrows, snapped to cell
// centres from the source's arrow waypoint geometry.
const arrows = [
  ['R4C2', 'R3C3'], // arrows[0]
  ['R2C4', 'R3C3'], // arrows[1]
  ['R2C6', 'R1C7'], // arrows[3]
  ['R2C7', 'R1C8'], // arrows[4]
  ['R4C5', 'R3C6'], // arrows[5]
  ['R5C4', 'R6C3'], // arrows[6]
  ['R6C2', 'R7C1'], // arrows[7]
  ['R7C2', 'R8C1'], // arrows[8]
  ['R9C5', 'R8C5'], // arrows[9]
  ['R8C8', 'R7C7'], // arrows[10]
  ['R8C9', 'R7C9'], // arrows[11]
  ['R9C8', 'R9C7'], // arrows[12]
];

// No dedicated ISS class points a constraint at a target cell selected by
// two other cells' own values, so this is built as a disjunction: for each
// arrow, try every (row, col) with row + col <= 9 (a target cell can only
// hold one digit 1-9, so a larger sum has no branch and is excluded by
// construction) and require the start cell = row, the tip cell = col, and
// grid cell R{row}C{col} = row + col. Or() needs at least one branch to
// hold, which is exactly "some valid (row, col) fits". A branch whose target
// cell lands back on the arrow's own start or tip cell is skipped: it would
// need row = row + col (or col = row + col) on that shared cell, which is
// never possible for row, col >= 1, so it can never be satisfied anyway --
// keeping it only produces two conflicting Givens on one cell.
const upTo = (n) => Array.from({ length: Math.max(n, 0) }, (_, i) => i + 1);

const coordinateSum = ([start, tip]) => new Or(
  upTo(9).flatMap(row => upTo(9 - row)
    .map(col => ({ col, target: makeCellId(row, col) }))
    .filter(({ target }) => target !== start && target !== tip)
    .map(({ col, target }) => new And([
      new Given(start, row),
      new Given(tip, col),
      new Given(target, row + col),
    ])))
);

// "All the arrows must correspond to different coordinates": for every pair
// of recoverable arrows, their (start value, tip value) pairs must not be
// identical -- i.e. the start cells differ or the tip cells differ. A pair
// that shares its start (or tip) cell -- e.g. two arrows both tipped at
// R3C3 -- trivially agrees on that half already (it is the same cell), so
// that half is dropped: it can never hold and would only leave a
// same-cell AllDifferent behind.
const distinctCoordinates = arrows.flatMap(([startI, tipI], i) =>
  arrows.slice(i + 1)
    .map(([startJ, tipJ]) => [
      startI !== startJ ? new AllDifferent(startI, startJ) : null,
      tipI !== tipJ ? new AllDifferent(tipI, tipJ) : null,
    ].filter(Boolean))
    .filter(branches => branches.length > 0)
    .map(branches => new Or(branches)));

return [
  new Shape('9x9'),
  new Given('R5C7', 6),
  new Given('R5C8', 7),
  ...arrows.map(coordinateSum),
  ...distinctCoordinates,
];
