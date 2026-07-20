// Title: Around Negative Ten
// Author: Ryan W.
// Video: https://www.youtube.com/watch?v=1CDwvRx6UvA
// Source: https://sudokupad.app/e9w1wp3css

// Every shown killer cage sums to 10. Among cells outside those cages, every
// orthogonally connected set that could itself be a distinct-digit 10-cage is
// forbidden. Such a set has at most four cells because 1+2+3+4=10.

const cages = [
  ['R6C5', 'R7C5', 'R7C6'],
  ['R3C4', 'R3C5', 'R4C4'],
  ['R3C6', 'R4C5', 'R4C6', 'R5C6'],
  ['R5C4', 'R5C5'],
  ['R2C5', 'R2C6'],
  ['R6C4', 'R7C4'],
  ['R8C4', 'R8C5'],
  ['R5C7', 'R6C6', 'R6C7'],
  ['R2C3', 'R2C4', 'R3C3'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R6C8', 'R6C9'],
  ['R8C1', 'R8C2'],
  ['R5C8', 'R5C9'],
  ['R7C9', 'R8C8', 'R8C9'],
  ['R2C7', 'R3C7'],
  ['R1C7', 'R1C8', 'R1C9'],
];

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const cellOrder = new Map(gridCells.map((cell, index) => [cell, index]));
const cagedCells = new Set(cages.flat());
const uncagedCells = gridCells.filter(cell => !cagedCells.has(cell));
const uncagedSet = new Set(uncagedCells);

// Generate each connected uncaged set once, keyed in row-major order.
const possibleCages = new Map();
function growConnected(seed, cells) {
  if (cells.length >= 2) {
    const ordered = [...cells].sort((a, b) => cellOrder.get(a) - cellOrder.get(b));
    possibleCages.set(ordered.join(','), ordered);
  }
  if (cells.length === 4) return;

  const candidates = new Set(cells.flatMap(cell => graph.neighbours(cell)));
  for (const candidate of candidates) {
    if (!uncagedSet.has(candidate) || cells.includes(candidate)) continue;
    if (cellOrder.get(candidate) < cellOrder.get(seed)) continue;
    growConnected(seed, [...cells, candidate]);
  }
}
for (const seed of uncagedCells) growConnected(seed, [seed]);

// This machine accepts unless the complete cell set has distinct digits summing
// to 10. A repeat or a partial sum above 10 is permanently safe. The 280
// generated sets canonicalize to one multi-segment NFA constraint.
const notDistinctTen = NFA.encodeSpec({
  startState: {sum: 0, seen: 0},
  transition: (state, value) => {
    if (state === 'safe') return state;
    const bit = 1 << (value - 1);
    if ((state.seen & bit) !== 0 || state.sum + value > 10) return 'safe';
    return {sum: state.sum + value, seen: state.seen | bit};
  },
  accept: state => state === 'safe' || state.sum !== 10,
}, 9);

const negativeTenCages = [...possibleCages.values()].map(cells =>
  new NFA(notDistinctTen, 'not an unshown 10-cage', ...cells));

return [
  new Shape('9x9'),
  ...cages.map(cells => new Cage(10, ...cells)),
  ...negativeTenCages,
];
