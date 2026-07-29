// Title: 22. Caged Snakey
// Author: AstralSky
// Video: https://www.youtube.com/watch?v=8nwws3rjUrc
// Source: https://sudokupad.app/LbhRLHDjJH

// Standard Sudoku. Cage digits may repeat; shown totals are sums. Adjacent
// cages have no common digit. The fixed cage snake and fog are drawing/UI facts.

const graph = cellGraph('9x9');
const cages = [
  { total: 52, cells: ['R1C1','R2C1','R2C2','R2C3','R3C3','R4C2','R4C3'] },
  { total: 16, cells: ['R4C1','R5C1','R6C1','R6C2','R7C2','R7C3'] },
  { total: 16, cells: ['R1C4','R1C5','R2C5','R2C6'] },
  { total: 46, cells: ['R3C6','R4C6','R4C7','R4C8','R5C8','R6C8','R6C9','R7C9'] },
  { total: 5, cells: ['R7C4'] },
  { total: 9, cells: ['R6C4','R6C5','R6C6'] },
  { total: null, cells: ['R7C6','R7C7','R8C7','R9C7','R9C8'] },
  { total: null, cells: ['R8C9','R9C9'] },
];
const cageAt = new Map(cages.flatMap((cage, index) => cage.cells.map(cell => [cell, index])));
const borders = [...cageAt].flatMap(([cell, index]) => graph.neighbours(cell)
  .filter(other => cageAt.has(other) && cageAt.get(other) !== index && cell < other)
  .map(other => [cell, other]));

return [
  new Shape('9x9'),
  new Given('R1C1', 9), new Given('R4C1', 1), new Given('R9C1', 7), new Given('R9C5', 3), new Given('R9C9', 9),
  ...cages.filter(cage => cage.total !== null).map(cage => new Sum(cage.total, ...cage.cells)),
  ...borders.map(cells => new AllDifferent(...cells)),
];
