// Title: Code 9-12
// Author: Sumanta Mukherjee
// Video: https://www.youtube.com/watch?v=rHXlYBKQhNs
// Source: https://app.crackingthecryptic.com/sudoku/MbGHh7MgDT

// Rules encoded: normal sudoku; killer cages (sum to the small top-left total,
// no repeats within a cage); two outside diagonal-sum clues (repeats allowed
// along the diagonal, per the rules text); three colour-grouped clone
// dominoes (each colour's dominoes must carry the identical digit in the
// identical position, per the worked example "r4c1=r1c7=r7c4"); Kropki black
// dots (1:2 ratio) and a white dot (consecutive) with not all dots given;
// a purple Renban line (non-repeating consecutive digits, any order); a grey
// line whose two box-segments must sum equally.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),

  // Given, from the drawn grid.
  new Given('R3C2', 9),

  // Killer cages, from the drawn cage outlines and printed totals.
  new Cage(12, 'R1C1', 'R1C2'),
  new Cage(12, 'R4C4', 'R4C5'),
  new Cage(12, 'R7C7', 'R7C8'),
  new Cage(9, 'R5C9', 'R6C9'),
  new Cage(9, 'R2C6', 'R3C6'),

  // Outside diagonal-sum clues: a drawn arrow gives the diagonal direction,
  // paired with a printed total outside the grid. Each arrowhead sits on the
  // grid corner shared by two cells (R1C3/R1C4, resp. R9C6/R9C7); the drawn
  // shaft's direction (down-right, resp. up-left) is what selects R1C4
  // (resp. R9C6) as the on-grid diagonal-start cell.
  LittleKiller.fromCells(24, graph.ray('R1C4', 1, 1), geometry),
  LittleKiller.fromCells(16, graph.ray('R9C6', -1, -1), geometry),

  // Clone dominoes: three coloured dominoes per colour. Each domino's cells
  // are listed geometrically-first cell first (left cell for a horizontal
  // domino, top cell for a vertical one), matching the rule's own example
  // (r4c1=r1c7=r7c4, all left cells). SameValues(3, ...) ties each position
  // across the three same-colour dominoes.
  // Yellow-green: R4C1-R4C2, R1C7-R1C8, R7C4-R7C5 (all horizontal).
  new SameValues(3, 'R4C1', 'R1C7', 'R7C4'),
  new SameValues(3, 'R4C2', 'R1C8', 'R7C5'),
  // Deepskyblue: R5C3-R6C3, R2C9-R3C9, R8C6-R9C6 (all vertical).
  new SameValues(3, 'R5C3', 'R2C9', 'R8C6'),
  new SameValues(3, 'R6C3', 'R3C9', 'R9C6'),
  // Red: R7C1-R7C2, R1C4-R1C5, R4C7-R4C8 (all horizontal).
  new SameValues(3, 'R7C1', 'R1C4', 'R4C7'),
  new SameValues(3, 'R7C2', 'R1C5', 'R4C8'),

  // Kropki dots, from the drawn edge-marks (black fill/border, and one white
  // fill with black border).
  new BlackDot('R8C3', 'R9C3'),
  new BlackDot('R5C6', 'R6C6'),
  new BlackDot('R8C9', 'R9C9'),
  new WhiteDot('R2C3', 'R3C3'),

  // Purple line: R7C8-R6C8-R6C9.
  new Renban('R7C8', 'R6C8', 'R6C9'),

  // Grey line: R3C3-R2C3-R1C4-R1C5, walking through box 1 (R3C3, R2C3) then
  // box 2 (R1C4, R1C5).
  new RegionSumLine('R3C3', 'R2C3', 'R1C4', 'R1C5'),
];
