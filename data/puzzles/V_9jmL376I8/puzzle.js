// Title: Every Carpet Must Go
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=V_9jmL376I8
// Source: https://app.crackingthecryptic.com/sudoku/3G8rJj4JGR

// Normal Sudoku rules and the givens are encoded. The grey-carpet ordered-copy
// rule is omitted.
const given = [
  ['R2C8', 1], ['R3C7', 2], ['R4C1', 3], ['R4C4', 4], ['R6C4', 5],
  ['R6C6', 6], ['R8C1', 8], ['R9C2', 9], ['R9C6', 7],
];

return [
  new Shape('9x9'),
  ...given.map(([cell, value]) => new Given(cell, value)),
];
