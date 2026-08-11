// Title: Fifteen/Love
// Author: starwarigami
// Video: https://www.youtube.com/watch?v=WJcSqNvwjms
// Source: https://app.crackingthecryptic.com/sudoku/mHBPJmM8fB

// Normal sudoku rules apply (standard 9x9 grid, standard 3x3 boxes -- the
// payload's regions array matches the default boxes exactly). In cages,
// digits must sum to the small clue in the top left corner of the cage;
// digits cannot repeat within a cage. Cage(sum, ...cells) enforces both the
// sum and the all-different requirement in one constraint. No givens.

// Cage cell lists, transcribed from the drawn cage geometry (all totals 15).
const cageCells = [
  ['R1C1', 'R2C1'],
  ['R3C1', 'R4C1'],
  ['R1C2', 'R2C2', 'R3C2', 'R1C3'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R2C6', 'R2C7', 'R3C7'],
  ['R3C8', 'R3C9'],
  ['R2C3', 'R3C3', 'R3C4', 'R4C4'],
  ['R4C2', 'R4C3'],
  ['R6C1', 'R5C1', 'R5C2', 'R5C3'],
  ['R6C2', 'R6C3', 'R7C3', 'R8C3'],
  ['R7C2', 'R8C2'],
  ['R9C3', 'R9C4', 'R9C5'],
  ['R8C6', 'R8C7', 'R8C8'],
  ['R6C5', 'R7C5', 'R7C6', 'R7C7'],
  ['R6C7', 'R5C7'],
  ['R5C8', 'R6C8', 'R7C8'],
  ['R3C5', 'R4C5', 'R4C6', 'R4C7'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'],
];

return [
  new Shape('9x9'),
  ...cageCells.map(cells => new Cage(15, ...cells)),
];
