// Title: Change Log
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=MyMUFi6rNdA
// Source: https://sudokupad.app/0zns8fzorv

// Normal 6x6 Sudoku rules apply. A simple 13-segment path runs along interior
// grid lines from the top entrance at vertex (0, 1) to the left exit at (2, 0).
// Its segment differences, from entrance to exit, equal the memory cells in
// reading order.

const memoryCells = [
  'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5',
  'R3C4', 'R3C5', 'R4C3', 'R4C6', 'R5C1',
  'R5C6', 'R6C3', 'R6C4',
];

const start = [0, 1];
const exit = [2, 0];
const pathLength = memoryCells.length;

const sameVertex = ([r1, c1], [r2, c2]) => r1 === r2 && c1 === c2;
const isInteriorOrEndpoint = ([row, col]) =>
  (row >= 1 && row <= 5 && col >= 1 && col <= 5) ||
  sameVertex([row, col], start) || sameVertex([row, col], exit);
const vertexKey = ([row, col]) => `${row},${col}`;
const distanceToExit = ([row, col]) =>
  Math.abs(row - exit[0]) + Math.abs(col - exit[1]);

// Enumerating the 72 possible simple paths makes the global topology exact.
// Interior vertices may be used at most once, which is precisely the no-touch
// rule for a path drawn on grid lines.
const pathsFrom = (path, visited) => {
  const current = path[path.length - 1];
  const edgesUsed = path.length - 1;
  if (edgesUsed === pathLength) return sameVertex(current, exit) ? [path] : [];

  const remaining = pathLength - edgesUsed;
  if (sameVertex(current, exit) || distanceToExit(current) > remaining) return [];

  const [row, col] = current;
  const neighbours = [
    [row - 1, col], [row + 1, col],
    [row, col - 1], [row, col + 1],
  ];
  return neighbours
    .filter(next => isInteriorOrEndpoint(next) && !visited.has(vertexKey(next)))
    .flatMap(next => pathsFrom(
      [...path, next],
      new Set([...visited, vertexKey(next)]),
    ));
};
const paths = pathsFrom([start], new Set([vertexKey(start)]));

// Return the two cells separated by a grid-line segment. Vertex coordinates
// are zero-based; makeCellId uses one-based Sudoku coordinates.
const crossedCells = ([r1, c1], [r2, c2]) => {
  if (r1 === r2) {
    const row = r1;
    const col = Math.min(c1, c2) + 1;
    return [makeCellId(row, col), makeCellId(row + 1, col)];
  }
  const row = Math.min(r1, r2) + 1;
  const col = c1;
  return [makeCellId(row, col), makeCellId(row, col + 1)];
};

// Each repeated triple is [cell on one side, cell on the other, memory cell].
const differenceMachine = NFA.encodeSpec({
  startState: { phase: 'first' },
  transition: (state, value) => {
    if (state.phase === 'first') return { phase: 'second', first: value };
    if (state.phase === 'second') {
      return { phase: 'memory', difference: Math.abs(state.first - value) };
    }
    return value === state.difference ? { phase: 'first' } : undefined;
  },
  accept: state => state.phase === 'first',
}, 6);

const pathDifferences = paths.map(path => {
  const cells = path.slice(1).flatMap((to, index) => [
    ...crossedCells(path[index], to),
    memoryCells[index],
  ]);
  return new NFA(differenceMachine, 'path differences', ...cells);
});

return [
  new Shape('6x6'),
  new Or(pathDifferences),
];

