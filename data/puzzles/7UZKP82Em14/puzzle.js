// Title: Raw Spaghetti
// Author: Aron Lide (Aspartagcus)
// Video: https://www.youtube.com/watch?v=7UZKP82Em14
// Source: https://tinyurl.com/bdevbbjd

// Normal sudoku rules apply (default row/column/box all-different).

// Eight lines. Box borders divide each line into segments with the same sum
// within that line; different lines may have different sums. This is
// RegionSumLine's exact semantics (equal sum per box-crossing segment)
// against the default box regions, confirmed by the rules' own worked
// example: r9c5+r8c6 = r7c7 = r6c8+r5c9, which is line 4 below.
// Each line is drawn twice in the source (a wider stroke plus a narrower,
// lighter stroke over the same cells) as a decorative double-outline; that
// duplicate layer is not encoded as a second clue.
const lines = [
  ['R1C3', 'R2C4', 'R3C5'],
  ['R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2'],
  ['R6C1', 'R7C1', 'R8C1'],
  ['R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'],
  ['R3C9', 'R4C8', 'R5C7', 'R6C6', 'R7C5', 'R8C4', 'R9C3'],
  ['R3C8', 'R4C7', 'R5C6', 'R6C5', 'R7C4', 'R8C3', 'R9C2'],
  ['R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8'],
  ['R1C8', 'R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3', 'R7C2'],
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new RegionSumLine(...cells)),
];
