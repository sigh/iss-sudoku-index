// Title: Duality
// Author: Riffclown
// Video: https://www.youtube.com/watch?v=PpGLfcHggzs
// Source: https://app.crackingthecryptic.com/sudoku/9fb3R96TNj

// Normal sudoku rules apply (standard 3x3 boxes, default row/column/box
// all-different). All eight blue lines are simultaneously thermometers
// (Thermo: strictly increasing from the filled-circle bulb to the tip) and
// Region Sum Lines (RegionSumLine: equal sum within each box segment the
// line passes through). Each line is encoded once as a shared cell list fed
// to both constraint classes, per the stated "All Thermos are also Region
// Sum Lines" rule. Bulb-to-tip order for each line is taken from the
// payload's circle overlay, which sits on the first cell of that line's
// drawn coordinate list.
const lines = [
  ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7'],
  ['R5C8', 'R4C8', 'R3C8'],
  ['R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'],
  ['R1C4', 'R2C4', 'R3C4', 'R3C5', 'R4C5', 'R5C5'],
  ['R2C2', 'R3C3', 'R4C3'],
  ['R5C2', 'R4C2', 'R3C2'],
  ['R9C3', 'R8C3', 'R7C3', 'R7C2', 'R7C1', 'R6C1', 'R5C1'],
  ['R9C5', 'R9C6', 'R8C7'],
];

return [
  new Shape('9x9'),
  new Given('R5C3', 6),
  ...lines.map(cells => new Thermo(...cells)),
  ...lines.map(cells => new RegionSumLine(...cells)),
];
