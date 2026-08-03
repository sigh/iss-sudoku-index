// Title: Missing Information
// Author: GemmaOane
// Video: https://www.youtube.com/watch?v=rvDqc6G3dbU
// Source: https://app.crackingthecryptic.com/sudoku/qL6N6dT2Mr

// Normal sudoku rules apply (default row/column/box all-different; regions
// drawn in the payload are the standard 3x3 boxes, so no explicit Region is
// needed). Cages show their sums (killer cages: sum + all-different, per
// `cages` in the payload). A grey square contains an even digit (drawn
// underlays, encoded as a candidate restriction). Along an arrow, digits sum
// to the number in that arrow's circle -- every circle sits on an ordinary
// grid cell with no printed number of its own, so "the number in the circle"
// is that cell's own solved digit: the standard bulb (first cell) + arm
// (remaining cells) Arrow reading.
return [
  new Shape('9x9'),

  // Killer cages (cages array, entries with real `cells`/`value`; the
  // remaining `cages` entries are metadata stubs and are not cages).
  new Cage(5, 'R6C3', 'R7C3'),
  new Cage(30, 'R7C1', 'R8C1', 'R8C2', 'R9C1'),
  new Cage(9, 'R5C6', 'R5C7'),
  new Cage(14, 'R5C8', 'R6C8'),
  new Cage(11, 'R1C7', 'R1C8'),
  new Cage(7, 'R1C9', 'R2C9'),
  new Cage(11, 'R2C4', 'R2C5', 'R3C5'),
  new Cage(16, 'R7C9', 'R8C9', 'R9C9'),

  // Grey squares: even digit only, encoded as a multi-value Given.
  new Given('R2C4', 2, 4, 6, 8),
  new Given('R3C4', 2, 4, 6, 8),
  new Given('R4C4', 2, 4, 6, 8),

  // Arrows: Arrow(bulb, ...arm). R4C4 carries two separate arrows (arm cells
  // do not overlap between them). The payload's 8th arrow entry duplicates
  // the 5th (identical waypoints: same bulb R9C7, same arm) and is a repeated
  // stroke export, not a second clue -- encoded once.
  new Arrow('R2C4', 'R3C4', 'R4C3'),
  new Arrow('R4C4', 'R4C3', 'R5C3'),
  new Arrow('R4C4', 'R5C4', 'R6C3'),
  new Arrow('R9C5', 'R9C4', 'R8C4'),
  new Arrow('R9C7', 'R9C6', 'R9C5'),
  new Arrow('R2C3', 'R2C2', 'R1C2'),
  new Arrow('R1C1', 'R2C1', 'R3C1', 'R4C1'),
];
