// Title: April 11, 2022: The Vault
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=wwwmflDjNxE
// Source: https://tinyurl.com/nfvhdnpz

// Normal sudoku rules, plus: digits along a line must have values strictly
// between the values in the circles on the ends of that line.

const givens = [
  ['R1C9', 3], ['R2C2', 4], ['R2C8', 2], ['R3C3', 5], ['R3C7', 1],
  ['R4C4', 4], ['R5C5', 5], ['R6C6', 6], ['R7C3', 9], ['R7C7', 5],
  ['R8C2', 8], ['R8C8', 6], ['R9C1', 7],
];

// Every between line, endpoint cells first/last (source: betweenline arrays).
const betweenLines = [
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R7C7', 'R7C6', 'R7C5', 'R7C4', 'R7C3'],
  ['R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R6C6', 'R5C6', 'R4C6'],
  ['R4C6', 'R4C5', 'R4C4'],
  ['R9C1', 'R8C2', 'R7C3'],
  ['R1C1', 'R2C2', 'R3C3'],
  ['R3C7', 'R2C8', 'R1C9'],
  ['R7C7', 'R8C8', 'R9C9'],
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R4C1', 'R4C2', 'R4C3', 'R4C4'],
  ['R9C1', 'R8C1', 'R7C1', 'R6C1'],
  ['R6C1', 'R6C2', 'R6C3', 'R6C4'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9'],
  ['R9C9', 'R8C9', 'R7C9', 'R6C9'],
  ['R6C9', 'R6C8', 'R6C7', 'R6C6'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'],
  ['R4C6', 'R4C7', 'R4C8', 'R4C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...betweenLines.map(cells => new Between(...cells)),
];
