// Title: Beauty And The Beast
// Author: Bastien Vial-Jaime
// Video: https://www.youtube.com/watch?v=VscCK7CddBI
// Source: https://app.crackingthecryptic.com/webapp/PMqTd3dMgG

// Normal sudoku rules apply. Cages sum to the small clue in their top-left
// corner and forbid repeats within the cage.

return [
  new Shape('9x9'),

  // Cages: cell lists and totals from the drawn `cages` array.
  new Cage(21, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(10, 'R1C3', 'R1C4'),
  new Cage(21, 'R1C5', 'R1C6', 'R1C7', 'R2C6'),
  new Cage(26, 'R2C7', 'R3C7', 'R3C8', 'R4C8', 'R4C9', 'R5C9'),
  new Cage(45, 'R3C4', 'R3C5', 'R3C6', 'R4C6', 'R4C7', 'R5C7', 'R4C4', 'R4C3', 'R5C3'),
  new Cage(15, 'R4C5', 'R5C5', 'R6C5', 'R5C4', 'R5C6'),
  new Cage(28, 'R6C3', 'R6C4', 'R7C4', 'R7C5', 'R7C6', 'R6C6', 'R6C7'),
  new Cage(37, 'R5C1', 'R6C1', 'R6C2', 'R7C2', 'R7C3', 'R8C3'),
  new Cage(29, 'R9C3', 'R9C4', 'R9C5', 'R8C4'),
  new Cage(7, 'R9C6', 'R9C7'),
  new Cage(23, 'R8C9', 'R9C9', 'R9C8'),
];
