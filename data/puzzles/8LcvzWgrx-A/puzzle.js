// Title: Nexus
// Author: udukos
// Video: https://www.youtube.com/watch?v=8LcvzWgrx-A
// Source: https://app.crackingthecryptic.com/sudoku/3PNDfGd4d3

// Normal sudoku rules apply (9x9, standard 3x3 boxes, no givens).
// Cages: digits sum to the total shown in the cage's top-left cell and do
// not repeat within the cage (Cage enforces both).
// Purple lines: digits on the line are strictly between the values in the
// two circled end cells (Between enforces this against the line's first and
// last cell, whichever is larger); the rule does not fix which end is
// larger, so no orientation is assumed.

const cages = [
  new Cage(21, 'R1C2', 'R1C3', 'R2C3'),
  new Cage(12, 'R1C6', 'R2C6', 'R3C6'),
  new Cage(21, 'R2C9', 'R3C8', 'R3C9'),
  new Cage(11, 'R6C7', 'R6C8', 'R6C9'),
  new Cage(19, 'R8C7', 'R9C7', 'R9C8'),
  new Cage(17, 'R7C4', 'R8C4', 'R9C4'),
  new Cage(22, 'R7C1', 'R7C2', 'R8C1'),
  new Cage(13, 'R4C1', 'R4C2', 'R4C3'),
];

// Each line's cell list runs endpoint -> 3 line cells -> endpoint, with both
// endpoints being one of the drawn circled cells (verified against the
// underlay circle list).
const betweenLines = [
  new Between('R1C2', 'R2C2', 'R3C2', 'R3C1', 'R4C1'),
  new Between('R2C3', 'R2C4', 'R3C4', 'R3C5', 'R3C6'),
  new Between('R1C6', 'R1C7', 'R2C7', 'R2C8', 'R2C9'),
  new Between('R3C8', 'R4C8', 'R4C7', 'R5C7', 'R6C7'),
  new Between('R6C9', 'R7C9', 'R7C8', 'R8C8', 'R9C8'),
  new Between('R8C7', 'R8C6', 'R7C6', 'R7C5', 'R7C4'),
  new Between('R9C4', 'R9C3', 'R8C3', 'R8C2', 'R8C1'),
  new Between('R7C2', 'R6C2', 'R6C3', 'R5C3', 'R4C3'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...betweenLines,
];
