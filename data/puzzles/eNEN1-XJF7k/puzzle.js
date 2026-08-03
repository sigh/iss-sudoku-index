// Title: Cascade
// Author: Xendari
// Video: https://www.youtube.com/watch?v=eNEN1-XJF7k
// Source: https://app.crackingthecryptic.com/sudoku/Dr42ftb8JG

// Normal sudoku rules apply (default row/column/box all-different).

// Blue lines: box borders divide each line into segments with the same sum;
// a line re-entering a box a second time gets a separate same-sum segment
// there, and different lines may have different sums. RegionSumLine already
// implements exactly this semantics (equal sum per box-crossing segment,
// splitting again on each re-entry) against the default box regions -- the
// rules text's own worked example for blueLines[3]
// (r3c1+r3c2=r4c2=r3c3+r2c3=r2c4=r1c2+r1c3) confirms the re-entry reading.
const blueLines = [
  ['R6C4', 'R7C3', 'R8C3', 'R8C4', 'R9C4', 'R9C3'],
  ['R5C3', 'R6C3', 'R7C2', 'R8C2'],
  ['R5C2', 'R6C1', 'R7C1'],
  ['R3C1', 'R3C2', 'R4C2', 'R3C3', 'R2C3', 'R2C4', 'R1C3', 'R1C2'],
  ['R2C6', 'R3C7', 'R3C8', 'R4C9', 'R5C9'],
  ['R3C6', 'R4C5', 'R4C4'],
  ['R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C8', 'R7C7', 'R6C6'],
  ['R8C6', 'R9C7', 'R8C8'],
];

return [
  new Shape('9x9'),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
];
