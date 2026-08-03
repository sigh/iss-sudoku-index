// Title: Maxwell Sudoku
// Author: Brian Scott
// Video: https://www.youtube.com/watch?v=Iw_v7kLlYGI
// Source: https://app.crackingthecryptic.com/sudoku/NmhBfbT4J7

// Standard sudoku, plus: a grey max cell's value exceeds all four orthogonal
// neighbours; a red well cell's value is less than all four orthogonal
// neighbours; each max cell has a corresponding well cell of the same value,
// with the pairing left open by the rules; three thermometers increase from
// their bulb; and the two outside diagonal clues give the diagonal's sum.
const graph = cellGraph('9x9');

// Max (grey) and well (red) cell positions, from the grey/red 1x1 underlays.
const maxCells = ['R2C2', 'R2C8', 'R4C6'];
const wellCells = ['R6C4', 'R8C2', 'R8C8'];

// Each max/well cell also carries four short drawn ticks pointing to its
// four orthogonal neighbours -- a visual "surrounded" affordance, not an
// additional clue -- so "surrounded" is expanded here as all four orthogonal
// neighbours via the cell graph rather than hand-listed.
const maxConstraints = maxCells.flatMap(
  cell => graph.neighbours(cell).map(n => new GreaterThan(cell, n)));
const wellConstraints = wellCells.flatMap(
  cell => graph.neighbours(cell).map(n => new GreaterThan(n, cell)));

return [
  new Shape('9x9'),

  ...maxConstraints,
  ...wellConstraints,

  // "Each max cell has a corresponding well cell of the same value": the
  // rules leave the pairing open, so this is a same-multiset requirement
  // between the two groups rather than a fixed cell-to-cell pairing.
  new SameValues(2, ...maxCells, ...wellCells),

  // Thermometers, bulb first (grey lines, from wayPoints[0]).
  new Thermo('R7C4', 'R7C5', 'R6C5'),
  new Thermo('R3C6', 'R3C5', 'R4C5'),
  new Thermo('R8C7', 'R9C8'),

  // Outside diagonal sums, from the two off-grid arrows and their paired
  // "45"/"43" overlays.
  LittleKiller.fromCells(45, graph.ray('R1C1', 1, 1), cellGeometry('9x9')),
  LittleKiller.fromCells(43, graph.ray('R1C9', 1, -1), cellGeometry('9x9')),
];
