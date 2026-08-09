// Title: Good Luck, Bad Luck
// Author: Xykruzine
// Video: https://www.youtube.com/watch?v=CDi1Nrsi9tI
// Source: https://app.crackingthecryptic.com/sudoku/BL4mM6pM8f

// Normal sudoku rules apply.
// "A digit appearing in the nth column of a row indicates the column where n
// appears in that row": if cell (R,C) has value V, cell (R,V) has value C.
// This is column indexing (Indexing below), applied to every cell -- the rule
// text names no scope, unlike puzzles that restrict it to marked cells.
// Cages: digits do not repeat and sum to the value shown in the cage's
// top-left cell (Cage below).
// A black dot joins digits with a 1:2 ratio (BlackDot below).

return [
  new Shape('9x9'),

  new Given('R1C7', 7),
  new Given('R2C4', 4),
  new Given('R3C1', 1),
  new Given('R4C8', 8),
  new Given('R5C5', 5),
  new Given('R6C2', 2),
  new Given('R7C9', 9),
  new Given('R8C6', 6),
  new Given('R9C3', 3),

  // Indexing('C', ...cells) applies once per listed cell: for control cell
  // (R,C) holding value V, it forces cell (R,V) to hold C. Passing every grid
  // cell scopes the rule to the whole grid, as the unrestricted rules text
  // requires.
  new Indexing('C', ...cellGraph('9x9').rows().flat()),

  // Cages (two-cell, alternating 7/13 totals), from the source `cages` array.
  new Cage(7, 'R1C1', 'R1C2'),
  new Cage(13, 'R1C6', 'R2C6'),
  new Cage(7, 'R2C9', 'R3C9'),
  new Cage(13, 'R5C7', 'R5C6'),
  new Cage(7, 'R5C4', 'R5C3'),
  new Cage(13, 'R9C9', 'R9C8'),
  new Cage(7, 'R8C4', 'R9C4'),
  new Cage(13, 'R7C1', 'R8C1'),

  // Black dot, from the source `overlays` array (edge R3C3/R4C3).
  new BlackDot('R3C3', 'R4C3'),
];
