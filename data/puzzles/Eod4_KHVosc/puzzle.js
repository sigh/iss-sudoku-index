// Title: Bird Mountain
// Author: Zekiefish
// Video: https://www.youtube.com/watch?v=Eod4_KHVosc
// Source: https://app.crackingthecryptic.com/sudoku/GBJJMBBdfD

// Normal sudoku (standard 3x3 boxes) plus: consecutive digits cannot
// neighbour each other orthogonally (global AntiConsecutive); digits
// increase along each thermometer from the bulb (Thermo); some
// neighbouring cell pairs summing to 5 (V) or 10 (X) are marked -- the
// rule says "some", not "all", so no negative/exhaustive closure is
// encoded over unmarked pairs.

return [
  new Shape('9x9'),

  new Given('R3C5', 1),

  new AntiConsecutive(),

  // Thermo A: bulb R5C7 -> R5C6 -> R4C5 -> R5C4 -> R5C3 -> R6C2.
  new Thermo('R5C7', 'R5C6', 'R4C5', 'R5C4', 'R5C3', 'R6C2'),
  // Thermo B: bulb R7C1 -> R7C2 -> R8C1 -> R8C2 -> R9C1.
  new Thermo('R7C1', 'R7C2', 'R8C1', 'R8C2', 'R9C1'),

  // X (sum 10) marks, from overlay edge text "X".
  new X('R2C1', 'R2C2'),
  new X('R8C2', 'R8C3'),
  new X('R8C5', 'R9C5'),
  new X('R9C7', 'R9C8'),

  // V (sum 5) marks, from overlay edge text "V".
  new V('R2C8', 'R2C9'),
  new V('R3C5', 'R3C6'),
  new V('R4C2', 'R4C3'),
  new V('R5C7', 'R5C8'),
  new V('R6C4', 'R6C5'),
];
