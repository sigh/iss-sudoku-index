// Title: Undeca Error
// Author: Chilly
// Video: https://www.youtube.com/watch?v=OhFv9NrM-uQ
// Source: https://app.crackingthecryptic.com/sudoku/9mmqp28FHg

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes). Identical digits cannot be a knight's move apart -> AntiKnight.
// Twelve drawn cages: digits cannot repeat within a cage and must sum to the
// printed total -> Cage(sum, ...cells), each total 11 per the drawn clue.
// Cage cell lists transcribed from the puzzle's drawn cage geometry.

const cages = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R3C2', 'R3C3', 'R3C4'],
  ['R4C2', 'R5C2', 'R5C1'],
  ['R4C3', 'R5C3', 'R5C4'],
  ['R6C3', 'R7C3', 'R7C2'],
  ['R6C2', 'R6C1', 'R7C1'],
  ['R9C1', 'R9C2'],
  ['R8C4', 'R9C4', 'R9C5'],
  ['R8C7', 'R8C8', 'R8C9'],
  ['R7C9', 'R6C9', 'R7C8'],
  ['R5C7', 'R5C6', 'R5C5'],
  ['R2C8', 'R2C9', 'R1C9'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages.map((cells) => new Cage(11, ...cells)),
];
