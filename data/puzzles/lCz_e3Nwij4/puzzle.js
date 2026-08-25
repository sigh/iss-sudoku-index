// Title: Advent of Sudoku
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=lCz_e3Nwij4
// Source: https://app.crackingthecryptic.com/sudoku/8M7Hdm6pNG

// Normal sudoku rules apply. Digits cannot appear in the same position in
// different 3x3 boxes: for each of the 9 in-box positions, the 9 cells
// holding that position (one per box) must all differ. Box-by-box variant
// rules: box1 white dots (consecutive), box2 thermometer, box3 diagonal sum,
// box4 quad circle, box5 X/V pairs, box6 arrow, box7 killer cage, box8 odd
// circles, box9 black dots (2:1 ratio). None of the dot/XV families carry a
// negative constraint (marks elsewhere are not implied absent).

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// One AllDifferent per in-box position (0..8, row-major within a box), over
// the cell at that position across all 9 boxes -- the transpose of
// graph.boxes()'s row-major box cell lists.
const boxes = graph.boxes();
const positionGroups = boxes[0].map((_, pos) => boxes.map(box => box[pos]));

return [
  new Shape('9x9'),

  // One given per box, at the box's own top-left cell.
  new Given('R1C1', 1), new Given('R1C4', 2), new Given('R1C7', 3),
  new Given('R4C1', 4), new Given('R4C4', 5), new Given('R4C7', 6),
  new Given('R7C1', 7), new Given('R7C4', 8), new Given('R7C7', 9),

  ...positionGroups.map(cells => new AllDifferent(...cells)),

  // Box 1: white dots.
  new WhiteDot('R1C2', 'R1C3'),
  new WhiteDot('R2C2', 'R3C2'),
  new WhiteDot('R2C3', 'R3C3'),

  // Box 2: thermometer, bulb at R2C6.
  new Thermo('R2C6', 'R2C5', 'R3C5', 'R3C6'),

  // Box 3: diagonal sum, drawn as an outside little-killer-style arrow into
  // R1C7 running down-right; the diagonal ends at the grid's own corner
  // (R3C9), so it is a genuine little-killer ray, not a box-scoped subset of
  // a longer one.
  LittleKiller.fromCells(12, graph.ray('R1C7', 1, 1), geometry),

  // Box 4: quad circle -- each listed digit must appear in one of the 4
  // surrounding cells.
  new Quad('R5C1', 1, 2),

  // Box 5: X/V pairs.
  new X('R4C5', 'R4C6'),
  new X('R5C5', 'R6C5'),
  new V('R5C6', 'R6C6'),

  // Box 6: arrow sums to the circled (bulb) digit.
  new Arrow('R6C8', 'R5C9', 'R4C8'),

  // Box 7: killer cage.
  new Cage(25, 'R8C2', 'R9C2', 'R9C3', 'R8C3'),

  // Box 8: circled digits must be odd.
  new Given('R9C5', 1, 3, 5, 7, 9),
  new Given('R9C6', 1, 3, 5, 7, 9),

  // Box 9: black dots.
  new BlackDot('R7C8', 'R7C9'),
  new BlackDot('R8C8', 'R9C8'),
  new BlackDot('R8C9', 'R9C9'),
];
