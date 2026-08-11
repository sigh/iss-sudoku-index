// Title: Entrop Thru the heart
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=xnxQ8u5lspw
// Source: https://tinyurl.com/2p9n4d3s

// Normal sudoku rules apply (default row/column/box all-different from
// Shape). No given digits.
//
// Cages: digits do not repeat in a cage and sum to the clue total (Cage).
// Orange line: every 3 consecutive cells along the line hold one of
// {1,2,3}, one of {4,5,6}, and one of {7,8,9} (Entropic). The payload's
// own line entry tags this drawn line `fromConstraint: "Entropic Line"`,
// confirming the native Entropic reading.

// Cages, one per drawn killer cage in the payload's `killercage` array.
const cages = [
  [5, 'R2C2', 'R2C3'],
  [10, 'R3C1', 'R3C2'],
  [12, 'R3C3', 'R3C4'],
  [7, 'R4C1', 'R4C2'],
  [11, 'R5C1', 'R5C2'],
  [17, 'R4C4', 'R4C5', 'R4C6', 'R5C5'],
  [12, 'R6C2', 'R6C3'],
  [13, 'R7C3', 'R7C4'],
  [17, 'R8C4', 'R8C5', 'R8C6', 'R9C5'],
  [5, 'R7C6', 'R7C7'],
  [11, 'R6C7', 'R6C8'],
  [9, 'R5C8', 'R5C9'],
  [7, 'R4C8', 'R4C9'],
  [8, 'R3C8', 'R3C9'],
  [9, 'R3C6', 'R3C7'],
  [7, 'R2C7', 'R2C8'],
];

// Orange entropic line, from the payload's `entropicline`/`line` arrays
// (single 20-cell drawn stroke).
const entropicLine = [
  'R3C6', 'R4C5', 'R3C4', 'R2C3', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C2',
  'R7C3', 'R8C4', 'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R4C9', 'R3C9',
  'R2C8', 'R2C7',
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new Entropic(...entropicLine),
];
