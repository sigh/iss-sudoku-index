// Title: Eddies
// Author: Henk Nicolai
// Video: https://www.youtube.com/watch?v=MbaQdYQV0DM
// Source: https://app.crackingthecryptic.com/sudoku/b4Btb33hfF

// Normal sudoku rules apply. Digits along an arrow sum to the digit in its
// circle (bulb); digits may repeat along an arrow. Cells with a grey circle
// must be odd; cells with a grey square must be even. Grid uses standard 3x3
// boxes (payload's own `regions` array).
//
// Two arrows share one bulb circle at R3C3, forking into separate arms; each
// is encoded as its own Arrow so the two arms are independently constrained.
// One drawn arrow entry has no path geometry and renders nothing, so it is
// omitted (not a drawn clue).

return [
  new Arrow('R3C1', 'R2C1', 'R1C2'),
  new Arrow('R3C3', 'R2C4', 'R1C4'),
  new Arrow('R3C3', 'R3C4', 'R4C5', 'R5C5'),
  new Arrow('R3C8', 'R2C7', 'R1C8'),
  new Arrow('R5C3', 'R5C2', 'R5C1'),
  new Arrow('R5C7', 'R5C8', 'R5C9'),
  new Arrow('R7C5', 'R8C5', 'R9C5'),
  new Arrow('R7C1', 'R8C1', 'R9C2', 'R8C3'),
  new Arrow('R7C9', 'R8C9', 'R9C9', 'R9C8'),
  new Arrow('R3C5', 'R2C5', 'R1C5'),
  new Arrow('R6C2', 'R7C3'),

  // Grey circle underlays -> odd.
  new Given('R4C4', 1, 3, 5, 7, 9),
  new Given('R4C6', 1, 3, 5, 7, 9),
  new Given('R6C6', 1, 3, 5, 7, 9),
  new Given('R6C4', 1, 3, 5, 7, 9),

  // Grey square underlays -> even.
  new Given('R2C2', 2, 4, 6, 8),
  new Given('R2C8', 2, 4, 6, 8),
  new Given('R8C8', 2, 4, 6, 8),
  new Given('R8C2', 2, 4, 6, 8),
];

