// Title: Stairway To Heaven Sudoku
// Author: Willy Wonka
// Video: https://www.youtube.com/watch?v=HB4LZotkWC4
// Source: https://cracking-the-cryptic.web.app/sudoku/22jdQ89B9H

// Normal sudoku rules apply. Cages: digits must sum to the total printed in
// the cage's top-left cell, and may not repeat within a cage -- Cage.
// Diagonal outside clues: the sum of the cells along the indicated diagonal;
// digits may repeat along it -- LittleKiller, which imposes no all-different
// on its own cells.
//
// Each diagonal's cell ray is derived from its arrow's on-grid anchor and
// drawn down-right direction with cellGraph().ray(), then matched to ISS's
// canonical corner via LittleKiller.fromCells: that canonical corner is not
// always the cell nearest the drawn off-grid total.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const diagonals = [
  ['R1C1', 34], // main diagonal; nearest printed total is 34
  ['R1C2', 46], // starts one column right of the top-left corner
  ['R2C1', 36], // starts one row below the top-left corner
];

return [
  new Shape('9x9'),

  // Cages, cells transcribed from the drawn cage outlines.
  new Cage(25, 'R3C1', 'R4C1', 'R4C2', 'R5C2'),
  new Cage(24, 'R5C1', 'R6C1', 'R6C2', 'R7C2'),
  new Cage(21, 'R7C1', 'R8C1', 'R8C2', 'R9C1'),
  new Cage(23, 'R9C2', 'R9C3', 'R9C4', 'R9C5'),
  new Cage(15, 'R8C3', 'R7C3', 'R8C4'),
  new Cage(24, 'R5C3', 'R6C3', 'R6C4', 'R7C4'),
  new Cage(27, 'R7C5', 'R8C5', 'R8C6', 'R9C6', 'R9C7'),

  // Diagonal sums, repeats allowed.
  ...diagonals.map(([start, total]) =>
    LittleKiller.fromCells(total, graph.ray(start, 1, 1), geometry)),
];
