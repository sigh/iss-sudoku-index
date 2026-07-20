// Title: Clapping on the 1 and 3
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=sK2AdHs6Lrs
// Source: https://sudokupad.app/e4i4jbq62m

// Every row, column, and box contains exactly two 1s, two 3s, and one
// each of 2, 4, 5, 6, and 7. Cages have the indicated sums and allow
// repeated digits. Equal digits cannot be a chess knight's move apart.
//
// The repeated row and column values cannot live in the ISS main grid,
// whose rows and columns are always all-different. The real puzzle grid
// is therefore the row-major VG overlay; a pinned 1x7 main grid is only
// a placeholder.

const REF = cellGraph('9x9');
const GRID = REF.makeOverlay('VG');
const MULTISET = '1_1_2_3_3_4_5_6_7';

const groups = [
  ...REF.rows(),
  ...REF.columns(),
  ...REF.boxes(),
].map(cells => new ContainExact(MULTISET, ...GRID.at(cells)));

// Cage geometry is the puzzle's drawn data. Sum permits repeats, unlike Cage.
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
const cages = CAGES.map(({ total, cells }) =>
  new Sum(total, ...GRID.at(cells)));

// Four orientations cover every undirected knight edge exactly once. Maximal
// paths provide the edge lists without hand-enumerating all knight pairs.
const KNIGHT_OFFSETS = [[1, 2], [2, 1], [-1, 2], [2, -1]];
const knightPaths = KNIGHT_OFFSETS.flatMap(([dRow, dCol]) =>
  REF.cells()
    .filter(cell =>
      !REF.step(cell, -dRow, -dCol) && REF.step(cell, dRow, dCol))
    .map(start => {
      const path = [];
      for (let cell = start; cell; cell = REF.step(cell, dRow, dCol)) {
        path.push(cell);
      }
      return path;
    }));
const antiKnight = knightPaths.flatMap(path =>
  path.slice(1).map((cell, i) =>
    new AllDifferent(...GRID.at([path[i], cell]))));

const placeholderCells = cellGraph('1x7').cells();

return [
  new Shape('1x7'),
  GRID.toVar('Grid'),
  ...placeholderCells.map((cell, i) => new Given(cell, i + 1)),
  ...groups,
  ...cages,
  ...antiKnight,
];
