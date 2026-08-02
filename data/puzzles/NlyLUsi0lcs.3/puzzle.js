// Title: Battenburg Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=NlyLUsi0lcs
// Source: https://tinyurl.com/fjy8sky9

// Normal Sudoku rules apply. Every drawn 2x2 Battenburg rectangle is an
// odd/even checkerboard; because all rectangles are given, every other 2x2
// block is not a checkerboard.
const givens = [
  ['R1C4', 5], ['R1C8', 2], ['R2C5', 1], ['R3C5', 4], ['R3C9', 7],
  ['R4C1', 1], ['R4C9', 6], ['R5C2', 7], ['R5C8', 5], ['R6C1', 4],
  ['R6C9', 3], ['R7C1', 5], ['R7C5', 2], ['R8C5', 3], ['R9C2', 8],
  ['R9C6', 7],
];

// Top-left cells of the 14 rectangle symbols drawn in the source payload.
const rectangles = [
  'R1C2', 'R2C2', 'R3C2', 'R3C3', 'R3C6', 'R4C4', 'R4C5',
  'R5C4', 'R5C5', 'R6C3', 'R6C6', 'R6C7', 'R7C7', 'R8C7',
];
const parityOpposite = Pair.fnToKey((a, b) => a % 2 !== b % 2, 9);
const rectangleRules = rectangles.map(topLeft => {
  const { row, col } = parseCellId(topLeft);
  const topRight = makeCellId(row, col + 1);
  const bottomRight = makeCellId(row + 1, col + 1);
  const bottomLeft = makeCellId(row + 1, col);
  // The repeated first cell closes the 2x2 perimeter.
  return new Pair(parityOpposite, 'opposite parity',
    topLeft, topRight, bottomRight, bottomLeft, topLeft);
});

// The NFA reads a 2x2 block row-major. States a/b remember the first parity;
// state good is reached as soon as the four values cannot be a checkerboard.
const notBattenburg = NFA.encodeSpec({
  startState: 'start',
  transition: (state, value) => {
    const odd = value % 2 === 1;
    if (state === 'start') return odd ? 'a1' : 'b1';
    if (state === 'a1') return odd ? 'good' : 'a2';
    if (state === 'b1') return odd ? 'b2' : 'good';
    if (state === 'a2') return odd ? 'good' : 'a3';
    if (state === 'b2') return odd ? 'b3' : 'good';
    if (state === 'a3') return odd ? undefined : 'good';
    if (state === 'b3') return odd ? 'good' : undefined;
    return 'good';
  },
  accept: state => state === 'good',
  maxDepth: 4,
}, 9);
const shown = new Set(rectangles);
const graph = cellGraph('9x9');
const absentOrigins = [];
for (let row = 1; row < 9; row++) for (let col = 1; col < 9; col++) {
  const topLeft = makeCellId(row, col);
  if (shown.has(topLeft)) continue;
  absentOrigins.push(topLeft);
}
// The same row-major 2x2 NFA applies to every unmarked top-left position.
const absentRectangleRules = graph.makeReplicate(
  new NFA(notBattenburg, 'not a Battenburg', ...graph.block('R1C1', 2, 2)),
  absentOrigins);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...rectangleRules,
  absentRectangleRules,
];
