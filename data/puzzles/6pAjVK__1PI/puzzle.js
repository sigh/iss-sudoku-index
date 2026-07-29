// Title: Two is the Loneliest Number
// Author: Caleb Norris
// Video: https://www.youtube.com/watch?v=6pAjVK__1PI
// Source: https://app.crackingthecryptic.com/nn0yjxybzz

// Normal Sudoku. Cages have distinct digits summing to their displayed totals.
// Adjacent cells on green lines differ by at least 5. Black dots are 2:1, and
// all possible black dots are shown.
const graph = cellGraph('9x9');
const blackDots = new Set(['R4C5/R5C5', 'R5C5/R6C5']);
const edgeKey = (a, b) => [a, b].sort().join('/');
const noBlackDot = Pair.fnToKey((a, b) => a !== b * 2 && b !== a * 2, 9);

// The cage totals and green paths are transcribed from the drawn clues.
const cages = [
  new Cage(16, 'R5C9', 'R6C9'),
  new Cage(8, 'R5C4', 'R5C5', 'R5C6'),
  new Cage(13, 'R2C5', 'R3C5'),
];
const greenLines = [
  new Whisper(5, 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3'),
  new Whisper(5, 'R2C2', 'R3C2'),
  new Whisper(5, 'R4C2', 'R5C2', 'R6C2'),
  new Whisper(5, 'R6C3', 'R7C3', 'R7C4', 'R7C5'),
  new Whisper(5, 'R7C4', 'R8C4'),
  new Whisper(5, 'R8C6', 'R7C6', 'R7C7'),
  new Whisper(5, 'R8C7', 'R8C8', 'R7C8'),
  new Whisper(5, 'R8C9', 'R9C9', 'R9C8'),
  new Whisper(5, 'R2C7', 'R3C7', 'R4C7', 'R5C7'),
  new Whisper(5, 'R5C8', 'R4C8', 'R4C7'),
  new Whisper(5, 'R1C8', 'R2C8', 'R2C9', 'R1C9'),
  new Whisper(5, 'R1C5', 'R1C4', 'R2C4', 'R3C4'),
];

// The custom Pair predicate forbids the 2:1 relation on every undotted
// orthogonal edge, implementing the stated negative black-dot rule.
const horizontalStarts = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalStarts = graph.cells().filter(cell => {
  const down = graph.step(cell, 1, 0);
  return down && !blackDots.has(edgeKey(cell, down));
});
const negativeBlackDots = [
  graph.makeReplicate(
    [new Pair(noBlackDot, 'no black dot', 'R1C1', 'R1C2')],
    horizontalStarts,
  ),
  graph.makeReplicate(
    [new Pair(noBlackDot, 'no black dot', 'R1C1', 'R2C1')],
    verticalStarts,
  ),
];

return [
  new Shape('9x9'),
  new Given('R8C2', 2),
  ...cages,
  ...greenLines,
  new BlackDot('R4C5', 'R5C5'),
  new BlackDot('R5C5', 'R6C5'),
  ...negativeBlackDots,
];
