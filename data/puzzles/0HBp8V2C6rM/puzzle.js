// Title: Lion
// Author: Qodec
// Video: https://www.youtube.com/watch?v=0HBp8V2C6rM
// Source: https://app.crackingthecryptic.com/sudoku/dbhMgB9dmT

// Normal Sudoku rules apply. Digits in a cage sum to the small clue in its
// top-left corner and cannot repeat within the cage. Cells a chess king's
// move apart cannot contain equal digits.

// Cages: [total, ...cells], transcribed from the puzzle's drawn cage geometry.
const cages = [
  [6, 'R1C3', 'R2C3', 'R2C4'],
  [7, 'R1C7', 'R2C7', 'R2C6'],
  [24, 'R3C1', 'R3C2', 'R4C2'],
  [23, 'R3C9', 'R3C8', 'R4C8'],
  [23, 'R5C8', 'R6C8', 'R6C9', 'R7C9'],
  [15, 'R5C2', 'R6C2', 'R6C1', 'R7C1'],
  [10, 'R8C4', 'R8C3', 'R9C3'],
  [14, 'R8C6', 'R8C7', 'R9C7'],
  [21, 'R9C4', 'R9C5', 'R9C6'],
].map(([total, ...cells]) => new Cage(total, ...cells));

return [
  new Shape('9x9'),
  new AntiKing(),
  ...cages,
];
