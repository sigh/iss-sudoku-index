// Title: Puffer Fish
// Author: Henk Nicolai
// Video: https://www.youtube.com/watch?v=xGu2VYK-AMg
// Source: https://app.crackingthecryptic.com/sudoku/Qh7QjthLmb

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes -- the payload's regions array matches the default boxes exactly,
// so no NoBoxes/Regions override is needed). Digits in a cage sum to the
// cage's small clue and cannot repeat within the cage: each cage below is a
// Cage(sum, ...cells). Cage cell lists are transcribed from the puzzle's
// drawn cage geometry.

return [
  new Shape('9x9'),

  new Cage(18, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(19, 'R2C3', 'R3C2', 'R3C3'),
  new Cage(14, 'R1C4', 'R1C5', 'R2C4', 'R2C5'),
  new Cage(15, 'R4C1', 'R4C2', 'R5C1', 'R5C2'),
  new Cage(13, 'R4C4', 'R4C5', 'R5C4', 'R5C5'),
  new Cage(12, 'R2C7', 'R3C7'),
  new Cage(10, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(20, 'R3C8', 'R4C8', 'R4C9'),
  new Cage(45, 'R6C6', 'R6C7', 'R6C8', 'R6C9', 'R7C6', 'R7C9', 'R8C6', 'R9C6', 'R9C7'),
  new Cage(20, 'R8C9', 'R9C8', 'R9C9'),
  new Cage(10, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(19, 'R7C2', 'R7C3', 'R8C3'),
  new Cage(6, 'R8C4', 'R9C4'),
];
