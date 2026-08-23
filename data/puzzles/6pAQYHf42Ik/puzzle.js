// Title: Dutch Whispers
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=6pAQYHf42Ik
// Source: https://app.crackingthecryptic.com/sudoku/PMBb4hP3mm

// Normal sudoku (default row/col/box) plus:
// - AntiKing: cells a king's move apart cannot repeat.
// - Diagonal(1)/Diagonal(-1): both main diagonals (drawn in blue) cannot repeat.
// - Whisper(4): the single orange stroke (anti-diagonal, then top row, then
//   main diagonal, one continuous line per the source geometry) requires
//   every consecutive pair to differ by at least 4. R5C5 is revisited where
//   the two diagonal arms meet the top row; the cell list below follows the
//   drawn stroke order, so it contributes the same adjacency edges twice,
//   which is harmless.

const orangeLine = [
  'R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9',
  'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1',
  'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8', 'R9C9',
];

return [
  new Shape('9x9'),

  new Given('R7C1', 5),
  new Given('R7C2', 1),
  new Given('R7C3', 9),

  new AntiKing(),
  new Diagonal(1),
  new Diagonal(-1),

  new Whisper(4, ...orangeLine),
];
