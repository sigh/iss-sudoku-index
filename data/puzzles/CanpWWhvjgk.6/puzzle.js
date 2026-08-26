// Title: Odd-Even Star Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=CanpWWhvjgk
// Source: https://tinyurl.com/4znbsra9

// Standard Sudoku givens.
const givens = [
  ['R1C1', 3], ['R1C3', 6], ['R1C9', 9],
  ['R2C2', 4],
  ['R3C1', 2], ['R3C5', 5], ['R3C7', 7],
  ['R5C1', 8], ['R5C3', 5], ['R5C7', 1], ['R5C9', 4],
  ['R7C3', 3], ['R7C5', 9], ['R7C9', 8],
  ['R8C8', 6],
  ['R9C1', 1], ['R9C7', 4], ['R9C9', 3],
];

// Star cells, from the drawn text overlay.
const stars = [
  'R1C7', 'R2C4', 'R2C8', 'R3C3', 'R3C9', 'R4C2', 'R4C5', 'R5C4',
  'R5C6', 'R6C5', 'R6C8', 'R7C1', 'R7C7', 'R8C2', 'R8C6', 'R9C3',
];

// If a star holds an odd digit, every orthogonally adjacent cell must be
// even; if it holds an even digit, every adjacent cell must be odd. Since
// every digit is exactly one of odd/even, this reduces to: a star cell and
// each of its (up to four) orthogonal neighbours always have opposite
// parity. Encode one Pair per star/neighbour edge.
const graph = cellGraph('9x9');
const oppositeParity = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const starParityPairs = stars.flatMap(star => (
  [[0, 1], [0, -1], [1, 0], [-1, 0]]
    .map(([dr, dc]) => graph.step(star, dr, dc))
    .filter(Boolean)
    .map(neighbour => new Pair(oppositeParity, '', star, neighbour))
));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...starParityPairs,
];
