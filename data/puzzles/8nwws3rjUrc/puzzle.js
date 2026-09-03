// Title: 22. Caged Snakey
// Author: AstralSky
// Video: https://www.youtube.com/watch?v=8nwws3rjUrc
// Source: https://sudokupad.app/LbhRLHDjJH

// Rules:
//   Normal sudoku rules apply. Digits may repeat within a cage and sum to the
//   total in the cage's top left corner, if given. All cages must be of
//   different sizes. Two cages that neighbour one another (ie share an edge)
//   must not share a common digit. All the cages in the puzzle combined form a
//   1-cell-wide snake. The snake doesn't branch and doesn't touch itself
//   orthogonally, but may touch itself diagonally. The start and end of the
//   snake must be found by the solver. The grid is partly covered with fog.
//   Placing correct digits will clear the fog from the surrounding cells.
//   Guessing is not required.
//
// Encoded below: normal sudoku, the five givens, the printed cage totals, and
// the neighbouring-cage rule.
//
// The remaining clauses constrain the cage geometry, and every cage is drawn in
// the puzzle, so they are conditions on fixed data rather than on the digits.
// The assertions after the cage table check them: the eight cages have sizes
// 1..8 (all different), and their 36 cells form a single orthogonally connected
// 1-cell-wide path -- every cage cell has one or two cage-cell neighbours, and
// no 2x2 block is entirely cage cells, which is exactly "doesn't branch" plus
// "doesn't touch itself orthogonally". The two degree-1 cells R1C1 and R1C4 are
// the snake's start and end; the solver finding them under fog is the solving
// experience, not a further condition on the completed grid. Fog is a display
// rule and constrains nothing.

const shape = new Shape('9x9');
const graph = cellGraph('9x9');

// The eight drawn cages, in reading order of their top-left cell. `total` is the
// number printed in that corner, or null for the two cages drawn without one.
const cages = [
  { total: 52, cells: ['R1C1', 'R2C1', 'R2C2', 'R2C3', 'R3C3', 'R4C2', 'R4C3'] },
  { total: 16, cells: ['R1C4', 'R1C5', 'R2C5', 'R2C6'] },
  { total: 46, cells: ['R3C6', 'R4C6', 'R4C7', 'R4C8', 'R5C8', 'R6C8', 'R6C9', 'R7C9'] },
  { total: 16, cells: ['R4C1', 'R5C1', 'R6C1', 'R6C2', 'R7C2', 'R7C3'] },
  { total: 9, cells: ['R6C4', 'R6C5', 'R6C6'] },
  { total: 5, cells: ['R7C4'] },
  { total: null, cells: ['R7C6', 'R7C7', 'R8C7', 'R9C7', 'R9C8'] },
  { total: null, cells: ['R8C9', 'R9C9'] },
];

// Geometry checks for the size and snake clauses, over the cage table above.
const snakeCells = cages.flatMap(cage => cage.cells);
const cageNeighbourCount = (cell) =>
  graph.neighbours(cell).filter(n => snakeCells.includes(n)).length;
const sizes = cages.map(cage => cage.cells.length).sort((a, b) => a - b);
if (sizes.join(',') !== '1,2,3,4,5,6,7,8') throw new Error('cage sizes not all different');
if (!graph.connected(snakeCells)) throw new Error('cages are not one connected group');
if (snakeCells.some(cell => cageNeighbourCount(cell) > 2)) throw new Error('snake branches');
if (snakeCells.filter(cell => cageNeighbourCount(cell) === 1).length !== 2) throw new Error('snake is not a path');
if (graph.cells().some(cell => {
  const block = graph.block(cell, 2, 2);
  return block && block.every(c => snakeCells.includes(c));
})) throw new Error('snake is not 1 cell wide');

// Cage totals: digits may repeat inside a cage, so Sum, never Cage.
const cageTotals = cages
  .filter(cage => cage.total !== null)
  .map(cage => new Sum(cage.total, ...cage.cells));

// "Two cages that neighbour one another (ie share an edge) must not share a
// common digit": every cell of one cage takes a different digit from every cell
// of the other. The relation runs across the two cages only -- repeats stay
// legal inside each cage -- so it is one two-cell AllDifferent per cross-cage
// cell pair, never an AllDifferent over the union of the two cages. Which cages
// neighbour which is derived from the drawn cells rather than listed; because
// the snake never touches itself orthogonally, they come out as the seven
// consecutive pairs along it.
const cageNeighbours = cages.flatMap((cageA, i) =>
  cages.slice(i + 1)
    .filter(cageB => cageA.cells.some(
      a => graph.neighbours(a).some(n => cageB.cells.includes(n))))
    .flatMap(cageB => cageA.cells.flatMap(
      a => cageB.cells.map(b => new AllDifferent(a, b)))));

return [
  shape,
  new Given('R1C1', 9),
  new Given('R4C1', 1),
  new Given('R9C1', 7),
  new Given('R9C5', 3),
  new Given('R9C9', 9),
  ...cageTotals,
  ...cageNeighbours,
];
