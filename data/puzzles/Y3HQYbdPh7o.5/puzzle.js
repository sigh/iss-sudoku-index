// Title: Dec 18, 2021: Average Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=Y3HQYbdPh7o
// Source: https://tinyurl.com/5mr95yvc

// Normal sudoku rules apply (standard boxes). Twelve straight 3-cell lines
// each state that the centre cell's digit is the average of the two end
// cells' digits, with no rounding required. Each line's centre cell is a
// given digit; its two ends are both empty.
//
// The average relation is encoded as an exact linear equation via Sum's
// coefficient form: end1 + end2 - 2*center = 0. This is equivalent to
// center = (end1 + end2) / 2 and, since center must be an integer in 1-9,
// automatically forces the "no rounding required" condition (end1 + end2
// even) -- no separate parity constraint is needed.

const givens = [
  ['R1C3', 2], ['R1C7', 5],
  ['R3C1', 3], ['R3C3', 9], ['R3C5', 2], ['R3C7', 1], ['R3C9', 4],
  ['R5C3', 3], ['R5C5', 8], ['R5C7', 4],
  ['R7C1', 5], ['R7C3', 8], ['R7C5', 6], ['R7C7', 7], ['R7C9', 3],
  ['R9C3', 7], ['R9C7', 2],
];

// Each line as [end1, center, end2], transcribed from the drawn line
// waypoints; center is the middle waypoint of each 3-cell line.
const averageLines = [
  ['R1C2', 'R1C3', 'R1C4'],
  ['R1C8', 'R1C7', 'R1C6'],
  ['R2C1', 'R3C1', 'R4C1'],
  ['R2C9', 'R3C9', 'R4C9'],
  ['R6C9', 'R7C9', 'R8C9'],
  ['R9C8', 'R9C7', 'R9C6'],
  ['R6C1', 'R7C1', 'R8C1'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R5C2', 'R5C3', 'R5C4'],
  ['R5C8', 'R5C7', 'R5C6'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R6C5', 'R7C5', 'R8C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...averageLines.map(
    ([end1, center, end2]) => new Sum(0, end1, end2, [center, -2])),
];
