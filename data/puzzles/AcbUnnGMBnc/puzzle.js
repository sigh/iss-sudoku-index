// Title: Killer Says
// Author: B29
// Video: https://www.youtube.com/watch?v=AcbUnnGMBnc
// Source: https://app.crackingthecryptic.com/sudoku/2pHbDJMt4Q

// Normal Sudoku rules apply. Each drawn cage has its shown sum, no repeated
// digit, and its two-digit label reads as [count][digit]. The shown X and V
// marks respectively sum to 10 and 5; unmarked adjacent pairs are unrestricted.
// Cage table transcribed from the drawn dashed cages and their printed totals.
const cages = [
  [12, '2', ['R1C1', 'R1C2', 'R1C3']],
  [15, '5', ['R1C5', 'R1C6', 'R1C7']],
  [11, '1', ['R2C6', 'R2C7', 'R2C8']],
  [18, '8', ['R3C3', 'R3C2', 'R2C3']],
  [11, '1', ['R2C4', 'R3C4', 'R4C4']],
  [16, '6', ['R3C6', 'R4C6', 'R5C6']],
  [15, '5', ['R4C7', 'R5C7', 'R6C7']],
  [16, '6', ['R8C8', 'R9C7', 'R9C9', 'R9C8']],
  [19, '9', ['R7C7', 'R7C6', 'R7C5']],
  [11, '1', ['R8C5', 'R9C5', 'R9C6']],
  [19, '9', ['R9C3', 'R9C2', 'R9C1']],
  [11, '1', ['R7C1', 'R7C2', 'R6C2']],
  [13, '3', ['R4C1', 'R5C1', 'R6C1']],
  [19, '9', ['R4C2', 'R4C3', 'R5C3', 'R6C3']],
  [19, '9', ['R5C5', 'R6C5', 'R6C6']],
  [17, '7', ['R5C4', 'R6C4', 'R7C4']],
];

const killerSays = cages.flatMap(([sum, digit, cells]) => [
  new Cage(sum, ...cells),
  // Every actual label begins with 1, so its final digit occurs once.
  new ContainExact(digit, ...cells),
]);

return [
  new Shape('9x9'),
  ...killerSays,
  new V('R1C3', 'R2C3'),
  new V('R5C7', 'R5C8'),
  new V('R7C9', 'R8C9'),
  new V('R6C1', 'R7C1'),
  new X('R3C3', 'R4C3'),
  new X('R5C5', 'R5C6'),
  new X('R8C6', 'R8C7'),
  new X('R8C2', 'R8C3'),
  new X('R5C9', 'R6C9'),
];
