// Title: Abatement
// Author: dumediat
// Video: https://www.youtube.com/watch?v=IMmijOtfgpA
// Source: https://sudokupad.app/r7nwd76xu3

// Normal sudoku on a 9x9 grid with default 3x3 boxes. Three extra rules:
//  - Each of the two main diagonals may contain at most 3 distinct digits
//    (repeats allowed within the diagonal; encoded below with a capped
//    CountDistinct control Var per diagonal).
//  - Each quadruple circle's listed digits must each appear at least once in
//    its surrounding 2x2 (Quad).
//  - The gray-circled cell must hold an odd digit (Given restricted to
//    1,3,5,7,9).

const diag1 = [
  'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9',
];
const diag2 = [
  'R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9',
];

// One control Var per diagonal: CountDistinct ties the control cell's value
// to the number of distinct digits among the rest of the list; capping the
// control to 1-3 caps the diagonal's distinct-digit count at 3.
const diagControl = new Var('D', 'diagDistinctCount', 2);
const diagCaps = [
  new Given(diagControl.cell(1), 1, 2, 3),
  new CountDistinct(diagControl.cell(1), ...diag1),
  new Given(diagControl.cell(2), 1, 2, 3),
  new CountDistinct(diagControl.cell(2), ...diag2),
];

// Quadruple circles: Quad(topLeftCell, ...values) -- topLeftCell is the
// top-left cell of the surrounding 2x2. Cell/digit pairs transcribed from the
// drawn circle + its adjacent digit-text overlays.
const quads = [
  new Quad('R1C3', 1, 8),
  new Quad('R3C1', 1, 2, 3),
  new Quad('R8C3', 1, 4, 9),
  new Quad('R3C8', 3, 6),
  new Quad('R1C6', 5, 7, 8),
  new Quad('R8C6', 4, 5),
  new Quad('R6C1', 2, 7),
  new Quad('R6C8', 5, 6, 7),
  new Quad('R3C6', 1, 2, 6, 7),
  new Quad('R6C6', 1, 3, 8, 9),
  new Quad('R3C3', 4, 5, 7, 9),
  new Quad('R6C3', 2, 3, 5, 6),
];

// Gray circle (underlay at R1C5): odd-digit cell -- no dedicated Odd class,
// so this is a candidate-restricted Given.
const grayCircle = new Given('R1C5', 1, 3, 5, 7, 9);

return [
  new Shape('9x9'),
  diagControl,
  ...diagCaps,
  ...quads,
  grayCircle,
];
