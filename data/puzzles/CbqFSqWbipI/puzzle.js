// Title: Dancing in the Rain
// Author: Sumanta (ANU)
// Video: https://www.youtube.com/watch?v=CbqFSqWbipI
// Source: https://app.crackingthecryptic.com/sudoku/fH46JBGT7L

// Normal sudoku rules apply; the grid has no givens. Along grey thermometers,
// digits must increase from the bulb end. Cages show their sums. White dots
// join consecutive digits; black dots join digits with a 1:2 ratio.
// Neighbouring digits differ at least by 5 along the green line.
//
// Nothing is omitted. The dots are not declared exhaustive, so unmarked edges
// stay unconstrained (WhiteDot/BlackDot, not StrictKropki).

return [
  new Shape('9x9'),

  // Cage totals as drawn; each cage lies within a single row, so the killer
  // cage's distinctness is already forced by that row and adds nothing.
  new Cage(23, 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'),
  new Cage(20, 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'),

  // Thermometer 1: one branching figure with its bulb circle drawn at R2C7.
  // Four grey strokes and two bulb circles are drawn; three of the strokes
  // meet in one connected figure whose only bulb is at R2C7, so "increase
  // from the bulb end" orders every arm outwards from R2C7. Each Thermo below
  // is one run from a junction cell to a tip; the junction cell repeats so the
  // ordering carries across the branch.
  //
  // Shaft: bulb R2C7 down column 7, then south-west to R7C5.
  new Thermo('R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C6', 'R7C6', 'R7C5'),
  // Branch leaving the shaft at R5C7 (that stroke's own first waypoint).
  new Thermo('R5C7', 'R6C8', 'R7C8', 'R7C9'),
  // The stroke R4C5-R3C6-R3C7-R3C8-R2C9 runs through the shaft cell R3C7,
  // making R3C7 a four-way junction with an arm on each side. It carries no
  // bulb of its own, so its direction is not free: both arms lead away from
  // R2C7 and therefore both increase outwards from R3C7.
  new Thermo('R3C7', 'R3C6', 'R4C5'),
  new Thermo('R3C7', 'R3C8', 'R2C9'),

  // Thermometer 2: bulb circle drawn at R5C3, single unbranched stroke.
  new Thermo('R5C3', 'R4C4', 'R3C3', 'R2C2'),

  new WhiteDot('R1C6', 'R1C7'),
  new WhiteDot('R1C8', 'R2C8'),
  new WhiteDot('R2C5', 'R3C5'),
  new WhiteDot('R4C2', 'R4C3'),
  new WhiteDot('R5C1', 'R6C1'),
  new WhiteDot('R6C4', 'R6C5'),

  new BlackDot('R1C1', 'R2C1'),
  new BlackDot('R4C8', 'R5C8'),

  // Green line; R2C2 is shared with thermometer 2's far end.
  new Whisper(5, 'R1C4', 'R1C3', 'R2C2', 'R3C1', 'R4C1'),
];
