// Title: TH13TEEN
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=IMPCPEbOWNM
// Source: https://sudokupad.app/dkjeovl1up

// Every row, column, and box contains one each of 2, 4, 5, 6, and 7;
// digits 1 and 3 each occur at least once. Every 1/3 belongs to an
// orthogonally adjacent 13 read left-to-right or top-to-bottom. Killer
// cages have distinct digits and the indicated totals.
//
// Since repeats are required in nine-cell houses containing only seven
// values, the real puzzle is the row-major VG Var grid. The pinned 1x7
// main grid is only a placeholder.

const REF = cellGraph('9x9');
const GRID = REF.makeOverlay('VG');

// Five values occur exactly once. The remaining four cells are 1s and 3s,
// with each present at least once.
const houseCells = [
  ...REF.rows(),
  ...REF.columns(),
  ...REF.boxes(),
];
const houses = houseCells.flatMap(cells => [
  new ContainExact('2_4_5_6_7', ...GRID.at(cells)),
  new ContainAtLeast('1_3', ...GRID.at(cells)),
]);

// A 1 must see a 3 immediately right or down; a 3 must see a 1
// immediately left or up. The first branch makes the implication vacuous
// for every other value.
const NOT_ONE = [2, 3, 4, 5, 6, 7];
const NOT_THREE = [1, 2, 4, 5, 6, 7];
const thirteenPairs = REF.cells().flatMap(cell => {
  const gridCell = GRID.at(cell);
  const right = REF.step(cell, 0, 1);
  const down = REF.step(cell, 1, 0);
  const left = REF.step(cell, 0, -1);
  const up = REF.step(cell, -1, 0);
  const oneBranches = [new Given(gridCell, ...NOT_ONE)];
  const threeBranches = [new Given(gridCell, ...NOT_THREE)];
  if (right) oneBranches.push(new Given(GRID.at(right), 3));
  if (down) oneBranches.push(new Given(GRID.at(down), 3));
  if (left) threeBranches.push(new Given(GRID.at(left), 1));
  if (up) threeBranches.push(new Given(GRID.at(up), 1));
  return [new Or(oneBranches), new Or(threeBranches)];
});

// Cage geometry is the puzzle's drawn data. Cage enforces both the sum
// and the stated no-repeat rule, including for digits 1 and 3.
const CAGES = [
  { total: 13, cells: ['R7C7', 'R8C7', 'R9C7', 'R9C8'] },
  { total: 13, cells: ['R7C8', 'R7C9', 'R8C9', 'R9C9'] },
  { total: 13, cells: ['R8C1', 'R8C2', 'R8C3', 'R8C4'] },
  { total: 13, cells: ['R2C8', 'R3C8', 'R4C8', 'R5C8'] },
  { total: 13, cells: ['R5C9', 'R6C9'] },
  { total: 13, cells: ['R7C1', 'R7C2', 'R7C3'] },
  { total: 13, cells: ['R9C1', 'R9C2', 'R9C3'] },
  { total: 9, cells: ['R1C8', 'R1C9', 'R2C9'] },
  { total: 13, cells: ['R6C6', 'R7C5', 'R7C6'] },
  { total: 13, cells: ['R5C2', 'R6C2', 'R6C3'] },
  { total: 13, cells: ['R1C1', 'R1C2', 'R2C1'] },
  { total: 13, cells: ['R3C3', 'R3C4', 'R4C3', 'R4C4'] },
];
const cages = CAGES.map(({ total, cells }) =>
  new Cage(total, ...GRID.at(cells)));

const placeholderCells = cellGraph('1x7').cells();

return [
  new Shape('1x7'),
  GRID.toVar('Grid'),
  ...placeholderCells.map((cell, i) => new Given(cell, i + 1)),
  ...houses,
  ...thirteenPairs,
  ...cages,
];
