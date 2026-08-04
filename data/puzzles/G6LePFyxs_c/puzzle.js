// Title: Cross Reference
// Author: Celery
// Video: https://www.youtube.com/watch?v=G6LePFyxs_c
// Source: https://app.crackingthecryptic.com/sudoku/r8R7M39bQB

// Normal sudoku rules apply. On the orange diagonal (R1C1-R9C9), the digit in
// row i names the column where 5 appears in row i. On the blue diagonal
// (R1C9-R9C1), the digit in column c names the row where 5 appears in
// column c. Green lines are German whisper lines (adjacent digits differ by
// at least 5); the four strokes are transcribed from the drawn geometry.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Reads a control cell first, remembering its value as an index, then reads
// the 9 cells of the row/column it indexes, in order: whichever one sits at
// the remembered index must hold `target`. The control cell is itself one of
// those 9 cells (it lies on the row/column it indexes), so this also covers
// the self-referential case -- the control's own value competing with its
// own position -- without a separate rule.
const indexOfMachine = (target) => NFA.encodeSpec({
  startState: { index: null, pos: 0 },
  transition: ({ index, pos }, value) => {
    if (pos === 0) return { index: value, pos: 1 };
    if (pos === index && value !== target) return undefined;
    return { index, pos: pos + 1 };
  },
  accept: () => true,
  // Bounds state creation: control cell + 9 row/column cells = 10 reads.
  maxDepth: 10,
}, geometry.numValues);
const indexOf5 = indexOfMachine(5);

// Orange diagonal: row i's control cell names the column of 5 in row i.
const orangeClues = Array.from({ length: 9 }, (_, i) => {
  const control = makeCellId(i + 1, i + 1);
  return new NFA(indexOf5, 'orange-row-index', control, ...graph.row(i + 1));
});

// Blue diagonal: column c's control cell names the row of 5 in column c.
const blueClues = Array.from({ length: 9 }, (_, i) => {
  const col = 9 - i;
  const control = makeCellId(i + 1, col);
  return new NFA(indexOf5, 'blue-column-index', control, ...graph.column(col));
});

// Green whisper strokes, transcribed from the drawn geometry: two short
// columns (C1, C9) and two zigzags near the top and bottom edges.
const greenLines = [
  ['R4C1', 'R5C1', 'R6C1'],
  ['R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R9C7', 'R9C6', 'R8C5', 'R9C4', 'R8C3'],
  ['R2C7', 'R1C6', 'R2C5', 'R1C4', 'R1C3'],
];

return [
  new Shape('9x9'),
  new Given('R1C6', 2),
  ...orangeClues,
  ...blueClues,
  ...greenLines.map(line => new Whisper(5, ...line)),
];
