// Title: Thermo Killer
// Author: Wesley Murphy
// Video: https://www.youtube.com/watch?v=zy1tWcI6sAI
// Source: https://app.crackingthecryptic.com/sudoku/hnHfBN97Fh

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; no jigsaw).
// In cages, digits sum to the small clue in the cage's top-left corner;
// digits cannot repeat within a cage. Along thermometers, digits increase
// from the bulb end.

// Cages, cell order taken from the drawn cage cell lists.
const cages = [
  new Cage(12, 'R1C3', 'R1C2', 'R2C2'),
  new Cage(7, 'R2C1', 'R3C1'),
  new Cage(24, 'R2C3', 'R3C3', 'R4C3'),
  new Cage(13, 'R7C1', 'R8C1'),
  new Cage(16, 'R8C2', 'R9C2', 'R9C3'),
  new Cage(36, 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R7C5', 'R6C5'),
  new Cage(8, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(21, 'R8C8', 'R9C8', 'R9C7'),
  new Cage(5, 'R7C9', 'R8C9'),
  new Cage(8, 'R5C4', 'R6C4'),
  new Cage(9, 'R5C6', 'R6C6'),
  new Cage(6, 'R2C7', 'R3C7', 'R4C7'),
  new Cage(15, 'R2C8', 'R2C9', 'R3C9'),
  new Cage(15, 'R1C8', 'R1C7'),
];

// Thermo(...cells): first cell is the bulb; values strictly increase from
// there. Paths interpolated from the drawn waypoints (grid cell centres at
// half-integers). Four of the six drawn thermometers are Y-shaped: two
// `lines[]` entries share the same first waypoint (the same drawn grey
// circle underlay), so a single bulb feeds two independently-increasing
// branches -- encoded as one Thermo per branch, each starting at the shared
// bulb cell, per the "a line drawn as several strokes (a bend, a branch...)
// is encoded per drawn segment" convention. This reading is grounded in the
// drawn art: exactly 6 grey circle underlays are drawn, one per distinct
// bulb cell, and 4 of those 6 bulb cells are each the shared start of two
// separate line entries.
const thermos = [
  new Thermo('R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5'),
  new Thermo('R6C2', 'R5C3', 'R4C4', 'R3C4', 'R2C4'),
  new Thermo('R6C2', 'R5C1', 'R4C2'),
  new Thermo('R6C8', 'R5C7', 'R4C6', 'R3C6', 'R2C6'),
  new Thermo('R6C8', 'R5C9', 'R4C8'),
  new Thermo('R7C6', 'R8C5', 'R7C4'),
  new Thermo('R7C8', 'R8C9', 'R7C9'),
  new Thermo('R7C8', 'R6C7', 'R7C7'),
  new Thermo('R7C2', 'R7C1', 'R8C1'),
  new Thermo('R7C2', 'R6C3', 'R7C3'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...thermos,
];
