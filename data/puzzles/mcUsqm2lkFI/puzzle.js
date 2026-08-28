// Title: Kropki Crime Scene
// Author: Unknown
// Video: https://www.youtube.com/watch?v=mcUsqm2lkFI
// Source: https://cracking-the-cryptic.web.app/sudoku/L8LDQdbmm8

// Normal sudoku rules on a 9x9 grid with standard 3x3 boxes; no givens.
// Numbers increase from the bulb end of the thermometer (Thermo). Cells
// separated by a white circle are consecutive (WhiteDot); cells separated by
// a black circle are in the ratio 1:2 (BlackDot). Not all adjacent pairs
// carry a circle -- the rules state no "all dots given" exhaustiveness
// clause, so an undrawn pair carries no implication.
//
// The video's shaded-tile Morse-code reveal (murder weapon on one shade,
// murderer's name on the other, including circles "missing" from the
// drawing that the solver fills in after solving) is a narrative bonus read
// off the solved grid's own digit relationships -- it adds no constraint
// on which digits are placed, so it is not encoded here.

return [
  new Shape('9x9'),

  // Thermo: bulb R3C4, strictly increasing along the arm toward R3C1.
  new Thermo('R3C4', 'R3C3', 'R3C2', 'R3C1'),

  // White dots (consecutive), one per drawn edge-sized rounded white mark.
  new WhiteDot('R1C2', 'R1C3'),
  new WhiteDot('R1C8', 'R1C9'),
  new WhiteDot('R3C8', 'R3C9'),
  new WhiteDot('R2C4', 'R2C5'),
  new WhiteDot('R5C4', 'R5C5'),
  new WhiteDot('R4C4', 'R4C5'),
  new WhiteDot('R4C5', 'R4C6'),
  new WhiteDot('R4C8', 'R5C8'),
  new WhiteDot('R7C8', 'R7C9'),
  new WhiteDot('R7C4', 'R7C5'),
  new WhiteDot('R8C5', 'R8C6'),
  new WhiteDot('R7C2', 'R7C3'),
  new WhiteDot('R7C1', 'R7C2'),
  new WhiteDot('R8C2', 'R9C2'),
  new WhiteDot('R9C7', 'R9C8'),

  // Black dots (ratio 1:2), one per drawn edge-sized rounded black mark.
  new BlackDot('R1C1', 'R1C2'),
  new BlackDot('R1C3', 'R1C4'),
  new BlackDot('R2C3', 'R2C4'),
  new BlackDot('R2C6', 'R3C6'),
  new BlackDot('R1C7', 'R1C8'),
  new BlackDot('R6C5', 'R6C6'),
  new BlackDot('R5C2', 'R5C3'),
  new BlackDot('R7C3', 'R7C4'),
  new BlackDot('R8C1', 'R8C2'),
  new BlackDot('R8C1', 'R9C1'),
  new BlackDot('R9C8', 'R9C9'),
];
