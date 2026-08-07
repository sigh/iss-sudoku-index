// Title: Arrowage
// Author: Celery
// Video: https://www.youtube.com/watch?v=gpvP58KH-p4
// Source: https://app.crackingthecryptic.com/sudoku/jLLJ73Gn4d

// Normal sudoku (9x9, standard 3x3 boxes) plus anti-knight, plus 9 arrows
// (digits along the arm sum to the bulb's digit), plus per-cell parity
// givens: grey-circle cells are odd, grey-square cells are even (encoded as
// multi-value Givens per the ISS catalog, since there is no Odd/Even class).
// Several arrows share a bulb cell (drawn as more than one line leaving the
// same circle in the source); each is listed as its own Arrow constraint.

return [
  new Shape('9x9'),

  new AntiKnight(),

  // Odd cells (opaque grey circle).
  new Given('R2C8', 1, 3, 5, 7, 9),
  new Given('R5C5', 1, 3, 5, 7, 9),

  // Even cells (opaque grey square).
  new Given('R2C4', 2, 4, 6, 8),
  new Given('R4C2', 2, 4, 6, 8),
  new Given('R7C5', 2, 4, 6, 8),
  new Given('R6C8', 2, 4, 6, 8),
  new Given('R8C6', 2, 4, 6, 8),

  // Arrows: bulb cell first, then arm cells in order.
  new Arrow('R4C1', 'R5C1', 'R6C2'),
  new Arrow('R4C1', 'R3C2', 'R3C3', 'R3C4'),
  new Arrow('R7C3', 'R8C2', 'R9C1'),
  new Arrow('R6C3', 'R7C4', 'R8C5'),
  new Arrow('R9C6', 'R9C5', 'R8C4'),
  new Arrow('R9C6', 'R8C7', 'R8C8', 'R8C9'),
  new Arrow('R3C7', 'R4C6', 'R4C5', 'R5C6'),
  new Arrow('R3C7', 'R2C6', 'R1C5'),
  new Arrow('R3C7', 'R4C8', 'R5C9'),
];
