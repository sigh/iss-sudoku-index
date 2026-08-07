// Title: The Headless Hessian
// Author: High Dudgeon
// Video: https://www.youtube.com/watch?v=bYk9PlL0OsY
// Source: https://app.crackingthecryptic.com/sudoku/rLBq3dTLGT

// Standard sudoku (rows, columns, 3x3 boxes) plus anti-knight (AntiKnight),
// green whisper-5 lines (Whisper(5, ...)), purple consecutive-set lines
// (Renban), and question-mark cell pairs summing to 5 or 10 (Or(V, X) per
// pair, since V is sum-5 and X is sum-10 on adjacent cells). No givens.

const greenLines = [
  // Line #0 (yellowgreen), drawn waypoint path.
  ['R3C4', 'R2C3', 'R3C2', 'R3C3'],
  // Line #1 (yellowgreen), closed loop -- path already repeats its start
  // cell (R2C7) at the end, covering the wrap-around edge.
  ['R2C7', 'R3C6', 'R3C7', 'R3C8', 'R2C7'],
  // Line #2 (yellowgreen); the stroke passes back through R4C5, so it is
  // listed twice -- each occurrence still binds to its own neighbours.
  ['R2C6', 'R3C5', 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R4C5'],
  // Line #3 (yellowgreen); shares its start cell R6C6 with purple line #4
  // below (a different stroke/colour, so it keeps its own rule there).
  ['R6C6', 'R6C5', 'R7C5', 'R7C4', 'R6C4'],
].map((cells) => new Whisper(5, ...cells));

const purpleLines = [
  ['R6C8', 'R5C8', 'R6C7', 'R6C6'],
  ['R8C5', 'R8C4'],
  ['R8C3', 'R7C2', 'R6C2'],
].map((cells) => new Renban(...cells));

// Each "?" overlay sits on the edge between two orthogonally adjacent
// cells; rules text: sum to 5 or 10.
const questionMarkPairs = [
  ['R8C3', 'R8C4'],
  ['R8C6', 'R8C7'],
  ['R2C5', 'R3C5'],
].map(([a, b]) => new Or([new V(a, b), new X(a, b)]));

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...greenLines,
  ...purpleLines,
  ...questionMarkPairs,
];
