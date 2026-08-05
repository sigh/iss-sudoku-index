// Title: X-Sums Killer Sudoku
// Author: udukos
// Video: https://www.youtube.com/watch?v=P2_lU15Qsw8
// Source: https://app.crackingthecryptic.com/sudoku/QMb6m2pdMR

// Normal Sudoku rules apply to the inner 9x9 board. The source's no-total cages
// also include outside X-Sums digits; only their inner-board members can be
// represented here because the source does not recover the clue digit boundaries.
// Each listed group is transcribed from a drawn no-total cage after removing
// its outside-canvas cells. Cages with only one inner cell add no constraint.
return [
  new Shape('9x9'),
  new AllDifferent('R1C2', 'R1C3', 'R1C4', 'R1C5'),
  new AllDifferent('R1C7', 'R1C8', 'R1C9'),
  new AllDifferent('R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9'),
  new AllDifferent('R5C1', 'R5C2', 'R6C1'),
  new AllDifferent('R4C4', 'R5C3', 'R5C4', 'R6C3'),
];
