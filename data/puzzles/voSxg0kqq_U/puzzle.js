// Title: Factor Map
// Author: Ul-Rhymm
// Video: https://www.youtube.com/watch?v=voSxg0kqq_U
// Source: https://sudokupad.app/c325ibxs31

// Normal Sudoku rules apply. Each outlined cage has no repeated digit.
// The colour assignment, the cage-sum prime-factor sets, and the rule that
// equal colours cannot share a side are omitted: the colours and totals are
// solver-discovered global state, with no fixed clue values to bind them.
// Cage cell lists transcribed from the outlined cages.
return [
  new Shape('9x9'),
  new AllDifferent('R4C5', 'R5C4', 'R5C5'),
  new AllDifferent('R6C4', 'R6C5', 'R6C6'),
  new AllDifferent('R4C6', 'R5C6'),
  new AllDifferent('R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C3', 'R4C4', 'R5C3', 'R6C3'),
  new AllDifferent('R4C7', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8'),
  new AllDifferent('R7C2', 'R8C2'),
  new AllDifferent('R7C3', 'R8C3'),
  new AllDifferent('R9C2', 'R9C3'),
  new AllDifferent('R7C1', 'R8C1'),
  new AllDifferent('R6C1', 'R6C2'),
  new AllDifferent('R1C7', 'R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new AllDifferent('R3C8', 'R3C9'),
  new AllDifferent('R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new AllDifferent('R2C1', 'R2C2', 'R3C1', 'R4C1'),
  new AllDifferent('R1C1', 'R1C2'),
  new AllDifferent('R7C7', 'R8C7'),
  new AllDifferent('R9C7', 'R9C8'),
  new AllDifferent('R7C4', 'R7C5'),
  new AllDifferent('R7C6', 'R8C6'),
  new AllDifferent('R1C4', 'R2C4', 'R2C5'),
  new AllDifferent('R8C5', 'R9C5', 'R9C6'),
];
