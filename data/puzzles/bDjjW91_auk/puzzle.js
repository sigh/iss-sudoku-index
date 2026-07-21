// Title: Odd Patterns
// Author: fezzy
// Video: https://www.youtube.com/watch?v=bDjjW91_auk
// Source: https://sudokupad.app/d63bh82dzc

// Standard Sudoku applies. Equal digits also cannot be a knight's move apart.
const thermometers = [
  ['R6C4', 'R7C5', 'R6C6', 'R5C5'],
  ['R5C6', 'R4C5', 'R5C4', 'R6C3'],
  ['R8C4', 'R8C5', 'R9C5', 'R8C6'],
  ['R4C8', 'R5C7', 'R4C6', 'R3C5'],
  ['R3C8', 'R2C7', 'R3C6'],
];

const oddCircles = [
  'R1C1', 'R2C3', 'R3C4', 'R5C1',
  'R6C1', 'R6C5', 'R6C7', 'R6C9',
];

// Each circle counts odd king-neighbours that remain within its Sudoku box.
const graph = cellGraph('9x9');
function boxIndex(cell) {
  const { row, col } = parseCellId(cell);
  return 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3);
}

const oddCountSpec = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const nextCount = count + value % 2;
    return nextCount <= target ? { target, count: nextCount } : undefined;
  },
  accept: ({ target, count }) => target !== null && count === target,
}, 9);

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...thermometers.map(cells => new Thermo(...cells)),
  ...oddCircles.map(circle => new NFA(
    oddCountSpec,
    'Odd neighbour count',
    circle,
    ...graph.kingNeighbours(circle).filter(peer => boxIndex(peer) === boxIndex(circle)),
  )),
];
