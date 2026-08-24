// Title: Arrow Australis
// Author: Jackson Griggs
// Video: https://www.youtube.com/watch?v=DSSollS1xXo
// Source: https://app.crackingthecryptic.com/sudoku/DtjRtL6Rrr

// Normal sudoku rules apply (default Shape('9x9') rows/cols/boxes).
// Outside diagonal clues: each shows the sum of the whole diagonal running
// from that edge cell to the opposite corner; digits on it may repeat, since
// LittleKiller's diagonal is not itself a row/column/box.
// Arrows: digits along the arrow sum to the value in the circle/pill; a
// pill's own cells hold that value's digits, read left-to-right (rules
// text), and are excluded from the arm.

const geometry = cellGeometry('9x9');

// Diagonal, sum, cell chain from the drawn off-grid arrowhead direction
// (down-right / down-left / up-left), each list read edge-cell outward.
const littleKillers = [
  [56, ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9']],
  [44, ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8']],
  [30, ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5']],
  [28, ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3']],
  [9, ['R3C9', 'R2C8', 'R1C7']],
  [17, ['R4C9', 'R3C8', 'R2C7', 'R1C6']],
].map(([total, cells]) => LittleKiller.fromCells(total, cells, geometry));

return [
  new Shape('9x9'),

  ...littleKillers,

  // Pill arrow: the pill is the 3-cell rounded overlay at R9C1-R9C3 (empty
  // printed text -- the digits placed in those cells, left-to-right, are the
  // sum itself). Arm cells recovered from the drawn waypoints; the tail
  // waypoint lands inside the pill span, so the pill cells are excluded from
  // the arm.
  new PillArrow(3, 'R9C1', 'R9C2', 'R9C3',
    'R8C4', 'R7C5', 'R6C6', 'R7C7', 'R6C8', 'R5C9', 'R4C8', 'R3C7',
    'R2C6', 'R3C5', 'R4C4', 'R3C3', 'R4C2', 'R5C1', 'R6C2', 'R7C3'),

  // Circle arrow: bulb R8C7 (empty-text circle, so its own placed digit is
  // the sum), single-cell arm R7C6.
  new Arrow('R8C7', 'R7C6'),
];
