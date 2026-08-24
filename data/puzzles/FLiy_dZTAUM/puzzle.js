// Title: Killer Hidden Arrows
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=FLiy_dZTAUM
// Source: https://app.crackingthecryptic.com/sudoku/GGrd2GTMLT

// Rules encoded here:
//  - Normal sudoku (default Shape('9x9') regions -- the drawn regions are
//    the plain 3x3 boxes).
//  - Each of the 8 drawn cages: digits sum to the cage's printed total and
//    cannot repeat within the cage (`Cage(total, ...cells)`).
//  - Each cage also hides a standard arrow clue: the circle (any number of
//    digits) sits at one end of the cage's own drawn path, and the digits
//    along the rest of the path (the "arrow", running all the way to the
//    other end) sum to the circle's value. A multi-digit circle is read in
//    the direction the arrow travels: starting at the circle's own far/outer
//    cell (the absolute path endpoint) and proceeding toward the cell
//    adjacent to the first arrow cell. Circle end and circle size are not
//    given, so every geometrically legal placement is offered as an `Or`
//    branch per cage.
//  - Only circle sizes 1 and 2 are geometrically possible. With an m-digit
//    circle the remaining n-m path cells must sum to at least 10^(m-1) (the
//    smallest m-digit number, since sudoku digits are never 0). The largest
//    cage here has n=6 cells, so m=3 would leave <=3 remaining cells,
//    summing to at most 27 -- but every 3-digit number is >=100, so m=3 (and
//    higher) is arithmetically impossible for every cage. The `Or` below
//    therefore enumerates only m in {1, 2}, at either end of the path -- 4
//    branches per cage.
//  Nothing is omitted.

// Each cage's cells, listed in the source's own drawn path order (an
// unbroken chain of orthogonally-adjacent cells), with its printed total.
const cagesData = [
  { total: 34, cells: ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C4', 'R3C4'] },
  { total: 24, cells: ['R1C6', 'R2C6', 'R2C7', 'R2C8', 'R2C9'] },
  { total: 23, cells: ['R3C2', 'R4C2', 'R4C1', 'R5C1', 'R6C1'] },
  { total: 24, cells: ['R6C2', 'R6C3', 'R7C3', 'R8C3', 'R8C2', 'R9C2'] },
  { total: 17, cells: ['R5C3', 'R5C4', 'R5C5', 'R4C5', 'R4C6'] },
  { total: 23, cells: ['R7C5', 'R7C6', 'R6C6', 'R6C7', 'R5C7'] },
  { total: 32, cells: ['R4C8', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'] },
  { total: 23, cells: ['R8C7', 'R9C7', 'R9C6', 'R9C5', 'R9C4'] },
];

// The hidden-arrow disjunction for one cage's path cells (in drawn order).
// Branch order: [1-digit circle at start, 1-digit circle at end,
// 2-digit circle at start, 2-digit circle at end].
const arrowBranches = (cells) => {
  const n = cells.length;
  const first = cells[0];
  const last = cells[n - 1];
  return [
    // m=1, circle at the start end: native Arrow (order-independent sum).
    new Arrow(first, ...cells.slice(1)),
    // m=1, circle at the end.
    new Arrow(last, ...cells.slice(0, n - 1)),
    // m=2, circle at the start end: circle = cells[0],cells[1], read in the
    // arrow's direction of travel (cells[0] is the far/outer circle cell,
    // hence the tens digit); remainder cells[2..] sum to that number.
    new Sum(0, [cells[0], 10], [cells[1], 1],
      ...cells.slice(2).map(c => [c, -1])),
    // m=2, circle at the end: cells[n-1] is the far/outer circle cell (tens
    // digit), cells[n-2] the near one (units); remainder cells[0..n-3] sum
    // to that number.
    new Sum(0, [cells[n - 1], 10], [cells[n - 2], 1],
      ...cells.slice(0, n - 2).map(c => [c, -1])),
  ];
};

return [
  new Shape('9x9'),

  ...cagesData.flatMap(({ total, cells }) => [
    new Cage(total, ...cells),
    new Or(arrowBranches(cells)),
  ]),
];
