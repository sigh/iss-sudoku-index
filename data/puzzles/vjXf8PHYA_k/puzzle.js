// Title: Unvexed
// Author: James Murdoch
// Video: https://www.youtube.com/watch?v=vjXf8PHYA_k
// Source: https://sudokupad.app/x07nh4kkwg

// Normal sudoku rules (default row/column/box). No given digits.
//
// Two cages carry a printed total; the other eighteen cages have no printed
// total, but the rules state they all share one common total, determined by
// the solver. Every cage forbids repeats. Model the no-total cages as
// AllDifferent (no local sum) plus one EqualSum tying all eighteen totals
// together, rather than hard-coding the (derivable) shared total of 18 -
// hard-coding it would give the solver information the puzzle does not.
//
// One white dot (consecutive digits) sits between R8C8 and R8C9. The rules
// text also describes X (sum 10) and V (sum 5) dots, but the decoded source
// contains none: the title "Unvexed" is a pun confirming no X's or V's are
// actually used in this puzzle.

const noTotalCages = [
  ['R2C8', 'R3C8', 'R3C9'],
  ['R8C4', 'R9C3', 'R9C4', 'R9C5'],
  ['R4C4', 'R5C4', 'R5C5'],
  ['R4C5', 'R4C6', 'R4C7', 'R4C8'],
  ['R5C6', 'R6C4', 'R6C5', 'R6C6'],
  ['R7C3', 'R7C4', 'R7C5', 'R8C3'],
  ['R7C2', 'R8C1', 'R8C2'],
  ['R1C5', 'R2C5', 'R3C4', 'R3C5'],
  ['R1C7', 'R2C6', 'R2C7', 'R3C7'],
  ['R1C4', 'R2C3', 'R2C4', 'R3C3'],
  ['R1C2', 'R2C1', 'R2C2', 'R3C2'],
  ['R4C1', 'R5C1', 'R5C2'],
  ['R4C3', 'R5C3', 'R6C2', 'R6C3'],
  ['R7C6', 'R8C5', 'R8C6', 'R9C6'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R6C7', 'R7C7', 'R8C7'],
  ['R8C8', 'R9C7', 'R9C8'],
  ['R7C8', 'R7C9', 'R8C9', 'R9C9'],
];

return [
  new Shape('9x9'),

  new Cage(11, 'R6C1', 'R7C1'),
  new Cage(14, 'R9C1', 'R9C2'),

  ...noTotalCages.map(cells => new AllDifferent(...cells)),
  new EqualSum(...noTotalCages),

  new WhiteDot('R8C8', 'R8C9'),
];
