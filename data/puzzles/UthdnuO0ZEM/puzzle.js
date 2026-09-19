// Title: Border Arrows
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=UthdnuO0ZEM
// Source: https://sudokupad.app/nz9u2li1vk

// Normal sudoku rules apply. Cells separated by a single king's move (in
// chess) cannot contain the same digit (AntiKing). Digits along an arrow
// must sum to the digit in the attached circle (Arrow, bulb cell first).
// Every arrow here is two cells long, with the bulb on the grid's own
// border -- the puzzle's namesake construction.

return [
  new Shape('9x9'),

  new Given('R2C5', 1),
  new Given('R3C2', 5),
  new Given('R3C8', 2),
  new Given('R4C5', 9),
  new Given('R8C4', 7),
  new Given('R8C6', 8),

  new AntiKing(),

  new Arrow('R1C9', 'R1C8', 'R1C7'),
  new Arrow('R3C9', 'R3C8', 'R3C7'),
  new Arrow('R1C5', 'R2C5', 'R3C5'),
  new Arrow('R1C1', 'R2C1', 'R3C1'),
  new Arrow('R1C3', 'R2C3', 'R3C3'),
  new Arrow('R5C1', 'R5C2', 'R5C3'),
  new Arrow('R7C1', 'R7C2', 'R7C3'),
  new Arrow('R9C1', 'R9C2', 'R9C3'),
  new Arrow('R9C5', 'R8C5', 'R7C5'),
  new Arrow('R9C7', 'R8C7', 'R7C7'),
  new Arrow('R9C9', 'R8C9', 'R7C9'),
  new Arrow('R5C9', 'R5C8', 'R5C7'),
];
