// Title: Taco Bowl 3 - Ring of Fire
// Author: DiMono
// Video: https://www.youtube.com/watch?v=Dw1-ooNXMFY
// Source: https://app.crackingthecryptic.com/sudoku/Fbf8q9pGJT

// Rules, in full, as the setter states them:
//
//   Normal sudoku rules apply. Additionally, when two arrows face each other,
//   they are crusts of a "sandwich". Ie The digits in the crust cells must be
//   the sum of the sandwich INCLUDING the crusts, in some order. For example,
//   if there are two arrows with 3 cells between them (-> _ _ _ <-), two valid
//   solutions could be 74862 or 24867, because either way the digits
//   = 7+4+8+6+2 = 27.
//
// There are no givens. Nothing else is drawn on the board but the arrows, so
// every clue is one of the 16 sandwiches listed below. Standard 9x9 boxes.
//
// Reading the arrows. Each of the 31 drawn arrows is a stub about a third of a
// cell long, lying wholly inside one cell with its head on that cell's border;
// the stub is a direction flag on its own cell. Two stubs on a common row,
// column or diagonal that point towards each other are a facing pair, and the
// two cells holding them are that sandwich's crusts -- the crusts are inside
// the sandwich, as the setter's "-> _ _ _ <-" example shows by giving that
// five-cell run five digits. Pairing the stubs this way uses every stub
// exactly once except the up-stub in R8C2, which faces both the R1C2 and the
// R5C2 down-stubs along column 2 and so is a crust of two sandwiches. The
// ruleset the setter's preamble names as this puzzle's ancestor (Stephane
// Bura's "Stacked Sandwiches Sudoku") states both of those points outright:
// arrows pair "in a row, a column or a diagonal", and "a cell can be a
// boundary for several sandwiches in the same line". What DiMono changed from
// it is that his total includes the crust digits.

// The crust arithmetic. For crust digits a and b, with S the sum of the bread
// cells (those strictly between the crusts), the sandwich total is S + a + b
// and must read as the two-digit number ab or ba:
//   S + a + b == 10a + b  =>  S == 9a
//   S + a + b == 10b + a  =>  S == 9b
// so each sandwich is a two-way Or over the bread cells, with the chosen crust
// carried in the same Sum at coefficient -9 and a target of 0.
const sandwich = (crustA, crustB, bread) => new Or([
  new Sum(0, ...bread, [crustA, -9]),
  new Sum(0, ...bread, [crustB, -9]),
]);

const between = (r0, c0, r1, c1) => {
  // Cells strictly between two crusts on a shared row, column or diagonal.
  const n = Math.max(Math.abs(r1 - r0), Math.abs(c1 - c0));
  const dr = (r1 - r0) / n;
  const dc = (c1 - c0) / n;
  const cells = [];
  for (let i = 1; i < n; i++) cells.push(makeCellId(r0 + i * dr, c0 + i * dc));
  return cells;
};

// Crust pairs, transcribed from the drawn arrow stubs: [rowA, colA, rowB, colB].
const crustPairs = [
  // Rows: a right-stub facing a left-stub.
  [1, 2, 1, 9],
  [2, 4, 2, 9],
  [3, 2, 3, 6],
  [4, 3, 4, 7],
  [6, 5, 6, 9],
  [7, 3, 7, 7],
  [8, 2, 8, 9],
  // Columns: a down-stub facing an up-stub. Column 2 has three stubs
  // (down R1C2, down R5C2, up R8C2) and so contributes two of these pairs.
  [1, 2, 8, 2],
  [5, 2, 8, 2],
  [4, 3, 7, 3],
  [2, 4, 9, 4],
  [6, 5, 9, 5],
  [4, 7, 7, 7],
  [3, 8, 9, 8],
  [1, 9, 8, 9],
  // Anti-diagonal: the board's only two diagonal stubs, down-left in R1C9 and
  // up-right in R9C1, pointing at each other along R1C9-R2C8-...-R8C2-R9C1.
  [1, 9, 9, 1],
];

return [
  new Shape('9x9'),
  ...crustPairs.map(([r0, c0, r1, c1]) => sandwich(
    makeCellId(r0, c0), makeCellId(r1, c1), between(r0, c0, r1, c1))),
];
