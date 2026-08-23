// Title: Pentomino Sudoku
// Author: Rodolfo Kurchan
// Video: https://www.youtube.com/watch?v=1vBDaAfooU4
// Source: https://app.crackingthecryptic.com/sudoku/Jfp7QJ8LFn

// Normal sudoku rules apply (default row/column/box all-different from the
// standard 3x3 boxes). The grid is divided into sixteen pentominoes with a
// per-pentomino digit sum and no repeated digit within a pentomino; the
// centre cell R5C5 belongs to no pentomino.
//
// Four of the sixteen pentominoes are already fixed by the drawn grey
// shading -- each corner block is a single connected 5-cell V-pentomino, so
// no partition choice is needed there. They are encoded directly as killer
// cages (Cage enforces both the sum and the no-repeat clause for these
// cells).
//
// The other twelve pentominoes tile the 60 white cells, one of each of the
// twelve free pentomino shapes, and are NOT encoded: see omitted_rules.
return [
  new Shape('9x9'),

  new Given('R3C1', 3),
  new Given('R6C2', 9),
  new Given('R6C8', 6),
  new Given('R8C2', 4),
  new Given('R8C6', 1),
  new Given('R9C1', 7),
  new Given('R9C7', 8),

  // Grey corner pentominoes (fixed by the drawn shading; provenance: the
  // puzzle's shaded-cell underlays). Sum-clue cell -> region, from the
  // overlay text nearest each region.
  new Cage(20, 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1'),   // top-left
  new Cage(31, 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'),   // bottom-left
  new Cage(22, 'R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9'),   // bottom-right
  new Cage(22, 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'),   // top-right
];
