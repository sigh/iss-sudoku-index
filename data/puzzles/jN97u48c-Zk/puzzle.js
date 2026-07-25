// Title: In Betwixt
// Author: BremSter
// Video: https://www.youtube.com/watch?v=jN97u48c-Zk
// Source: https://sudokupad.app/bremster/inbetwixt

// Normal sudoku rules (standard 3x3 boxes). Dynamic Fog is a solving-UI
// reveal mechanic, not a final-grid rule, and is not encoded. Between Lines:
// digits on a line are strictly between the digits in the circles at its
// ends (Between takes the first/last cell of its argument list as the
// circles). Ratio Pairs: the one black dot forces a 2:1 ratio (BlackDot).
//
// Each line is given as an ordered path from one end-circle to the other,
// per the drawn geometry (source: lines[] waypoints, converted to cell
// paths). Four circles are each shared between two lines (R5C3, R7C3,
// R5C7, R7C7); sharing a circle only means both lines' end constraints
// apply to that one cell, which Between naturally supports since it is
// just another cell reference.

const betweenLines = [
  ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R2C2', 'R2C3', 'R3C3', 'R3C2', 'R3C1'],
  ['R5C3', 'R5C4', 'R6C4', 'R6C5', 'R5C5', 'R4C5', 'R4C6', 'R5C6', 'R5C7'],
  ['R7C3', 'R7C2', 'R8C2', 'R8C3', 'R8C4', 'R9C4', 'R9C5'],
  ['R7C7', 'R7C6', 'R8C6', 'R8C7', 'R8C8', 'R9C8', 'R9C9'],
  ['R5C3', 'R6C3', 'R7C3'],
  ['R5C7', 'R6C7', 'R7C7'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8', 'R2C7', 'R3C7', 'R3C8', 'R3C9'],
];

return [
  new Shape('9x9'),

  new Given('R1C4', 2),
  new Given('R1C6', 8),
  new Given('R2C5', 7),
  new Given('R4C1', 2),
  new Given('R4C9', 7),
  new Given('R5C2', 4),
  new Given('R5C8', 3),
  new Given('R6C1', 6),
  new Given('R6C9', 8),

  ...betweenLines.map(cells => new Between(...cells)),

  // Black dot: source overlays[14], the edge mark between R1C3 and R2C3.
  new BlackDot('R1C3', 'R2C3'),
];
