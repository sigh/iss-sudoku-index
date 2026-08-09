// Title: 9/5/22: Count Different
// Author: clover!
// Video: https://www.youtube.com/watch?v=szxjqhP6_uc
// Source: https://tinyurl.com/4evm67rh

// Normal sudoku rules. Each of the six white circles sits on the border
// between a horizontally-adjacent pair of cells; its value counts the
// distinct digits among the 10 cells forming the ring around that pair (the
// 3x4 bounding box of the pair, minus the pair's own two cells). Encoded via
// CountDistinct, whose control cell is pinned to the printed circle value by
// a Given.

const CIRCLES = [
  // [value, ring cells...] -- ring cells transcribed from the drawn 3x4
  // bounding box around each circled pair.
  [4, ['R2C2', 'R2C3', 'R2C4', 'R2C5', 'R3C2', 'R3C5', 'R4C2', 'R4C3', 'R4C4', 'R4C5']],
  [5, ['R4C2', 'R4C3', 'R4C4', 'R4C5', 'R5C2', 'R5C5', 'R6C2', 'R6C3', 'R6C4', 'R6C5']],
  [6, ['R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C5', 'R3C8', 'R4C5', 'R4C6', 'R4C7', 'R4C8']],
  [9, ['R6C5', 'R6C6', 'R6C7', 'R6C8', 'R7C5', 'R7C8', 'R8C5', 'R8C6', 'R8C7', 'R8C8']],
  [9, ['R6C2', 'R6C3', 'R6C4', 'R6C5', 'R7C2', 'R7C5', 'R8C2', 'R8C3', 'R8C4', 'R8C5']],
  [8, ['R4C5', 'R4C6', 'R4C7', 'R4C8', 'R5C5', 'R5C8', 'R6C5', 'R6C6', 'R6C7', 'R6C8']],
];

const counters = new Var('D', 'circle distinct-count', CIRCLES.length);
const circleConstraints = CIRCLES.flatMap(([value, ring], i) => {
  const counter = counters.cell(i + 1);
  return [
    new Given(counter, value),
    new CountDistinct(counter, ...ring),
  ];
});

return [
  new Given('R1C4', 7),
  new Given('R2C3', 1),
  new Given('R2C6', 6),
  new Given('R2C8', 7),
  new Given('R3C2', 4),
  new Given('R3C5', 2),
  new Given('R4C4', 3),
  new Given('R4C8', 8),
  new Given('R6C2', 5),
  new Given('R6C6', 8),
  new Given('R7C5', 8),
  new Given('R7C8', 3),
  new Given('R8C2', 8),
  new Given('R8C4', 9),
  new Given('R8C7', 4),
  new Given('R9C6', 3),
  counters,
  ...circleConstraints,
];
