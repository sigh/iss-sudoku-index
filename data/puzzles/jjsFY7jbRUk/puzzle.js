// Title: Little Killer Thermo Sudoku
// Author: Willy Wonka
// Video: https://www.youtube.com/watch?v=jjsFY7jbRUk
// Source: https://app.crackingthecryptic.com/webapp/FptR6QTqQ2

// Normal sudoku rules apply. Along thermometers, digits increase from the
// bulb end (Thermo). Clues outside the grid give the sum of the digits
// along the diagonal the arrow points into (LittleKiller); digits may
// repeat on a diagonal except where the ordinary row/column/box rules
// already forbid it, so no extra constraint is needed for that clause.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Thermo(...cells): first cell is the bulb; values strictly increase from
// there. Paths taken from the drawn grey lines; each path's first cell
// matches a drawn grey circle underlay (the bulb).
const thermos = [
  new Thermo('R9C9', 'R8C9', 'R7C9', 'R6C9'),
  new Thermo('R7C7', 'R7C6', 'R8C6', 'R9C6'),
  new Thermo('R2C1', 'R2C2', 'R2C3', 'R3C3'),
  new Thermo('R1C7', 'R1C6', 'R1C5', 'R2C5'),
  new Thermo('R5C3', 'R5C4', 'R6C4', 'R7C4', 'R7C3'),
];

// Little Killer diagonals: start cell and travel direction read from each
// drawn arrow's entry corner and heading, then walked to the grid edge.
// The top-left corner carries two distinct 49-total diagonals (the full
// main diagonal from R1C1, and the shorter one starting at R1C2), each
// with its own arrow in the source.
const littleKillers = [
  LittleKiller.fromCells(49, graph.ray('R1C1', 1, 1), geometry),
  LittleKiller.fromCells(49, graph.ray('R1C2', 1, 1), geometry),
  LittleKiller.fromCells(23, graph.ray('R6C1', -1, 1), geometry),
  LittleKiller.fromCells(22, graph.ray('R9C5', -1, -1), geometry),
  LittleKiller.fromCells(21, graph.ray('R6C9', 1, -1), geometry),
  LittleKiller.fromCells(20, graph.ray('R7C9', 1, -1), geometry),
  LittleKiller.fromCells(10, graph.ray('R8C9', 1, -1), geometry),
];

return [
  new Shape('9x9'),
  ...thermos,
  ...littleKillers,
];
