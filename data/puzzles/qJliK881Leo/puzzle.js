// Title: Kill  Them With Uniqueness
// Author: AFrayedKnot
// Video: https://www.youtube.com/watch?v=qJliK881Leo
// Source: https://app.crackingthecryptic.com/sudoku/Gf8B9FRD3h

// Standard 9x9 sudoku (rows, columns, boxes) plus:
// - Killer cages: digits in a cage sum to the printed total (when a total is
//   printed) and cannot repeat within the cage. Two cages print no total and
//   enforce only the no-repeat rule.
// - White dots: the two cells joined by a dot hold consecutive digits. Not
//   all possible dots are drawn, so an unmarked adjacent pair carries no
//   constraint (no exhaustive/negative dot rule applies).
// - The rules' "computer-verified unique solution" remark is a solving aid
//   for a human solver, not an additional grid constraint; it is not encoded.

return [
  new Shape('9x9'),

  // Cages: [sum, ...cells], transcribed from the puzzle's drawn cage
  // outlines. Cages with no printed total use AllDifferent instead of Cage.
  new Cage(7, 'R2C1', 'R3C1'),
  new Cage(13, 'R3C2', 'R4C2', 'R4C3'),
  new Cage(14, 'R5C2', 'R6C2'),
  new Cage(10, 'R7C1', 'R8C1'),
  new Cage(13, 'R7C3', 'R8C3'),
  new AllDifferent('R8C5', 'R9C5', 'R9C4', 'R9C3'), // no-total cage
  new Cage(17, 'R8C4', 'R7C4'),
  new Cage(13, 'R6C4', 'R5C4'),
  new Cage(14, 'R4C4', 'R4C5'),
  new Cage(23, 'R2C5', 'R3C5', 'R3C6', 'R2C6'),
  new Cage(8, 'R1C8', 'R2C8'),
  new AllDifferent('R4C6', 'R5C6', 'R4C7'), // no-total cage
  new Cage(15, 'R5C7', 'R6C7'),
  new Cage(7, 'R5C9', 'R6C9'),
  new Cage(8, 'R7C9', 'R8C9'),
  new Cage(14, 'R7C7', 'R8C7'),
  new Cage(7, 'R7C6', 'R8C6'),

  // White dots (consecutive digits), transcribed from the drawn rounded
  // white-fill/black-border marks on a shared cell edge.
  new WhiteDot('R1C2', 'R1C3'),
  new WhiteDot('R1C7', 'R1C8'),
  new WhiteDot('R2C3', 'R3C3'),
  new WhiteDot('R2C9', 'R3C9'),
];
