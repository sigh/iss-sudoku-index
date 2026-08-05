// Title: 10/31/22: Descriptive Pairs
// Author: clover!
// Video: https://www.youtube.com/watch?v=esVk3NovHEE
// Source: https://tinyurl.com/yc6bfvzb

// Normal sudoku rules apply. For each outside X Y clue, the first cell is the
// Yth position from the clue and must be X, or the second is the Xth position
// and must be Y. The pairs below come from the drawn outside-clue text.
const descriptivePair = (x, y, first, second) => new Pair(
  Pair.fnToKey((a, b) => a === x || b === y, 9),
  `${x} ${y}`,
  first,
  second,
);

return [
  new Shape('9x9'),

  // Givens transcribed from the puzzle grid.
  new Given('R1C6', 5), new Given('R1C9', 1), new Given('R2C5', 6),
  new Given('R2C8', 2), new Given('R3C7', 3), new Given('R4C3', 1),
  new Given('R4C6', 4), new Given('R5C2', 2), new Given('R5C5', 5),
  new Given('R5C8', 4), new Given('R6C4', 6), new Given('R6C7', 2),
  new Given('R7C3', 7), new Given('R8C2', 8), new Given('R8C5', 9),
  new Given('R9C1', 9), new Given('R9C4', 8),

  descriptivePair(1, 2, 'R1C2', 'R1C1'),
  descriptivePair(2, 3, 'R2C3', 'R2C2'),
  descriptivePair(3, 4, 'R3C4', 'R3C3'),
  descriptivePair(1, 2, 'R9C2', 'R9C1'),
  descriptivePair(2, 3, 'R8C3', 'R8C2'),
  descriptivePair(3, 4, 'R7C4', 'R7C3'),
  descriptivePair(8, 9, 'R1C1', 'R1C2'),
  descriptivePair(7, 8, 'R2C2', 'R2C3'),
  descriptivePair(6, 7, 'R3C3', 'R3C4'),
  descriptivePair(3, 4, 'R7C6', 'R7C7'),
  descriptivePair(2, 3, 'R8C7', 'R8C8'),
  descriptivePair(1, 2, 'R9C8', 'R9C9'),
  descriptivePair(8, 9, 'R5C9', 'R5C8'),
  descriptivePair(6, 9, 'R5C1', 'R5C4'),
  descriptivePair(4, 8, 'R8C5', 'R4C5'),
  descriptivePair(4, 7, 'R3C5', 'R6C5'),
  descriptivePair(4, 9, 'R9C7', 'R4C7'),
  descriptivePair(4, 7, 'R3C3', 'R6C3'),
];
