// Title: Feeling Rough
// Author: Rosie
// Video: https://www.youtube.com/watch?v=t0aX5CNmhyw
// Source: https://sudokupad.app/nmzsv3jbx9

// Standard Sudoku. Every visible circle counts its own digit roughly: digit X
// occurs in either X-1 or X+1 circles, never exactly X. Orthogonally adjacent
// circles belong to different entropy bands. Arrow arms sum to their circles.
const circles = [
  'R1C1', 'R1C2', 'R1C8', 'R1C9',
  'R2C1', 'R2C2', 'R2C8', 'R2C9',
  'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7',
  'R4C3', 'R4C7',
  'R5C3', 'R5C5', 'R5C7',
  'R6C3', 'R6C7',
  'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7',
  'R8C1', 'R8C2', 'R8C8', 'R8C9',
  'R9C1', 'R9C2', 'R9C8', 'R9C9',
];

// One machine per digit scans all circles. A digit absent from every circle has
// no circle claiming its count; otherwise its bounded count is one of the two
// permitted rough totals.
const roughCount = (digit) => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => ({
    count: Math.min(count + (value === digit ? 1 : 0), digit + 2),
  }),
  accept: ({ count }) =>
    count === 0 || count === digit - 1 || count === digit + 1,
}, 9);

const graph = cellGraph('9x9');
const circleSet = new Set(circles);
const entropyKey = Pair.fnToKey(
  (a, b) => Math.floor((a - 1) / 3) !== Math.floor((b - 1) / 3), 9);
const entropyPairs = circles.flatMap(cell => graph.neighbours(cell)
  .filter(other => circleSet.has(other) && cell < other)
  .map(other => new Pair(entropyKey, 'circle entropy', cell, other)));

return [
  new Shape('9x9'),
  new Given('R3C1', 5),
  new Given('R4C9', 7),
  new Given('R9C5', 7),

  ...Array.from({ length: 9 }, (_, i) =>
    new NFA(roughCount(i + 1), `rough count ${i + 1}`, ...circles)),
  ...entropyPairs,

  new Arrow('R1C2', 'R1C3', 'R1C4'),
  new Arrow('R1C8', 'R1C7', 'R1C6'),
  new Arrow('R7C5', 'R6C5', 'R5C4'),
  new Arrow('R3C6', 'R4C6', 'R5C6'),
  new Arrow('R6C3', 'R6C2', 'R6C1'),
];
