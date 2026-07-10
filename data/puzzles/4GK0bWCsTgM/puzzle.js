// Title: Coupled Cages
// Author: Blabarskaka
// Video: https://www.youtube.com/watch?v=4GK0bWCsTgM
// Source: https://sudokupad.app/72xo00v9n2

// Normal sudoku rules, anti-knight, killer cages, and one black 3:1 dot.
const tripleRatioKey = Pair.fnToKey((a, b) => a === 3 * b || b === 3 * a, 9);

return [
  new AntiKnight(),

  new Cage(6, 'R1C5', 'R1C6', 'R2C6'),
  new Cage(24, 'R2C4', 'R3C4', 'R3C5'),
  new Cage(7, 'R4C5', 'R4C6', 'R5C6'),
  new Cage(23, 'R5C4', 'R6C4', 'R6C5'),
  new Cage(22, 'R5C1', 'R5C2', 'R6C2'),
  new Cage(10, 'R2C1', 'R3C1'),
  new Cage(10, 'R1C9', 'R2C9'),

  new Pair(tripleRatioKey, '3:1', 'R1C1', 'R2C1'),
];
