// Title: Clapping on the 1 and 3
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=sK2AdHs6Lrs
// Source: https://sudokupad.app/e4i4jbq62m

// Every row, column and box contains exactly two 1s, two 3s, and one each of
// 2, 4, 5, 6 and 7. Each cage sums to its total, and digits may repeat within a
// cage. Two cells a chess knight's move apart cannot contain the same digit.
// There are no given digits.
//
// Rows and columns repeat digits, so the puzzle cannot be a default
// Sudoku-type main grid, whose rows and columns are always all-different.
// The 9x9 grid is Raw: no implicit constraints, and every rule below is
// stated explicitly.

const shape = new Shape('9x9', '1-7', 'Raw');
const REF = cellGraph(shape);

const MULTISET = '1_1_2_3_3_4_5_6_7';
// A Raw grid has no default boxes, so the 3x3 tiling is built explicitly.
const boxes = [];
for (let row = 1; row <= 9; row += 3)
  for (let col = 1; col <= 9; col += 3)
    boxes.push(REF.block(makeCellId(row, col), 3, 3));
const units = [...REF.rows(), ...REF.columns(), ...boxes].map(
  cells => new ContainExact(MULTISET, ...cells));

// Cage cells and totals as drawn on the grid.
const CAGES = [
  { total: 5, cells: ['R3C1', 'R3C2', 'R4C1', 'R4C2'] },
  { total: 6, cells: ['R6C8', 'R6C9', 'R7C8', 'R7C9'] },
  { total: 8, cells: ['R1C5', 'R1C6', 'R2C5', 'R2C6'] },
  { total: 6, cells: ['R9C5', 'R9C6'] },
  { total: 9, cells: ['R3C9', 'R4C9'] },
  { total: 14, cells: ['R8C2', 'R8C3', 'R9C2', 'R9C3'] },
  { total: 8, cells: ['R1C2', 'R1C3'] },
  { total: 3, cells: ['R6C3', 'R6C4'] },
  { total: 25, cells: ['R6C5', 'R6C6', 'R7C5', 'R7C6'] },
];
// Sum rather than Cage, because the rules allow repeats. The 25 cage requires
// them: four distinct digits from 1-7 reach at most 7 + 6 + 5 + 4 = 22.
const cages = CAGES.map(
  ({ total, cells }) => new Sum(total, ...cells));

// Four of the eight knight offsets cover each unordered knight pair exactly
// once. Each offset becomes one Replicate: the template is the pair at the
// first grid cell that has a partner at that offset, stamped onto every cell
// that does. 224 knight pairs in four constraints.
const KNIGHT_OFFSETS = [[1, 2], [2, 1], [-1, 2], [2, -1]];
const antiKnight = KNIGHT_OFFSETS.map(([dRow, dCol]) => {
  const targets = REF.cells().filter(cell => REF.step(cell, dRow, dCol));
  const origin = targets[0];
  const pair = new AllDifferent(origin, REF.step(origin, dRow, dCol));
  return new Replicate(
    [pair], Replicate.encodeTargetCells(targets, origin, REF), origin);
});

return [
  shape,
  ...units,
  ...cages,
  ...antiKnight,
];
