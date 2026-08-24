// Title: Killed Bulbs And Killer Cages
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=iCFQVeg9BGY
// Source: https://app.crackingthecryptic.com/sudoku/49MnD2jLrB

// Normal sudoku rules: default Shape gives row/column/box all-different.
//
// Killer cages: digits sum to the corner total and cannot repeat within the
// cage -- Cage(sum, ...cells) enforces both.
//
// Lines: "The digits on a line must increase from one end to the other."
// Each line is drawn as a plain grey stroke with no bulb or other endpoint
// marker distinguishing its two ends -- consistent with the puzzle's own
// title, "Killed Bulbs" -- so which end is the low end is not recoverable
// from the art or the rules text. Each line is encoded as
// Or(Thermo(forward), Thermo(reversed)) to admit both readings faithfully.

const cages = [
  [20, 'R3C1', 'R4C1', 'R4C2', 'R3C2'],
  [10, 'R1C9', 'R2C9'],
  [10, 'R9C6', 'R9C7'],
  [23, 'R8C6', 'R7C6', 'R6C6', 'R6C5', 'R6C4'],
];

const lines = [
  ['R1C4', 'R1C3', 'R1C2', 'R2C2'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R2C7', 'R1C7'],
  ['R4C4', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R4C7'],
  ['R9C4', 'R9C3', 'R8C3', 'R7C3', 'R7C4', 'R7C5'],
  ['R8C1', 'R9C1', 'R9C2'],
  ['R6C1', 'R7C1', 'R7C2'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...lines.map(cells => new Or([
    new Thermo(...cells),
    new Thermo(...[...cells].reverse()),
  ])),
];
