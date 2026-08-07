// Title: Killer Sudomino
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=UyvzaLg1NM4
// Source: https://app.crackingthecryptic.com/sudoku/mGtft8fRN9

// Standard sudoku: rows, columns and boxes each hold 1-9 once (default 9x9
// regions). 13 killer cages (sum + no repeat). Two 3-cell outside diagonals,
// each a sum only (the rules do not state a no-repeat rule for diagonals).
//
// Omitted: the rules also describe an undrawn partition of the whole grid
// into "coloured regions" of unknown, variable size (1-9 cells each), with:
//   - no digit repeats within a coloured region;
//   - a digit equal to a region's cell-count cannot appear in that region;
//   - no two regions of the same size may share an edge;
//   - every cage/diagonal clue number above is *also* the total cell-count
//     of every coloured region overlapping that cage/diagonal (only the
//     digit-sum half of each clue is encoded here).
// This partition is unanchored (no single clue pins any one region -- every
// numeric clue aggregates the sizes of however many regions overlap it) and
// unbounded (region count and sizes are free), which has no known ISS
// encoding.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Cages, provenance: payload `cages` array (cell coords converted from
  // 0-indexed [row,col] to R#C#).
  new Cage(11, 'R1C6', 'R1C7'),
  new Cage(13, 'R2C6', 'R2C7'),
  new Cage(12, 'R3C6', 'R3C7'),
  new Cage(8, 'R1C9', 'R2C9'),
  new Cage(8, 'R1C2', 'R2C2', 'R2C1'),
  new Cage(11, 'R3C3', 'R3C4', 'R4C4'),
  new Cage(8, 'R4C1', 'R4C2'),
  new Cage(19, 'R5C1', 'R6C1', 'R6C2', 'R5C2'),
  new Cage(6, 'R7C3', 'R8C3', 'R9C3'),
  new Cage(23, 'R7C4', 'R8C4', 'R9C4'),
  new Cage(8, 'R6C4', 'R6C5', 'R6C6'),
  new Cage(23, 'R5C8', 'R6C8', 'R5C9'),
  new Cage(9, 'R8C7', 'R8C8'),

  // Diagonals, provenance: payload `arrows` off-grid rays, each paired with
  // an "8" text `overlays` badge by nearest spatial distance. Each ray runs
  // from its on-grid corner cell to the grid edge.
  LittleKiller.fromCells(8, graph.ray('R1C7', 1, 1), geometry),
  LittleKiller.fromCells(8, graph.ray('R7C9', 1, -1), geometry),
];
