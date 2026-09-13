// Title: Saws
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=aNeG_x5S-ao
// Source: https://sudokupad.app/6qpgdgsw4j

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Two blue lines are drawn (Line A, Line B below). For each line, the 3x3
// box borders divide it into segments; all segments of one line sum to the
// same total (a total that may differ between the two lines) -- RegionSumLine
// per line expresses exactly this. Separately, if a digit N occurs anywhere
// among the two lines' cells combined, it occurs exactly N times across that
// combined set -- CountingCircles over the union of both lines' cells: it
// requires every circle's value to equal the number of circles sharing that
// value, which is exactly "any value present occurs (value) times", and
// "combined" is why both lines' cells are passed as one CountingCircles set
// rather than two.

const lineA = [
  'R9C3', 'R8C2', 'R8C3', 'R7C2', 'R7C3', 'R6C2', 'R5C1', 'R5C2', 'R5C3',
  'R4C2', 'R3C3', 'R3C2', 'R2C3', 'R2C2', 'R1C3', 'R1C4', 'R2C4', 'R3C4',
  'R3C5',
];

const lineB = [
  'R9C8', 'R8C9', 'R8C8', 'R7C9', 'R7C8', 'R7C7', 'R6C8', 'R5C9', 'R5C8',
  'R4C9', 'R4C8', 'R3C9', 'R3C8', 'R2C9', 'R2C8', 'R3C7', 'R4C6', 'R5C6',
  'R5C5', 'R5C4', 'R6C4', 'R7C4', 'R7C5', 'R8C4', 'R8C5', 'R8C6',
];

return [
  new Shape('9x9'),
  new RegionSumLine(...lineA),
  new RegionSumLine(...lineB),
  new CountingCircles(...lineA, ...lineB),
];
