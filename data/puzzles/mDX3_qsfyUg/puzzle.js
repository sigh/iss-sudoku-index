// Title: Digits Merry-Go-Round
// Author: Andreas Lubbe
// Video: https://www.youtube.com/watch?v=mDX3_qsfyUg
// Source: https://app.crackingthecryptic.com/sudoku/L7rG2F6JLM
//
// Normal sudoku rules ALMOST apply: rows and columns contain 1-9 once each.
// The 9 irregular regions below (drawn, `regions` in the payload) replace the
// usual 3x3 boxes -- there are no 3x3 boxes. Digits in a cage cannot repeat
// and must sum to the small clue in the cage's top-left cell. No givens.

const REGIONS = [
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9'],
  ['R2C4', 'R2C5', 'R2C6', 'R2C7', 'R3C7', 'R3C8', 'R4C8', 'R5C8', 'R6C8'],
  ['R3C4', 'R3C5', 'R3C6', 'R4C6', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7'],
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C9', 'R2C1', 'R2C2', 'R3C1', 'R4C1'],
  ['R3C2', 'R4C4', 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5', 'R6C6', 'R7C8'],
  ['R6C9', 'R7C9', 'R8C8', 'R8C9', 'R9C1', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R6C4', 'R7C4', 'R7C5', 'R7C6'],
  ['R4C2', 'R5C2', 'R6C2', 'R7C2', 'R7C3', 'R8C3', 'R8C4', 'R8C5', 'R8C6'],
  ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
];

// Cages: [sum, ...cells], transcribed from the drawn cage clues.
const CAGES = [
  [18, 'R1C1', 'R2C1', 'R2C2'],
  [14, 'R2C3', 'R2C4'],
  [9, 'R2C9', 'R3C8', 'R3C9'],
  [22, 'R4C7', 'R4C8', 'R5C8'],
  [8, 'R5C4', 'R5C5', 'R6C5'],
  [17, 'R7C1', 'R7C2', 'R8C1'],
  [10, 'R8C8', 'R9C8', 'R9C9'],
  [8, 'R9C6', 'R9C7'],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...REGIONS.map(cells => new Jigsaw('9x9', ...cells)),
  ...CAGES.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
