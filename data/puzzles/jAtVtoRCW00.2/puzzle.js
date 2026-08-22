// Title: Two Clever By Half
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=jAtVtoRCW00
// Source: https://tinyurl.com/567ra4pm

// Normal sudoku rules apply. Black dots require a 2:1 ratio between the
// digits they connect; white dots require the printed difference. All 7
// ratio dots and 22 of the 23 difference dots are printed "2"; one
// difference dot (R4C1-R4C2) is printed "5". Every dot connects orthogonally
// adjacent cells (source: difference/ratio arrays in the payload).

// All black dots here are printed "2", so BlackDot's fixed 2:1 semantics
// match exactly.
const blackDotEdges = [
  ['R1C7', 'R1C8'],
  ['R2C8', 'R2C9'],
  ['R9C2', 'R9C3'],
  ['R8C1', 'R8C2'],
  ['R4C4', 'R5C4'],
  ['R8C5', 'R8C6'],
  ['R6C9', 'R7C9'],
];

// White dots printed "2" (difference = 2). WhiteDot is fixed to
// difference = 1, so these need a custom Pair key.
const diff2Edges = [
  ['R1C8', 'R2C8'],
  ['R2C9', 'R3C9'],
  ['R8C2', 'R9C2'],
  ['R7C1', 'R8C1'],
  ['R6C1', 'R7C1'],
  ['R9C3', 'R9C4'],
  ['R1C6', 'R1C7'],
  ['R3C9', 'R4C9'],
  ['R5C6', 'R6C6'],
  ['R6C5', 'R6C6'],
  ['R4C4', 'R4C5'],
  ['R3C6', 'R4C6'],
  ['R6C3', 'R6C4'],
  ['R6C2', 'R7C2'],
  ['R2C6', 'R2C7'],
  ['R2C4', 'R2C5'],
  ['R9C5', 'R9C6'],
  ['R1C3', 'R1C4'],
  ['R1C2', 'R1C3'],
  ['R1C4', 'R2C4'],
  ['R8C8', 'R9C8'],
  ['R3C6', 'R3C7'],
];

// The one white dot printed "5" (source: difference array, R4C1/R4C2 entry).
const diff5Edges = [
  ['R4C1', 'R4C2'],
];

const diff2Key = Pair.fnToKey((a, b) => Math.abs(a - b) === 2, 9);
const diff5Key = Pair.fnToKey((a, b) => Math.abs(a - b) === 5, 9);

return [
  new Shape('9x9'),

  new Given('R1C1', 2),
  new Given('R3C4', 2),
  new Given('R4C3', 2),
  new Given('R6C7', 2),
  new Given('R7C6', 2),
  new Given('R9C9', 2),

  ...blackDotEdges.map(cells => new BlackDot(...cells)),
  ...diff2Edges.map(cells => new Pair(diff2Key, 'difference 2', ...cells)),
  ...diff5Edges.map(cells => new Pair(diff5Key, 'difference 5', ...cells)),
];
