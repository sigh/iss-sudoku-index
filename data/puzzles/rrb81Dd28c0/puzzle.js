// Title: High F**e!
// Author: Filuta
// Video: https://www.youtube.com/watch?v=rrb81Dd28c0
// Source: https://app.crackingthecryptic.com/sudoku/m7rLMrD99R

// Rules encoded: standard 9x9 sudoku (no givens; Shape('9x9') supplies
// default row/column/box all-different, and the payload's explicit regions
// match the default 3x3 boxes). Four clue types share one "unless" shape:
// the pair's own arithmetic condition is waived entirely once either cell
// holds a 5. No native ISS class (Whisper/BlackDot/X/V) supports that
// exception, so every pair below is a custom Pair.fnToKey relation instead:
// green lines require consecutive digits to differ by >= 5 unless one is 5;
// black dots require a 1:2 ratio unless one is 5; V marks require a sum of
// 5 unless one is 5; X marks require a sum of 10 unless one is 5.

// Green line cell paths (closed loops; first cell repeated to cover the
// wrap-around edge), transcribed from the drawn line strokes, interpolated
// through every cell centre each drawn segment crosses (including the
// diagonal segments of the diamond-shaped loops and the one diagonal
// closing edge of the centre-box loop).
const greenLines = [
  ['R1C5', 'R2C4', 'R3C5', 'R2C6', 'R1C5'],
  ['R1C7', 'R2C7', 'R3C8', 'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R2C8', 'R1C7'],
  ['R4C2', 'R5C1', 'R6C2', 'R5C3', 'R4C2'],
  ['R5C5', 'R5C6', 'R4C6', 'R4C5', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R5C5'],
  ['R4C8', 'R5C7', 'R6C8', 'R5C9', 'R4C8'],
  ['R8C6', 'R7C5', 'R8C4', 'R9C5', 'R8C6'],
  ['R8C1', 'R9C2', 'R9C3', 'R8C3', 'R7C3', 'R7C2', 'R7C1', 'R8C1'],
];

// Black dot edges, transcribed from the drawn black-filled rounded edge
// marks.
const blackDotEdges = [
  ['R1C4', 'R2C4'],
  ['R6C5', 'R7C5'],
  ['R8C4', 'R9C4'],
  ['R5C8', 'R5C9'],
];

// X-marked edges, transcribed from the drawn "X" edge marks. The R5C5/R5C6
// edge coincides with the first edge of green line 4 above: both
// constraints apply to that pair.
const xEdges = [
  ['R3C7', 'R3C8'],
  ['R3C5', 'R4C5'],
  ['R5C1', 'R5C2'],
  ['R5C5', 'R5C6'],
  ['R6C8', 'R7C8'],
  ['R7C8', 'R7C9'],
];

// V-marked edge, transcribed from the drawn "V" edge mark.
const vEdges = [
  ['R3C2', 'R4C2'],
];

const diffKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) >= 5 || a === 5 || b === 5, 9);
const ratioKey = Pair.fnToKey(
  (a, b) => a === 2 * b || b === 2 * a || a === 5 || b === 5, 9);
const sum10Key = Pair.fnToKey(
  (a, b) => a + b === 10 || a === 5 || b === 5, 9);
const sum5Key = Pair.fnToKey(
  (a, b) => a + b === 5 || a === 5 || b === 5, 9);

const greenLineConstraints = greenLines.map(
  cells => new Pair(diffKey, 'green line', ...cells));
const blackDotConstraints = blackDotEdges.map(
  ([a, b]) => new Pair(ratioKey, 'black dot', a, b));
const xConstraints = xEdges.map(
  ([a, b]) => new Pair(sum10Key, 'X', a, b));
const vConstraints = vEdges.map(
  ([a, b]) => new Pair(sum5Key, 'V', a, b));

return [
  new Shape('9x9'),
  ...greenLineConstraints,
  ...blackDotConstraints,
  ...xConstraints,
  ...vConstraints,
];
