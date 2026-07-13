// Title: Double Entropy
// Author: Enchanter73
// Video: https://www.youtube.com/watch?v=W3hGY3SuOnI
// Source: https://sudokupad.app/edz9ll8csv

// 6x6 sudoku with 2x3 boxes, no givens. Global entropy: every 2x2 area has
// at least one digit from each of {1,2}, {3,4}, and {5,6} (encoded with
// per-band NFAs since GlobalEntropy is 9x9-only). Renban lines, and a little
// killer diagonal summing to 13.

const graph = cellGraph('6x6');

function hasAnyOf(values) {
  return NFA.encodeSpec({
    startState: false,
    transition: (seen, value) => seen || values.includes(value),
    accept: (seen) => seen,
  }, 6);
}

const entropySets = [
  { name: 'low', machine: hasAnyOf([1, 2]) },
  { name: 'middle', machine: hasAnyOf([3, 4]) },
  { name: 'high', machine: hasAnyOf([5, 6]) },
];

const entropyConstraints = [];
for (let row = 1; row <= 5; row++) {
  for (let col = 1; col <= 5; col++) {
    const square = [
      makeCellId(row, col),
      makeCellId(row, col + 1),
      makeCellId(row + 1, col),
      makeCellId(row + 1, col + 1),
    ];
    for (const entropySet of entropySets) {
      entropyConstraints.push(new NFA(entropySet.machine, entropySet.name, ...square));
    }
  }
}

return [
  new Shape('6x6'),
  new Renban('R1C2', 'R1C1', 'R2C1'),
  new Renban('R3C2', 'R4C2', 'R5C2', 'R6C2'),
  new Renban('R3C5', 'R4C5', 'R5C5', 'R6C5'),
  new Renban('R2C2', 'R2C3', 'R2C4'),
  new Renban('R6C3', 'R5C3', 'R5C4'),
  LittleKiller.fromCells(13, graph.ray('R3C1', 1, 1), cellGeometry('6x6')),
  ...entropyConstraints,
];
