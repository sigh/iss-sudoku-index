// Title: Chess Sudoku With 5 Given Digits?!
// Author: Ashish Kumar
// Video: https://www.youtube.com/watch?v=kgpFXlBftIQ
// Source: https://cracking-the-cryptic.web.app/sudoku/D9M8r6LMp7

// Normal sudoku rules apply. Along thermometers, digits increase from the
// bulb end. Digits a chess knight's move apart may not repeat (global, all
// cells).
//
// Two of the three drawn thermometers share one bulb between two arms (a
// T-junction in the payload's line geometry, not a self-crossing path): each
// arm is its own increasing run away from the shared bulb cell, so each arm
// is a separate Thermo starting at the bulb.

return [
  new Shape('9x9'),

  // Givens (5, printed digits).
  new Given('R1C7', 9),
  new Given('R2C8', 6),
  new Given('R8C2', 4),
  new Given('R8C6', 6),
  new Given('R9C3', 5),

  // Thermometer A: straight, bulb R1C3.
  new Thermo('R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R4C2', 'R4C3'),

  // Thermometer B: bulb R3C5, drawn as one stroke that visits the bulb, peels
  // off to a short arm, then continues to a long arm -- a shared-bulb branch,
  // not a path re-crossing itself. Split into its two arms.
  new Thermo('R3C5', 'R3C4'),
  new Thermo('R3C5', 'R3C6', 'R4C5', 'R5C5', 'R6C5'),

  // Thermometer C: bulb R6C8, the same shared-bulb branch pattern as B.
  new Thermo('R6C8', 'R6C9'),
  new Thermo('R6C8', 'R6C7', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9'),

  new AntiKnight(),
];
