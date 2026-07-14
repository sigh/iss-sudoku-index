// Title: House of Cards
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=PRavHFxxZ7Y
// Source: https://sudokupad.app/nam4l5oykp

// Normal 6x6 sudoku (rows, columns, 2x3 boxes come from the default Shape).
// The four unmarked cages all share the same total, and digits may repeat
// within a cage, so they are tied together with EqualSum rather than a
// killer Cage.
//
// Digits joined by the gold dot may not be consecutive.

const notConsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 6);

return [
  new Shape('6x6'),

  new EqualSum(
    ['R1C2', 'R1C3', 'R2C2'],
    ['R2C3', 'R2C4', 'R2C5'],
    ['R2C6', 'R3C6', 'R4C6'],
    ['R4C2', 'R4C3', 'R5C2', 'R5C3'],
  ),

  new Pair(notConsecutive, 'not consecutive', 'R3C1', 'R3C2'),
];
