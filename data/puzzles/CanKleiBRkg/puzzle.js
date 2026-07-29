// Title: Manifold
// Author: Oddlyeven
// Video: https://www.youtube.com/watch?v=CanKleiBRkg
// Source: https://sudokupad.app/i3me9kp7bt

// Place 0-8 once each in every row, column, and box. Arrow arms sum to their
// circles; Xs sum to 10, Vs sum to 5, and white dots join consecutive digits.
// Arrow paths and dominoes are transcribed from the corresponding drawn clues.
return [
  new Shape('9x9', '0-8'),

  new Arrow('R2C8', 'R1C7', 'R1C6', 'R1C5'),
  new Arrow('R8C2', 'R9C3', 'R9C4', 'R9C5'),
  new Arrow('R4C7', 'R3C8', 'R3C9', 'R2C9'),
  new Arrow('R7C8', 'R6C7'),
  new Arrow('R9C7', 'R8C8', 'R8C9', 'R7C9'),
  new Arrow('R3C2', 'R4C3', 'R5C3'),
  new Arrow('R6C3', 'R7C2', 'R7C1', 'R8C1'),
  new Arrow('R1C3', 'R2C2', 'R2C1', 'R3C1'),

  new X('R1C8', 'R1C9'),
  new X('R1C1', 'R1C2'),
  new X('R9C8', 'R9C9'),
  new X('R9C1', 'R9C2'),
  new X('R4C9', 'R5C9'),
  new X('R7C5', 'R8C5'),

  new V('R5C9', 'R6C9'),
  new V('R7C2', 'R7C3'),
  new V('R4C2', 'R5C2'),

  new WhiteDot('R6C5', 'R6C6'),
  new WhiteDot('R4C6', 'R5C6'),
  new WhiteDot('R4C4', 'R4C5'),
  new WhiteDot('R5C4', 'R6C4'),
];
