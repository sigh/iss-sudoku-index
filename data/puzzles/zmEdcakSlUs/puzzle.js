// Title: What Do Killers Eat?
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=zmEdcakSlUs
// Source: https://app.crackingthecryptic.com/sudoku/hJLgmn2GfH

// Normal sudoku rules. 17 cages are drawn with no printed total: digits
// inside a cage cannot repeat, but a cage's own total is unknown -- Cage(0,
// ...) is "any total", i.e. all-different only (sudoku_builder.js: "a sum of
// 0 means any sum is ok"). R3C7 belongs to no cage (source has 17 cages
// covering 80 of the 81 cells) and so carries no extra rule.
//
// Rows R1,R2,R3,R7,R8,R9 and columns C1,C2,C3,C4,C7,C8 carry a "?" outside
// clue (drawn as a bare "?", no digit). For each such line, its sandwich
// total (the sum of digits strictly between the 1 and the 9) must equal the
// total of some cage that has at least one cell in that line -- any
// touching cage, not only one lying wholly inside it (the rules' own row-7
// example includes column 1's 7-cell cage and column 2's 8-cell cage, each
// only entering row 7 in a single cell). Lines with no "?" carry no
// constraint.
//
// Encoded directly, with no target Var: for every value v a sandwich total
// can take (0..35 -- at most 7 cells lie strictly between the 1 and 9, whose
// largest possible sum is 2+3+...+8 = 35), assert the line's Sandwich(v)
// together with some touching cage's Sum(v). Infeasible (line, v, cage)
// combinations (e.g. a 9-cell touching cage, which -- having to hold all 9
// digits exactly once since only 9 values exist -- always totals 45, never
// achievable by any sandwich) simply have no satisfying assignment; they
// need no special-casing.

const geometry = cellGeometry('9x9');

// Cage cell lists, transcribed from the source's drawn cage geometry; the
// source gives no cage a printed total.
const cages = [
  [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8]],
  [[1, 9]],
  [[2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1]],
  [[9, 1], [9, 2], [8, 2], [7, 2], [6, 2], [5, 2], [4, 2], [3, 2]],
  [[2, 2]],
  [[2, 3], [3, 3], [4, 3]],
  [[5, 3], [6, 3], [7, 3], [8, 3]],
  [[9, 3], [9, 4], [9, 5], [9, 6], [9, 7], [9, 8], [9, 9]],
  [[8, 4], [8, 5], [8, 6], [7, 7], [8, 7], [8, 8], [7, 8], [7, 9], [8, 9]],
  [[7, 4], [7, 5]],
  [[7, 6], [6, 6], [5, 6], [4, 6], [5, 5]],
  [[6, 5], [6, 4], [5, 4]],
  [[4, 4], [4, 5]],
  [[3, 4], [2, 4], [2, 5], [3, 5], [3, 6], [2, 6], [2, 7], [2, 8], [3, 8]],
  [[4, 7], [4, 8], [4, 9], [3, 9], [2, 9]],
  [[5, 7], [5, 8], [5, 9]],
  [[6, 7], [6, 8], [6, 9]],
].map(cells => cells.map(([r, c]) => makeCellId(r, c)));

const cageConstraints = cages.map(cells => new Cage(0, ...cells));

// Rows/columns marked with a "?" outside clue (source overlays: text "?" at
// the left of each such row / above each such column).
const questionRows = [1, 2, 3, 7, 8, 9];
const questionCols = [1, 2, 3, 4, 7, 8];

const rowCells = r => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const colCells = c => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

const MAX_SANDWICH = 35;

// Cages with at least one cell in this line, derived from the cage cell
// lists above rather than re-transcribed by hand.
function touchingCages(lineCells) {
  const idSet = new Set(lineCells);
  return cages.filter(cage => cage.some(id => idSet.has(id)));
}

function sandwichMatchesTouchingCageTotal(lineCells) {
  const candidates = touchingCages(lineCells);
  const branches = [];
  for (let v = 0; v <= MAX_SANDWICH; v++) {
    branches.push(new And([
      Sandwich.fromCells(v, lineCells, geometry),
      new Or(candidates.map(cage => new Sum(v, ...cage))),
    ]));
  }
  return new Or(branches);
}

const sandwichRules = [
  ...questionRows.map(r => sandwichMatchesTouchingCageTotal(rowCells(r))),
  ...questionCols.map(c => sandwichMatchesTouchingCageTotal(colCells(c))),
];

return [
  new Shape('9x9'),
  ...cageConstraints,
  ...sandwichRules,
];
