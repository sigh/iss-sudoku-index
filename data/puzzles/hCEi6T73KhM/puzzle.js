// Title: Foggy Banana Split
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=hCEi6T73KhM
// Source: https://sudokupad.app/23phi9d5m7

// Partial encoding.
//
// Encoded: standard sudoku, visible XV marks, and split-peas sums for the
// fixed line segments. Omitted: chocolate/banana area rectangularity, circle
// area sizes, and line shading counts. Fog is UI, not a final-grid constraint.

const splitPeas = (a, b, interior) => {
  const sumAB = new Sum(0, ...interior, [a, -10], [b, -1]);
  const sumBA = new Sum(0, ...interior, [a, -1], [b, -10]);
  return new Or([sumAB, sumBA]);
};

const splitPeaSegments = [
  ['R3C1', 'R1C2', ['R2C1', 'R1C1']],
  ['R4C2', 'R1C3', ['R3C2', 'R3C3', 'R2C3']],
  ['R1C3', 'R1C8', ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C7', 'R2C8']],
  ['R3C4', 'R5C5', ['R3C5', 'R2C5', 'R2C6', 'R3C6', 'R4C6', 'R4C5']],
  ['R6C4', 'R7C3', ['R7C4', 'R8C4', 'R8C5', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R8C2', 'R8C3']],
  ['R6C7', 'R8C7', ['R5C7', 'R4C7', 'R3C7', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R7C9', 'R8C9', 'R8C8']],
];

const xMarks = [
  ['R2C5', 'R2C6'],
  ['R3C3', 'R3C4'],
  ['R5C1', 'R6C1'],
  ['R5C2', 'R6C2'],
  ['R8C8', 'R8C9'],
];

return [
  new Shape('9x9'),
  ...splitPeaSegments.map(([a, b, interior]) => splitPeas(a, b, interior)),
  ...xMarks.map(cells => new X(...cells)),
  new V('R4C3', 'R4C4'),
];
