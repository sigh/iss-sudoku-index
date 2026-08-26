// Title: June 8, 2022: Susurration
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=CanpWWhvjgk
// Source: https://tinyurl.com/42s93vmr

// Normal sudoku rules (default rows/cols/boxes). One given digit. Adjacent
// cells along each green line differ by at least 5.

const givens = [
  ['R4C2', 3],
];

// Green line cell chains, walked in the order drawn on the grid.
const lineA = [
  'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R3C2', 'R4C2', 'R5C2',
  'R5C3', 'R5C4', 'R4C4', 'R4C5', 'R4C6', 'R5C6', 'R6C6', 'R6C5', 'R7C5',
  'R8C5', 'R8C6', 'R8C7', 'R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8',
];
const lineB = [
  'R3C6', 'R3C7', 'R4C7', 'R4C8', 'R3C8', 'R2C8', 'R2C9', 'R3C9', 'R4C9',
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new Whisper(5, ...lineA),
  new Whisper(5, ...lineB),
];
