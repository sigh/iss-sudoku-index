// Title: WL SP 2.27.22
// Author: Andypip88
// Video: https://www.youtube.com/watch?v=jVMMUHkxTl8
// Source: https://app.crackingthecryptic.com/sudoku/h3MNDhttmF

// Normal sudoku rules apply (default 9x9 rows/cols/boxes; the drawn regions
// are the standard 3x3 boxes). Cages show their sums. Every line in the grid
// is a thermometer whose bulb end is undetermined: it only increases from one
// end to the other, so each is encoded as a disjunction over both reading
// directions (Or(Thermo(forward), Thermo(reversed))). The three outside
// diagonal-sum clues explicitly allow repeated digits, so they are Sum, not
// a distinct-enforcing class; the corner one (single-cell diagonal) reduces
// to a plain Sum over that one cell.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cages (single-cell cage is real, not decorative).
const cages = [
  new Cage(2, 'R2C1'),
  new Cage(27, 'R4C3', 'R4C4', 'R4C5', 'R4C6'),
  new Cage(22, 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8'),
];

// Outside diagonal clues (each arrow's own waypoint direction resolves its
// ray). The 27-diagonal runs corner to corner; the 22-diagonal starts on the
// bottom edge (not a grid corner) but LittleKiller's cellMap covers any
// edge-anchored diagonal, so fromCells still finds it. The 2-clue's ray is a
// single cell (R1C9, a grid corner), which LittleKiller does not model as
// its own clue, so it is a plain Sum over that cell.
const diagonals = [
  LittleKiller.fromCells(27, graph.ray('R9C1', -1, 1), geometry),
  LittleKiller.fromCells(22, graph.ray('R9C5', -1, -1), geometry),
  new Sum(2, 'R1C9'),
];

// Lines. Each is a thermometer with no fixed bulb: the digits strictly
// increase from one end to the other, but which end is low is not given, so
// accept either reading direction.
const linePaths = [
  ['R2C8', 'R2C9', 'R3C8', 'R3C9'],
  ['R5C6', 'R5C7', 'R6C6', 'R6C7'],
  ['R5C8', 'R5C9', 'R6C8'],
  ['R8C6', 'R8C7', 'R9C6', 'R9C7'],
  ['R8C8', 'R8C9', 'R9C8', 'R9C9'],
  ['R2C1', 'R3C1', 'R4C1', 'R3C2', 'R4C3', 'R3C3', 'R2C3'],
  ['R2C4', 'R3C4', 'R4C4', 'R4C5'],
  ['R6C2', 'R6C1', 'R7C1', 'R7C2', 'R8C2', 'R8C1'],
  ['R8C3', 'R7C3', 'R6C3', 'R6C4', 'R6C5', 'R7C5', 'R7C4'],
];
const undirectedThermos = linePaths.map(
  path => new Or([new Thermo(...path), new Thermo(...path.slice().reverse())]));

return [
  new Shape('9x9'),
  ...cages,
  ...diagonals,
  ...undirectedThermos,
];
