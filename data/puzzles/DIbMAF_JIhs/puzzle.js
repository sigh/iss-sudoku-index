// Title: Taco Bowl 3 - Ring of Fire
// Author: DiMono
// Video: https://www.youtube.com/watch?v=DIbMAF_JIhs
// Source: https://app.crackingthecryptic.com/sudoku/Fbf8q9pGJT
//
// Normal sudoku. Additionally, facing arrows are crusts of a "sandwich":
// the two crust digits, read together as a two-digit number in some order,
// equal the sum of every digit in the sandwich (crusts included). For crust
// cells a, b and bread-cell sum S, that is Or(S + a + b == 10a + b,
// S + a + b == 10b + a), i.e. Or(S == 9a, S == 9b) -- encoded below as one
// Sum per candidate order, since a's own row/column all-different already
// forces a != b.
//
// The 16 crust pairs below are read from the drawn stub arrows: 35 array
// entries total, of which 2 render nothing. Column C2 carries three stub
// arrows (down at R1C2, down at R5C2, up at R8C2): the rule reads "when two
// arrows face each other", not "when two *nearest* arrows face each other",
// and R8C2's up-arrow faces both down-arrows along that column, so column C2
// yields two sandwiches sharing the R8C2 crust. The two remaining stub
// arrows -- a down-left stub at R1C9 and an up-right stub at R9C1, the only
// two diagonal stubs in the payload -- point straight at each other along
// the grid's anti-diagonal (R1C9-R2C8-R3C7-...-R8C2-R9C1), so they are a
// diagonal-facing pair and form a fifteenth, diagonal sandwich.

function sandwich(crustA, crustB, bread) {
  // S = bread_sum + crustA + crustB (sandwich total, crusts included).
  // Or(S == 10*crustA + crustB, S == 10*crustB + crustA) reduces to
  // Or(bread_sum == 9*crustA, bread_sum == 9*crustB).
  return new Or([
    new Sum(0, ...bread, [crustA, -9]),
    new Sum(0, ...bread, [crustB, -9]),
  ]);
}

const rowCells = (r, c0, c1) => {
  const cells = [];
  for (let c = c0; c <= c1; c++) cells.push(makeCellId(r, c));
  return cells;
};
const colCells = (c, r0, r1) => {
  const cells = [];
  for (let r = r0; r <= r1; r++) cells.push(makeCellId(r, c));
  return cells;
};

const sandwiches = [
  // Rows
  sandwich(makeCellId(1, 2), makeCellId(1, 9), rowCells(1, 3, 8)),
  sandwich(makeCellId(2, 4), makeCellId(2, 9), rowCells(2, 5, 8)),
  sandwich(makeCellId(3, 2), makeCellId(3, 6), rowCells(3, 3, 5)),
  sandwich(makeCellId(4, 3), makeCellId(4, 7), rowCells(4, 4, 6)),
  sandwich(makeCellId(6, 5), makeCellId(6, 9), rowCells(6, 6, 8)),
  sandwich(makeCellId(7, 3), makeCellId(7, 7), rowCells(7, 4, 6)),
  sandwich(makeCellId(8, 2), makeCellId(8, 9), rowCells(8, 3, 8)),
  // Columns
  sandwich(makeCellId(1, 2), makeCellId(8, 2), colCells(2, 2, 7)),
  sandwich(makeCellId(5, 2), makeCellId(8, 2), colCells(2, 6, 7)),
  sandwich(makeCellId(4, 3), makeCellId(7, 3), colCells(3, 5, 6)),
  sandwich(makeCellId(2, 4), makeCellId(9, 4), colCells(4, 3, 8)),
  sandwich(makeCellId(6, 5), makeCellId(9, 5), colCells(5, 7, 8)),
  sandwich(makeCellId(4, 7), makeCellId(7, 7), colCells(7, 5, 6)),
  sandwich(makeCellId(3, 8), makeCellId(9, 8), colCells(8, 4, 8)),
  sandwich(makeCellId(1, 9), makeCellId(8, 9), colCells(9, 2, 7)),
  // Anti-diagonal (R1C9 <-> R9C1)
  sandwich(
    makeCellId(1, 9), makeCellId(9, 1),
    [2, 3, 4, 5, 6, 7, 8].map(r => makeCellId(r, 10 - r)),
  ),
];

return [
  new Shape('9x9'),
  ...sandwiches,
];
