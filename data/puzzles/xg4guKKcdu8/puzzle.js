// Title: Queens Gambit
// Author: Morphy
// Video: https://www.youtube.com/watch?v=xg4guKKcdu8
// Source: https://sudokupad.app/cp2phyir8p

// A 1 and a 9 may not occur on the same chess-queen line with no intervening
// even digit. The state records the most recently seen unblocked royal; an even
// digit (a pawn) clears the line of sight.
const sightMachine = NFA.encodeSpec({
  startState: 'clear',
  transition: (state, value) => {
    if (value % 2 === 0) return 'clear';
    if (value !== 1 && value !== 9) return state;
    if (state !== 'clear' && state !== value) return undefined;
    return value;
  },
  accept: () => true,
}, 9);

const graph = cellGraph('9x9');
const diagonalStarts = (edgeColumn) => [
  ...Array.from({ length: 9 }, (_, col) => makeCellId(1, col + 1)),
  ...Array.from({ length: 8 }, (_, row) => makeCellId(row + 2, edgeColumn)),
];
const diagonals = [
  ...diagonalStarts(1).map((cell) => graph.ray(cell, 1, 1)),
  ...diagonalStarts(9).map((cell) => graph.ray(cell, 1, -1)),
].filter((cells) => cells.length >= 2);
const queenLines = [...graph.rows(), ...graph.columns(), ...diagonals];

const cages = [
  [15, ['R5C4', 'R5C5']],
  [15, ['R4C8', 'R5C8']],
  [11, ['R2C8', 'R2C9']],
  [14, ['R2C2', 'R2C3']],
  [5, ['R5C2', 'R6C2']],
  [5, ['R8C8', 'R9C8']],
  [7, ['R8C2', 'R8C3']],
  [8, ['R2C4', 'R2C5']],
  [17, ['R7C1', 'R8C1']],
  [15, ['R8C7', 'R9C7']],
  [15, ['R5C6', 'R6C6']],
  [13, ['R1C4', 'R1C5']],
  [13, ['R5C3', 'R6C3']],
  [13, ['R3C8', 'R3C9']],
  [13, ['R3C1', 'R3C2']],
  [10, ['R7C4', 'R8C4']],
  [18, ['R7C5', 'R8C5', 'R9C5']],
  [6, ['R7C2', 'R7C3']],
];

return [
  new Shape('9x9'),
  new Given('R5C8', 1, 3, 5, 7, 9), // Grey circle: odd.
  new Given('R9C4', 2, 4, 6, 8),    // Grey square: even.
  ...cages.map(([total, cells]) => new Cage(total, ...cells)),
  ...queenLines.map((cells) => new NFA(sightMachine, 'blocked royal sight', ...cells)),
];
