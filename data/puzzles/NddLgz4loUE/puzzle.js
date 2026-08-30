// Title: Dazzling Thermo Killer Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=NddLgz4loUE
// Source: https://cracking-the-cryptic.web.app/sudoku/DLTMLdgrGN

// Standard sudoku (default row/column/box all-different, no givens), plus 7
// thermometers and 5 little-killer diagonal sum arrows. No cages, dots, or
// other clue types appear in the payload. Thermo cells are bulb-first,
// transcribed from the payload's `lines` array (grey, thickness 15), each
// bulb confirmed against a matching circle overlay at the line's first
// waypoint. Little-killer diagonals are transcribed from the payload's
// `arrows` + outside-clue text `overlays`, paired by nearest spatial
// distance; each direction follows the arrow's own drawn ray.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const thermos = [
  new Thermo('R2C3', 'R2C2', 'R2C1', 'R3C1'),
  new Thermo('R4C9', 'R3C9', 'R2C9', 'R2C8'),
  new Thermo('R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6'),
  new Thermo('R7C9', 'R7C8', 'R6C8'),
  new Thermo('R8C9', 'R9C9'),
  new Thermo('R8C5', 'R7C5', 'R7C4'),
  new Thermo('R8C3', 'R8C2', 'R8C1', 'R7C1'),
];

const littleKillers = [
  LittleKiller.fromCells(10, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(12, graph.ray('R1C4', 1, -1), geometry),
  LittleKiller.fromCells(9, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(14, graph.ray('R4C9', -1, -1), geometry),
  LittleKiller.fromCells(14, graph.ray('R7C1', 1, 1), geometry),
];

return [
  ...thermos,
  ...littleKillers,
];
