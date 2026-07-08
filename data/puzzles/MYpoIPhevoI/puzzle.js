// Title: Dutch Flat Mates: Multiple Lines
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=MYpoIPhevoI
// Source: https://sudokupad.app/191t7peym8

// Rules:
// Normal sudoku rules apply.
// Every 5 must have a 1 directly above it or a 9 directly below it.
// Adjacent digits along a colored line are multiples: one divides the other.

const multipleKey = Pair.fnToKey((a, b) => a % b === 0 || b % a === 0, 9);
const multipleLines = [
  ['R1C7', 'R1C8', 'R2C8', 'R1C7'],
  ['R8C2', 'R9C3', 'R9C2', 'R8C2'],
  ['R2C4', 'R2C5'],
  ['R3C5', 'R3C6'],
  ['R7C4', 'R7C5'],
  ['R8C5', 'R8C6'],
  ['R5C3', 'R4C3', 'R3C4', 'R4C5', 'R5C6'],
  ['R5C4', 'R6C5', 'R7C6', 'R6C7', 'R5C7'],
  ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1'],
  ['R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9'],
];

return [
  new Given('R5C5', 8),
  new DutchFlatmates(),
  ...multipleLines.map(cells => new Pair(multipleKey, 'multiples', ...cells)),
];
