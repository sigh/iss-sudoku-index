// Title: Unique
// Author: TotallyNormalCat
// Video: https://www.youtube.com/watch?v=LS5gmEQLaCw
// Source: https://app.crackingthecryptic.com/sudoku/jBDjqmRdpg
//
// Rules: normal sudoku rules apply. In cages, digits must sum to the small
// clue in the top left corner of the cage; digits cannot repeat within a
// cage. 35 of the 81 cells belong to no cage, which is the puzzle as
// drawn -- normal sudoku rules alone apply to them.

return [
  new Shape('9x9'),

  new Cage(19, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(22, 'R1C6', 'R1C7', 'R2C6', 'R3C6'),
  new Cage(17, 'R2C7', 'R3C7', 'R3C8'),
  new Cage(17, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(27, 'R3C9', 'R4C7', 'R4C8', 'R4C9'),
  new Cage(8, 'R5C8', 'R5C9'),
  new Cage(6, 'R6C8', 'R6C9'),
  new Cage(6, 'R6C5', 'R7C5'),
  new Cage(15, 'R8C5', 'R9C5'),
  new Cage(13, 'R8C7', 'R9C7', 'R9C8'),
  new Cage(20, 'R8C3', 'R9C3', 'R9C4'),
  new Cage(19, 'R8C1', 'R8C2', 'R9C2'),
  new Cage(20, 'R6C1', 'R7C1', 'R7C2'),
  new Cage(15, 'R5C1', 'R5C2'),
  new Cage(6, 'R5C3', 'R5C4'),
  new Cage(13, 'R3C2', 'R3C3', 'R4C2'),
  new Cage(19, 'R3C4', 'R4C3', 'R4C4'),
];
