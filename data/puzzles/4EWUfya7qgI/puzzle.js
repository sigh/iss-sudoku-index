// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=4EWUfya7qgI
// Source: https://cracking-the-cryptic.web.app/sudoku/brBjnpJgQH

// Normal sudoku rules apply (standard 3x3 boxes). metadata.rules is empty
// and the payload carries no other clue arrays (cages, lines, arrows,
// overlays), so the givens below are the whole puzzle.

// Givens: transcribed from the payload's cells[row][col].value.
const GIVENS = [
  ['R1C1', 3], ['R1C5', 7], ['R1C7', 2],
  ['R2C2', 2], ['R2C8', 5],
  ['R3C3', 8], ['R3C5', 2], ['R3C9', 1],
  ['R4C1', 4], ['R4C4', 6], ['R4C7', 1],
  ['R5C3', 7], ['R5C9', 4],
  ['R6C1', 9], ['R6C6', 2], ['R6C8', 8],
  ['R7C2', 4], ['R7C4', 9], ['R7C9', 6],
  ['R8C1', 7], ['R8C7', 3],
  ['R9C3', 1], ['R9C6', 3], ['R9C9', 8],
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
];
