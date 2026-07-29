// Title: Quadrilateral
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=Ok4a-pv3FJY
// Source: https://sudokupad.app/james-sinclair/quadrilateral

// Normal Sudoku rules apply. Thermometers increase from their bulbs; purple
// lines are renbans; orange lines are entropic; X markers sum to 10; and the
// shaded squares are even. Each gold quadrilateral is a Nabner line: its
// digits are distinct and no pair is consecutive. The drawn closing edge is
// stored separately in the source, so each four-cell loop is one set here.
const thermometers = [
  new Thermo('R9C8', 'R9C9', 'R8C9'),
  new Thermo('R1C2', 'R1C1', 'R2C1'),
];

const renbans = [
  new Renban('R4C1', 'R5C1', 'R6C1'),
  new Renban('R1C4', 'R1C5', 'R1C6'),
  new Renban('R4C9', 'R5C9', 'R6C9'),
  new Renban('R9C4', 'R9C5', 'R9C6'),
];

const entropy = [
  new Entropic('R7C6', 'R8C5', 'R7C4', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R4C7', 'R5C8', 'R6C7'),
  new Entropic('R4C3', 'R4C4', 'R3C4'),
];

// PairX compares every pair in a quadrilateral, not merely neighbouring cells.
const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);
const nabners = [
  new PairX(nabnerKey, 'Nabner', 'R2C3', 'R2C2', 'R3C2', 'R3C3'),
  new PairX(nabnerKey, 'Nabner', 'R7C3', 'R7C2', 'R8C2', 'R8C3'),
  new PairX(nabnerKey, 'Nabner', 'R7C7', 'R7C8', 'R8C8', 'R8C7'),
  new PairX(nabnerKey, 'Nabner', 'R2C7', 'R2C8', 'R3C8', 'R3C7'),
];

return [
  new Shape('9x9'),
  new Given('R9C1', 2, 4, 6, 8),
  new Given('R1C9', 2, 4, 6, 8),
  new Given('R7C4', 2, 4, 6, 8),
  new Given('R4C7', 2, 4, 6, 8),
  new Given('R4C4', 2, 4, 6, 8),
  ...thermometers,
  ...renbans,
  ...nabners,
  ...entropy,
  new X('R8C7', 'R8C6'),
  new X('R8C4', 'R9C4'),
];
