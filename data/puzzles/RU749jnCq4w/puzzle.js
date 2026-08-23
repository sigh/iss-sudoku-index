// Title: Arrow Squaring
// Author: Miky
// Video: https://www.youtube.com/watch?v=RU749jnCq4w
// Source: https://app.crackingthecryptic.com/sudoku/btFfPHhgPq

// Normal sudoku rules apply. In cages, digits must sum to the small clue in
// the top left corner of the cage (killer-cage convention: no repeats within
// a cage). Digits along an arrow must sum to the digit in that arrow's
// circle; the circled cell is not part of the summed cells.

return [
  new Shape('9x9'),

  new Given('R3C1', 1),

  new Cage(17, 'R1C2', 'R2C2', 'R3C2'),
  new Cage(19, 'R1C5', 'R2C5', 'R3C5'),
  new Cage(18, 'R1C9', 'R2C9', 'R3C9'),
  new Cage(13, 'R7C3', 'R7C4'),

  new Arrow('R1C3', 'R2C3', 'R3C4'),
  new Arrow('R2C6', 'R1C7', 'R2C8'),
  new Arrow('R6C9', 'R5C9', 'R5C8', 'R6C8'),
  new Arrow('R5C3', 'R5C2', 'R6C2', 'R6C3'),
  new Arrow('R6C5', 'R6C6', 'R5C6', 'R5C5'),
  new Arrow('R8C1', 'R9C1', 'R9C2', 'R8C2'),
  new Arrow('R9C5', 'R9C6', 'R8C6', 'R8C5'),
  new Arrow('R9C9', 'R8C9', 'R8C8', 'R9C8'),
];
