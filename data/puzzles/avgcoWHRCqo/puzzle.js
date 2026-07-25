// Title: Y
// Author: Niclas Kupper
// Video: https://www.youtube.com/watch?v=avgcoWHRCqo
// Source: https://sudokupad.app/2ts0g02hfp

// Normal sudoku rules apply. A white dot between two cells means those
// digits are consecutive (WhiteDot). A black dot between two cells means
// one digit is double the other (BlackDot). The rules make no statement
// about all such pairs being marked, so this is the ordinary (non-strict)
// reading: unmarked adjacent cells carry no implication either way.

// Kropki dot edges, one entry per drawn dot, read from the overlay marks'
// backgroundColor/borderColor (white fill + black border = white dot;
// black fill = black dot). Each pair is encoded as its own two-cell
// WhiteDot/BlackDot rather than chained, because the drawn dots branch
// (R7C3 and R3C7 each sit on three dot edges), so no single ordered cell
// list could carry every edge without also implying an edge that was never
// drawn.
const whiteDotEdges = [
  ['R2C1', 'R3C1'],
  ['R3C1', 'R3C2'],
  ['R4C2', 'R4C3'],
  ['R4C3', 'R5C3'],
  ['R9C1', 'R9C2'],
  ['R8C1', 'R9C1'],
  ['R8C1', 'R8C2'],
  ['R7C2', 'R8C2'],
  ['R7C2', 'R7C3'],
  ['R6C3', 'R7C3'],
  ['R6C3', 'R6C4'],
  ['R5C4', 'R6C4'],
  ['R5C4', 'R5C5'],
  ['R4C5', 'R5C5'],
  ['R4C5', 'R4C6'],
  ['R3C6', 'R4C6'],
  ['R3C6', 'R3C7'],
  ['R2C7', 'R3C7'],
  ['R2C7', 'R2C8'],
  ['R1C8', 'R2C8'],
  ['R3C7', 'R3C8'],
  ['R5C6', 'R6C6'],
  ['R7C4', 'R8C4'],
];

const blackDotEdges = [
  ['R7C3', 'R8C3'],
  ['R7C6', 'R7C7'],
];

return [
  new Shape('9x9'),

  new Given('R5C1', 7),
  new Given('R9C8', 2),
  new Given('R9C9', 1),

  ...whiteDotEdges.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDotEdges.map(([a, b]) => new BlackDot(a, b)),
];
