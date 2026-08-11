// Title: Spire
// Author: Ambrose
// Video: https://www.youtube.com/watch?v=PPBb-DFv1AE
// Source: https://app.crackingthecryptic.com/sudoku/P4m9MpfD2L

// Normal sudoku rules apply (standard 9x9 grid, rows/columns/boxes all-different,
// the default `Shape('9x9')` baseline). Cages sum to the total shown in the
// cage's top-left cell, with no repeated digit within a cage -- exactly `Cage`'s
// semantics. Each purple line holds a non-repeating, consecutive set of digits
// in any order -- exactly `Renban`'s semantics. No givens.

return [
  new Shape('9x9'),

  // Cages: cells transcribed from the drawn cage geometry (the source's cage
  // list also carries five non-cage metadata stubs, omitted).
  new Cage(9, 'R1C6', 'R1C7'),
  new Cage(10, 'R3C3', 'R3C4'),
  new Cage(10, 'R3C6', 'R3C7'),
  new Cage(11, 'R5C4', 'R5C5', 'R5C6', 'R6C5'),
  new Cage(10, 'R5C7', 'R6C7'),
  new Cage(10, 'R8C2', 'R8C3'),
  new Cage(10, 'R9C3', 'R9C4'),
  new Cage(10, 'R9C6', 'R9C7'),
  new Cage(10, 'R8C7', 'R8C8'),

  // Purple lines: cell paths interpolated from each line's drawn waypoints
  // (row-first, 0-indexed cell centres). A 9th purple line has no waypoints
  // and renders nothing, so it is not a drawn clue and is omitted.
  new Renban('R5C1', 'R4C2'),
  new Renban('R7C1', 'R6C2', 'R5C3', 'R4C4'),
  new Renban('R4C6', 'R5C7', 'R6C8', 'R7C9'),
  new Renban('R4C8', 'R5C9'),
  new Renban('R3C5', 'R4C5', 'R5C5'),
  new Renban('R3C4', 'R2C5', 'R3C6'),
  new Renban('R6C4', 'R6C5', 'R6C6'),
  new Renban('R9C4', 'R8C4', 'R7C5', 'R8C6', 'R9C6'),
];
