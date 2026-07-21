// Title: Entwined
// Author: Alaric Taqi A. (Crusader175)
// Video: https://www.youtube.com/watch?v=8dR8hctBTd0
// Source: https://sudokupad.app/97hj3g41ka

// Normal Sudoku. Each line is entropic and, from its diamond, an Index Line:
// if position N contains P, position P contains N. Digits around each brown
// diamond may repeat and sum to its displayed total.

const lines = [
  [
    'R3C1', 'R3C2', 'R3C3', 'R2C4', 'R2C5',
    'R2C6', 'R1C7', 'R1C8', 'R1C9',
  ],
  [
    'R6C1', 'R6C2', 'R6C3', 'R5C4', 'R5C5',
    'R5C6', 'R4C7', 'R4C8', 'R4C9',
  ],
  [
    'R9C1', 'R9C2', 'R9C3', 'R8C4', 'R8C5',
    'R8C6', 'R7C7', 'R7C8', 'R7C9',
  ],
];

// AllDifferent makes each line a permutation of 1-9. For every pair of
// positions i and j, the binary relation enforces (value_i = j) iff
// (value_j = i), so the permutation is its own inverse.
const indexConstraints = lines.flatMap(cells => [
  new AllDifferent(...cells),
  ...Array.from({length: 9}, (_, i) =>
    Array.from({length: 8 - i}, (_, offset) => {
      const j = i + offset + 1;
      const key = Pair.fnToKey(
        (a, b) => (a === j + 1) === (b === i + 1),
        9,
      );
      return new Pair(key, 'Index Line', cells[i], cells[j]);
    })
  ).flat(),
]);

const sumDots = [
  new Sum(22, 'R1C2', 'R1C3', 'R2C2', 'R2C3'),
  new Sum(20, 'R3C6', 'R3C7', 'R4C6', 'R4C7'),
  new Sum(22, 'R6C3', 'R6C4', 'R7C3', 'R7C4'),
  new Sum(20, 'R8C7', 'R8C8', 'R9C7', 'R9C8'),
];

return [
  new Shape('9x9'),
  ...lines.map(cells => new Entropic(...cells)),
  ...indexConstraints,
  ...sumDots,
];
