// Title: Shield Birds
// Author: 99%Sneaky
// Video: https://www.youtube.com/watch?v=oDC2Hdyv4VQ
// Source: https://sudokupad.app/7f9px0exki

// Normal sudoku rules apply (standard rows/cols/boxes, no givens).
// A digit in a cell with arrows facing outward must be greater than all of
// its orthogonal neighbors (GreaterThan groups below).
// Digits along an arrow sum to the digit in its attached circle (Arrow
// groups below; bulb cell first, arm cells after).
// Digits separated by a white dot are consecutive (WhiteDot); by a black dot
// are in a 1:2 ratio (BlackDot).

return [
  new Shape('9x9'),

  // Outward-arrow cells: R2C2, R2C9, R9C2. Each cell's arrow set is drawn as
  // one outward chevron per orthogonal neighbor it has (4 for R2C2; 3 each
  // for the two edge cells, which are missing the off-grid side), matching
  // the puzzle's shaded-cell background at exactly these three cells.
  // GreaterThan's first cell must exceed every later cell adjacent to it, so
  // listing the shaded cell first and its neighbors after gives "shaded
  // cell > each neighbor" with no unwanted pair between the neighbors
  // themselves.
  new GreaterThan('R2C2', 'R1C2', 'R3C2', 'R2C1', 'R2C3'),
  new GreaterThan('R2C9', 'R1C9', 'R3C9', 'R2C8'),
  new GreaterThan('R9C2', 'R8C2', 'R9C1', 'R9C3'),

  // Sum arrows: circle cell (the drawn circle at the first cell of each
  // arrow's path) then arm cells, read off each arrow's drawn waypoints.
  new Arrow('R2C6', 'R1C6', 'R1C5'),
  new Arrow('R2C3', 'R1C3', 'R1C4'),
  new Arrow('R3C1', 'R3C2', 'R3C3', 'R3C4'),
  new Arrow('R2C8', 'R3C8', 'R4C8'),
  new Arrow('R5C1', 'R5C2', 'R5C3', 'R5C4'),
  new Arrow('R7C1', 'R7C2', 'R7C3', 'R7C4'),
  new Arrow('R5C6', 'R5C7', 'R6C7'),

  // White dots (consecutive): white-filled, black-bordered edge marks.
  new WhiteDot('R1C8', 'R1C9'),
  new WhiteDot('R9C3', 'R9C4'),
  new WhiteDot('R6C7', 'R7C7'),
  new WhiteDot('R3C3', 'R3C4'),
  new WhiteDot('R8C8', 'R9C8'),

  // Black dots (1:2 ratio): solid black-filled edge marks.
  new BlackDot('R1C7', 'R1C8'),
  new BlackDot('R6C2', 'R6C3'),
  new BlackDot('R8C4', 'R8C5'),
];
