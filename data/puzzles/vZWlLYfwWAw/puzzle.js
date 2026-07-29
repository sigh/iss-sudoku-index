// Title: Trace Amounts
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=vZWlLYfwWAw
// Source: https://sudokupad.app/j8w1vml1mn

// Normal 6x6 Sudoku with 2x3 boxes and the two displayed givens. The partially
// visible cages cannot be reconstructed from the committed drawing fragments,
// so their common-sum and no-repeat rule is omitted.
return [
  new Shape('6x6'),
  // The two displayed digit givens.
  new Given('R1C1', 4),
  new Given('R5C5', 6),
];
