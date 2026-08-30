// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=tlZDX2VIVvM
// Source: https://cracking-the-cryptic.web.app/sudoku/tjNL4d4tgn

// Normal sudoku rules apply (standard 3x3 boxes, no givens). The payload
// carries no rules text at all. 24 dashed cages are drawn with no printed
// total, encoded per the standard killer convention as all-different-only
// (Cage sum 0). Two borders carry a drawn inequality chevron, whose point
// faces the smaller side (both happen to straddle two singleton cages, so
// the cell and cage readings coincide). The board also draws twelve
// arithmetic-operator glyphs (+/=/x) on cell borders and one double-line
// mark on another border; none of these has a fixed meaning without the
// setter's rules text or a legend, so they are omitted.

const cages = [
  new Cage(0, 'R2C2', 'R2C3', 'R3C3'),
  new Cage(0, 'R3C4'),
  new Cage(0, 'R4C4', 'R4C5'),
  new Cage(0, 'R4C6'),
  new Cage(0, 'R5C3', 'R5C4', 'R5C5'),
  new Cage(0, 'R5C6'),
  new Cage(0, 'R4C7', 'R5C7', 'R6C7', 'R6C8'),
  new Cage(0, 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9'),
  new Cage(0, 'R1C8', 'R2C8'),
  new Cage(0, 'R7C9', 'R8C9', 'R9C9'),
  new Cage(0, 'R8C8'),
  new Cage(0, 'R7C8'),
  new Cage(0, 'R7C7'),
  new Cage(0, 'R8C7', 'R8C6', 'R8C5', 'R7C6'),
  new Cage(0, 'R7C5', 'R7C4', 'R8C4', 'R9C4', 'R9C3'),
  new Cage(0, 'R9C2'),
  new Cage(0, 'R8C2', 'R7C2'),
  new Cage(0, 'R7C3', 'R6C3'),
  new Cage(0, 'R6C4'),
  new Cage(0, 'R9C1'),
  new Cage(0, 'R8C1'),
  new Cage(0, 'R7C1', 'R6C1', 'R6C2'),
  new Cage(0, 'R4C1', 'R5C1', 'R5C2', 'R4C2'),
  new Cage(0, 'R3C2'),
];

// R9C1 < R8C1 (chevron point in R9C1); R5C6 < R4C6 (chevron point in R5C6).
const inequalities = [
  new GreaterThan('R8C1', 'R9C1'),
  new GreaterThan('R4C6', 'R5C6'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...inequalities,
];
