// Title: Leftover Goodies
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=CPq1OPZ3yHg
// Source: https://app.crackingthecryptic.com/sudoku/39p47HfJbF

// Normal sudoku rules apply. Each white circle straddles the shared edge of
// two orthogonally adjacent cells and shows the remainder when the bigger of
// the two digits is divided by the smaller. Every circled pair shares a row
// or column, so ordinary sudoku already forbids the two cells being equal.

const shape = new Shape('9x9');

// Edges (R1C1 style pairs) and their circled remainder, transcribed from the
// 25 white circles drawn on the board (each centred on one shared cell
// edge).
const edges = [
  ['R1C1', 'R1C2', 3],
  ['R3C1', 'R3C2', 1],
  ['R2C2', 'R2C3', 3],
  ['R8C2', 'R9C2', 3],
  ['R3C3', 'R3C4', 3],
  ['R4C8', 'R4C9', 3],
  ['R3C6', 'R3C7', 1],
  ['R7C7', 'R7C8', 1],
  ['R6C3', 'R6C4', 1],
  ['R6C9', 'R7C9', 1],
  ['R3C5', 'R4C5', 1],
  ['R1C6', 'R1C7', 2],
  ['R4C5', 'R4C6', 2],
  ['R4C1', 'R4C2', 2],
  ['R5C4', 'R6C4', 2],
  ['R7C6', 'R8C6', 2],
  ['R8C8', 'R9C8', 2],
  ['R9C8', 'R9C9', 2],
  ['R3C5', 'R3C6', 0],
  ['R1C8', 'R1C9', 0],
  ['R3C1', 'R4C1', 0],
  ['R3C2', 'R4C2', 0],
  ['R6C3', 'R7C3', 0],
  ['R7C3', 'R8C3', 0],
  ['R6C6', 'R6C7', 4],
];

// One Pair key per distinct remainder value; Pair.fnToKey computes the key
// from the actual digit values (1-9) since `shape` carries the value offset.
const remainderValues = [...new Set(edges.map(e => e[2]))];
const keyForRemainder = new Map(remainderValues.map(r => [
  r,
  Pair.fnToKey((a, b) => Math.max(a, b) % Math.min(a, b) === r, shape),
]));

const remainderPairs = edges.map(([a, b, r]) =>
  new Pair(keyForRemainder.get(r), `remainder ${r}`, a, b));

return [
  shape,
  new Given('R1C4', 2),
  ...remainderPairs,
];
