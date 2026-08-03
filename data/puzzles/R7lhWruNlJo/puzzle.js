// Title: Layla
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=R7lhWruNlJo
// Source: https://app.crackingthecryptic.com/sudoku/mJqT6RDG2L

// Normal sudoku rules apply (standard 3x3 boxes, no givens). Digits in each
// cage cannot repeat and must sum to the cage's printed total; both
// constraints are exactly Cage's semantics.
// Cage cell lists are transcribed from the drawn dashed-outline geometry.
return [
  new Shape('9x9'),
  new Cage(7, 'R2C7', 'R3C7', 'R3C8'),
  new Cage(24, 'R5C9', 'R6C9', 'R7C9'),
  new Cage(13, 'R3C6', 'R4C6', 'R4C7', 'R5C7'),
  new Cage(37, 'R2C1', 'R2C2', 'R3C1', 'R3C2', 'R4C1', 'R4C2', 'R4C3', 'R5C1'),
  new Cage(16, 'R8C6', 'R8C7', 'R9C5', 'R9C6', 'R9C7'),
  new Cage(37, 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C3'),
];
