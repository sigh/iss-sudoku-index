// Title: Sum Hope
// Author: Chilly
// Video: https://www.youtube.com/watch?v=59jt0fbbi4U
// Source: https://app.crackingthecryptic.com/sudoku/BR6bNRDR2g

// Normal sudoku rules, standard 3x3 boxes. No givens. Ten blue lines are
// equal-sum lines: each line's own sum must equal the total of its cells
// within every box it passes through, checked separately per individual
// visit when a line re-enters a box it already left (RegionSumLine's own
// semantics, matching the rules text verbatim). Different lines are
// independent -- their sums need not match each other.
// Cell lists below are transcribed from the drawn line paths, in stroke
// order.

const lines = [
  ['R1C5', 'R1C4', 'R1C3', 'R1C2'],
  ['R1C8', 'R2C9', 'R3C8', 'R4C9'],
  ['R3C7', 'R2C6', 'R2C5'],
  ['R3C2', 'R3C1', 'R4C1'],
  ['R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R9C6', 'R9C7', 'R9C8', 'R8C9'],
  ['R8C8', 'R7C8', 'R6C9', 'R5C9', 'R4C8'],
  ['R4C5', 'R4C4', 'R4C3', 'R5C3', 'R6C3', 'R7C3'],
  // Re-enters box4 and box5, each non-contiguously; walked in drawn order so
  // RegionSumLine splits it into the correct per-visit segments rather than
  // merging non-contiguous visits to the same box.
  ['R5C2', 'R4C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R4C6', 'R5C7', 'R6C6', 'R6C5', 'R7C4', 'R8C3', 'R7C2', 'R6C2'],
  ['R7C5', 'R7C6', 'R8C7'],
];

return [
  new Shape('9x9'),
  ...lines.map((cells) => new RegionSumLine(...cells)),
];
