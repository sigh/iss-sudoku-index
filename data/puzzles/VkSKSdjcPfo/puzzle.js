// Title: Killer Hugs
// Author: Jessica (Subtitle) Shaham
// Video: https://www.youtube.com/watch?v=VkSKSdjcPfo
// Source: https://app.crackingthecryptic.com/sudoku/BgfQH6Hbg6

// Normal sudoku rules (default row/column/box all-different, standard 3x3
// boxes). Identical digits cannot appear within a knight's move of each
// other (AntiKnight). Cages cannot include repeat digits and show their
// sums (Cage enforces both). No givens.
//
// Cage cell lists are transcribed from the drawn cages (eleven three-cell
// "elbow" cages in a staircase "hug" pattern).

const cages = [
  [10, 'R2C2', 'R2C3', 'R3C2'],
  [8, 'R3C3', 'R3C4', 'R4C3'],
  [21, 'R4C4', 'R4C5', 'R5C4'],
  [16, 'R5C6', 'R6C5', 'R6C6'],
  [8, 'R6C7', 'R7C6', 'R7C7'],
  [9, 'R7C8', 'R8C7', 'R8C8'],
  [11, 'R1C7', 'R1C8', 'R2C7'],
  [12, 'R2C9', 'R3C8', 'R3C9'],
  [14, 'R7C1', 'R7C2', 'R8C1'],
  [17, 'R8C3', 'R9C2', 'R9C3'],
  [7, 'R8C5', 'R9C4', 'R9C5'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
