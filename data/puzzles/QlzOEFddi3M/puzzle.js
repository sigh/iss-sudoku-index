// Title: Snooker 147
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=QlzOEFddi3M
// Source: https://app.crackingthecryptic.com/sudoku/33Mj28bTQP

// Normal sudoku rules apply. Digits on arrows sum to the number in the
// circle. Grey (renban) lines feature four consecutive digits in any order.
// Two circles (R2C3, R2C7) each carry two separate arrow arms sharing that
// one bulb cell; the payload lists these as two distinct arrow entries with
// the same bulb, so each is encoded as its own Arrow constraint. The green
// shaded rectangle over R3C4:R7C6 is a decorative snooker-table backdrop
// with no rule attached and is not encoded.

return [
  new Shape('9x9'),

  // Renban lines (grey), drawn at the top-left, top-right, bottom-right,
  // and bottom-left corners respectively.
  new Renban('R3C1', 'R2C1', 'R1C2', 'R1C3'),
  new Renban('R1C7', 'R1C8', 'R2C9', 'R3C9'),
  new Renban('R7C9', 'R8C9', 'R9C8', 'R9C7'),
  new Renban('R9C3', 'R9C2', 'R8C1', 'R7C1'),

  // Arrows: bulb cell first, then arm cells.
  new Arrow('R2C7', 'R2C6', 'R2C5'),
  new Arrow('R2C7', 'R3C7', 'R4C7'),
  new Arrow('R2C3', 'R2C4', 'R2C5'),
  new Arrow('R2C3', 'R3C3', 'R4C3'),
  new Arrow('R5C7', 'R6C7', 'R7C7'),
  new Arrow('R5C3', 'R6C3', 'R7C3'),
  new Arrow('R8C3', 'R8C4', 'R8C5'),
  new Arrow('R8C7', 'R8C6', 'R8C5'),

  // Givens.
  new Given('R1C6', 5),
  new Given('R2C8', 5),
  new Given('R3C4', 8),
  new Given('R3C6', 2),
  new Given('R5C4', 1),
  new Given('R5C5', 4),
  new Given('R5C6', 7),
  new Given('R7C4', 7),
  new Given('R7C6', 4),
  new Given('R8C2', 1),
  new Given('R9C4', 2),
];
