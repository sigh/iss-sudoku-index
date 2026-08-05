// Title: Autobots Roll Out
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=y5eROx2iNZI
// Source: https://tinyurl.com/yc2w9evt

// Normal Sudoku rules apply. Each grey line reads identically when rolled out
// in the direction of its adjacent light-blue arrow.
const givens = [
  ['R1C3', 3], ['R1C4', 4], ['R1C5', 1], ['R1C6', 7], ['R1C7', 6],
  ['R3C1', 7], ['R3C9', 3], ['R4C1', 6], ['R4C5', 7], ['R4C6', 4], ['R4C9', 9],
  ['R5C1', 5], ['R5C4', 9], ['R5C6', 3], ['R5C9', 4], ['R6C1', 4], ['R6C4', 8],
  ['R6C5', 5], ['R6C9', 7], ['R7C1', 3], ['R7C9', 1], ['R9C3', 6], ['R9C4', 7],
  ['R9C5', 8], ['R9C6', 9], ['R9C7', 3],
];

// Drawn grey paths paired position-by-position with the rows/columns their arrows indicate.
const rollouts = [
  [
    ['R1C1', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3', 'R1C3', 'R1C2', 'R2C2'],
    ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ],
  [
    ['R1C9', 'R1C8', 'R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9', 'R2C8'],
    ['R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1'],
  ],
  [
    ['R9C9', 'R8C9', 'R7C9', 'R7C8', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R8C8'],
    ['R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9'],
  ],
  [
    ['R9C1', 'R9C2', 'R9C3', 'R8C3', 'R7C3', 'R7C2', 'R7C1', 'R8C1', 'R8C2'],
    ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...rollouts.flatMap(([line, target]) => line.map((cell, index) => new SameValues(2, cell, target[index]))),
];
