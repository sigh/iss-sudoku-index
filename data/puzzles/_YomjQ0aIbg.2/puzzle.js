// Title: CL Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=_YomjQ0aIbg
// Source: https://app.crackingthecryptic.com/sudoku/Q43b3PtDDR

// Normal sudoku rules (default row/col/box AllDifferent). Pale rounded-rect
// brackets mark adjacent cell pairs read as a two-digit number (first cell =
// tens, second = units, in reading order). A circled "C"/"L" badge sits on
// the boundary between two such brackets and ties the number ending just
// before it to the number starting just after it: C-badges require the two
// numbers to sum to 100, L-badges to 50. "No negative constraint" in the
// rules text is a UI note (no anti-something rule) and needs no constraint.
//
// Bracket coordinates below are transcribed from the drawn rounded-rect
// bracket marks; badge pairings are transcribed from the drawn "C"/"L"
// marks sitting on the boundary between two brackets.

// twoDigit(tensCell, onesCell) -> [ [tensCell, 10], [onesCell, 1] ], the Sum
// summand pair for the two-digit number tensCell*10 + onesCell.
const twoDigit = (tens, ones) => [[tens, 10], [ones, 1]];

// Each entry: [target sum, [tensA, onesA], [tensB, onesB]] for one C/L badge.
const badges = [
  // C badges (sum 100)
  [100, ['R1C2', 'R1C3'], ['R1C4', 'R1C5']],
  [100, ['R1C5', 'R1C6'], ['R1C7', 'R1C8']],
  [100, ['R9C2', 'R9C3'], ['R9C4', 'R9C5']],
  [100, ['R9C5', 'R9C6'], ['R9C7', 'R9C8']],
  [100, ['R5C1', 'R6C1'], ['R7C1', 'R8C1']],
  [100, ['R2C9', 'R3C9'], ['R4C9', 'R5C9']],
  [100, ['R3C4', 'R4C4'], ['R5C4', 'R6C4']],
  // L badges (sum 50)
  [50, ['R2C1', 'R3C1'], ['R4C1', 'R5C1']],
  [50, ['R5C9', 'R6C9'], ['R7C9', 'R8C9']],
  [50, ['R4C6', 'R5C6'], ['R6C6', 'R7C6']],
];

const badgeSums = badges.map(([target, a, b]) =>
  new Sum(target, ...twoDigit(...a), ...twoDigit(...b)));

return [
  new Shape('9x9'),

  new Given('R1C1', 9),
  new Given('R1C5', 8),
  new Given('R2C2', 6),
  new Given('R4C7', 7),
  new Given('R5C2', 1),
  new Given('R5C5', 9),
  new Given('R5C8', 5),
  new Given('R6C3', 8),
  new Given('R8C8', 7),
  new Given('R9C5', 7),
  new Given('R9C9', 9),

  ...badgeSums,
];
