// Title: Arrow Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=AvEL10Hx8JY
// Source: https://cracking-the-cryptic.web.app/sudoku/JDrQLdn78m

// Normal sudoku rules apply (default Shape gives rows/cols/boxes). The
// number in a circle is the sum of the digits along every arrow starting
// at that circle; digits may repeat along an arrow. Twelve arrows, listed
// bulb-first, transcribed from the drawn arrow geometry; two arrows share
// a bulb at R7C3.
return [
  new Shape('9x9'),
  new Arrow('R1C1', 'R2C1', 'R3C1', 'R3C2'),
  new Arrow('R3C3', 'R2C3', 'R2C2'),
  new Arrow('R3C4', 'R2C4', 'R2C5'),
  new Arrow('R1C6', 'R2C6', 'R3C6', 'R3C5'),
  new Arrow('R4C5', 'R5C4', 'R5C3'),
  new Arrow('R7C3', 'R6C4', 'R5C5', 'R4C6'),
  new Arrow('R7C3', 'R6C3', 'R5C2', 'R4C1'),
  new Arrow('R6C1', 'R7C1', 'R7C2'),
  new Arrow('R9C1', 'R8C1', 'R8C2', 'R8C3'),
  new Arrow('R9C9', 'R8C9', 'R7C9', 'R6C9', 'R6C8'),
  new Arrow('R2C9', 'R3C9', 'R3C8'),
  new Arrow('R2C7', 'R1C7', 'R1C8', 'R1C9'),
];
