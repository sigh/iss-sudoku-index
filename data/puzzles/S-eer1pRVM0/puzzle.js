// Title: Escalation.
// Author: Celery
// Video: https://www.youtube.com/watch?v=S-eer1pRVM0
// Source: https://app.crackingthecryptic.com/sudoku/2Q9hBtb8Dg

// Normal Sudoku; disjoint sets; main-diagonal uniqueness; and equal sums of
// each blue line's contiguous 3x3-box segments. The duplicate one-box blue
// stroke has no pair of segments to compare and therefore adds no constraint.
return [
  new Shape('9x9'),
  new Given('R7C9', 6),
  new DisjointSets(),
  new Diagonal(-1),

  // Blue paths transcribed from their separate drawn strokes.
  new RegionSumLine('R1C7', 'R1C6', 'R1C5', 'R2C6'),
  new RegionSumLine('R3C9', 'R4C9', 'R5C9', 'R4C8'),
  new RegionSumLine(
    'R2C1', 'R3C1', 'R3C2', 'R4C2', 'R4C3', 'R5C3',
    'R5C4', 'R6C4', 'R6C5', 'R7C5', 'R7C6', 'R8C6',
  ),
  new RegionSumLine('R7C4', 'R8C3', 'R7C2', 'R8C1'),
  new RegionSumLine('R5C6', 'R5C7', 'R6C8'),
];
