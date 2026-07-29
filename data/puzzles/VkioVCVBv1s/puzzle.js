// Title: Traces
// Author: Arbitrary
// Video: https://www.youtube.com/watch?v=VkioVCVBv1s
// Source: https://sudokupad.app/qh4zzpbcow

// Normal Sudoku rules apply. Box borders split each blue trace into sections
// whose digit sums are equal; different traces may have different sums.
// The first and second constraints below model the two drawn branching traces.
// Each literal segment is one connected within-box section of its blue trace.
const branchingTraces = [
  new EqualSum(
    ['R8C5', 'R8C4'], ['R8C3', 'R7C3'], ['R7C4', 'R7C5'],
    ['R6C3', 'R6C2'], ['R7C2', 'R8C2'], ['R6C4', 'R5C4'],
  ),
  new EqualSum(
    ['R2C8', 'R3C8'], ['R4C8', 'R4C7'], ['R3C7', 'R2C7'],
    ['R2C6', 'R2C5'], ['R3C6', 'R3C5'],
  ),
];

// The remaining drawn blue traces are unbranched region-sum lines.
const regionSumLines = [
  new RegionSumLine('R4C1', 'R3C1', 'R2C1', 'R1C1'),
  new RegionSumLine('R9C9', 'R9C8', 'R9C7', 'R9C6'),
  new RegionSumLine('R1C5', 'R1C4', 'R1C3', 'R2C3', 'R2C4', 'R3C4'),
  new RegionSumLine('R1C6', 'R1C7', 'R1C8'),
  new RegionSumLine('R8C1', 'R7C1', 'R6C1', 'R5C2'),
  new RegionSumLine('R6C9', 'R6C8', 'R6C7', 'R7C7', 'R7C8'),
];

// The four drawn corner circles are single-digit quads, anchored at each 2x2's top left.
const quads = [
  new Quad('R7C4', 1),
  new Quad('R3C6', 9),
  new Quad('R2C7', 1),
  new Quad('R3C5', 3),
];

return [
  new Shape('9x9'),
  ...branchingTraces,
  ...regionSumLines,
  ...quads,
];
