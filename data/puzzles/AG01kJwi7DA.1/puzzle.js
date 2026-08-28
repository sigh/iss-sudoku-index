// Title: April 3, 2022:Region Sum Lines
// Author: clover!
// Video: https://www.youtube.com/watch?v=AG01kJwi7DA
// Source: https://tinyurl.com/35e4j9n6

// Normal sudoku rules (standard 3x3 boxes, no jigsaw regions). Seven region
// sum lines: along each line, every 3x3-box segment it passes through sums
// to the same total (that total may differ between the seven lines).
// RegionSumLine walks its cell list in the given order and splits it into
// per-box segments itself, so each line below is just its drawn waypoint
// list.

return [
  new Shape('9x9'),

  new Given('R1C5', 6),
  new Given('R2C7', 3),
  new Given('R3C2', 1),
  new Given('R3C4', 8),
  new Given('R4C5', 8),
  new Given('R4C7', 9),
  new Given('R5C1', 4),
  new Given('R5C4', 7),
  new Given('R5C6', 6),
  new Given('R5C9', 3),
  new Given('R6C3', 8),
  new Given('R6C5', 9),
  new Given('R7C6', 9),
  new Given('R7C8', 2),
  new Given('R8C3', 4),
  new Given('R9C5', 3),

  new RegionSumLine(
    'R5C6', 'R4C6', 'R3C5', 'R3C4', 'R3C3', 'R3C2', 'R4C1', 'R5C1', 'R6C2'),
  new RegionSumLine(
    'R2C4', 'R1C5', 'R1C6', 'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C6', 'R6C5'),
  new RegionSumLine(
    'R4C8', 'R5C9', 'R6C9', 'R7C8', 'R7C7', 'R7C6', 'R7C5', 'R6C4', 'R5C4'),
  new RegionSumLine(
    'R4C5', 'R4C4', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C4', 'R9C5', 'R8C6'),
  new RegionSumLine('R1C2', 'R2C3', 'R1C4'),
  new RegionSumLine('R3C8', 'R4C9'),
  new RegionSumLine('R8C8', 'R8C7', 'R9C6'),
];
