// Title: Wildberry Poptart
// Author: Tyrgannus
// Video: https://www.youtube.com/watch?v=8OisfvDJoQY
// Source: https://app.crackingthecryptic.com/sudoku/FgDb8nbdnP

// Normal sudoku rules apply (standard 3x3 boxes, from the payload's own
// region list, which matches the default boxes). Blue lines are Region Sum
// Lines: equal sum within each 3x3-box segment, splitting at each box
// re-entry (RegionSumLine's own semantics, matching the rules' worked
// example r5c7+r6c7 = r7c8+r8c7 = r7c5+r7c6). Purple lines are Renban
// lines: non-repeating consecutive digits in any order.

// Blue lines -- cell paths transcribed from the drawn line geometry (color #34BBE6).
const regionSumLines = [
  new RegionSumLine('R1C3', 'R1C2', 'R2C2', 'R2C1', 'R3C1', 'R4C1', 'R5C1'),
  new RegionSumLine('R2C4', 'R2C5', 'R2C6', 'R3C7', 'R3C8', 'R3C9'),
  new RegionSumLine('R4C5', 'R4C4', 'R5C4', 'R6C4', 'R6C3', 'R6C2'),
  new RegionSumLine('R5C7', 'R6C7', 'R7C8', 'R8C7', 'R7C6', 'R7C5'),
  new RegionSumLine('R8C2', 'R8C3', 'R9C4', 'R9C5'),
];

// Purple lines -- cell paths transcribed from the drawn line geometry (color #D23BE7).
// One entry (styling-only, no wayPoints) renders nothing and is omitted.
const renbanLines = [
  new Renban('R7C1', 'R7C2', 'R7C3', 'R8C4', 'R8C5', 'R8C6'),
  new Renban('R5C3', 'R4C3', 'R3C2', 'R2C3', 'R3C4', 'R3C5'),
  new Renban('R4C8', 'R4C7', 'R4C6', 'R5C6', 'R6C6', 'R6C5'),
  new Renban('R5C9', 'R6C9', 'R7C9', 'R8C9', 'R8C8', 'R9C8', 'R9C7'),
  new Renban('R1C5', 'R1C6', 'R2C7', 'R2C8'),
];

return [
  new Shape('9x9'),

  new Given('R1C9', 2),
  new Given('R5C5', 1),
  new Given('R9C1', 8),

  ...regionSumLines,
  ...renbanLines,
];
