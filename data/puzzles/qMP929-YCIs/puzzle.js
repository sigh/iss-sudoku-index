// Title: Square Numbered Fog Totals
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=qMP929-YCIs
// Source: https://sudokupad.app/RJtrMfLmBq

// Normal sudoku applies. The nine drawn black square cells contain 1-9 once
// each, and every row-major prefix ending at one of those cells has square sum.
// Fog reveal and its foglight presentation cage are UI-only and are omitted.
const graph = cellGraph('9x9');
const marked = ['R1C8', 'R2C4', 'R3C2', 'R4C1', 'R5C9', 'R6C6', 'R7C5', 'R8C3', 'R9C7'];

// The NFA state is the running prefix sum. Values over 729 are impossible on
// this 9x9 grid; acceptance is exactly at a perfect-square total.
const squarePrefix = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => sum + value,
  accept: sum => Number.isInteger(Math.sqrt(sum)),
  maxDepth: 81,
}, 9);

// The black squares in the source art, in row-major order.
const prefixSquares = marked.map((cell) => {
  const index = graph.cells().indexOf(cell);
  return new NFA(squarePrefix, 'square prefix sum', ...graph.cells().slice(0, index + 1));
});

return [
  new Shape('9x9'),
  new Given('R1C8', 1),
  new Given('R2C3', 4),
  new Given('R2C6', 9),
  new Given('R4C7', 7),
  new Given('R5C1', 1),
  new Given('R5C3', 6),
  new Given('R6C7', 2),
  new Given('R8C4', 8),
  new Given('R9C1', 5),
  new AllDifferent(...marked),
  ...prefixSquares,
];
