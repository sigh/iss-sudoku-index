// Title: Thermography
// Author: Malrog
// Video: https://www.youtube.com/watch?v=GXmUdrb54fI
// Source: https://app.crackingthecryptic.com/sudoku/829gjTMdRd

// Normal sudoku rules apply. Digits along a thermometer must increase from
// the bulb end. Six bulb overlays and ten line strokes are drawn; four bulbs
// sit exactly at the shared endpoint of two line strokes (the overlay centre
// coincides with that junction cell), so those four thermometers are
// Y-shaped: one bulb, two increasing arms. Each arm is encoded as its own
// Thermo starting at the shared bulb cell. The remaining two bulbs sit at
// the lone end of a single stroke and are encoded as ordinary straight
// thermometers.

return [
  new Shape('9x9'),

  // Fork at R1C9: arm left along row 1, arm down column 9.
  new Thermo('R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2'),
  new Thermo('R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'),

  // Fork at R9C1: arm up column 1, arm right along row 9.
  new Thermo('R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1'),
  new Thermo('R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6'),

  // Fork at R3C3: arm right along row 3, arm down column 3.
  new Thermo('R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'),
  new Thermo('R3C3', 'R4C3', 'R5C3', 'R6C3'),

  // Fork at R7C7: arm up column 7, arm left along row 7.
  new Thermo('R7C7', 'R6C7', 'R5C7', 'R4C7'),
  new Thermo('R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3'),

  // Straight thermometer, bulb R6C4.
  new Thermo('R6C4', 'R5C4', 'R4C4', 'R4C5'),

  // Straight thermometer, bulb R4C6.
  new Thermo('R4C6', 'R5C6', 'R6C6', 'R6C5'),
];
