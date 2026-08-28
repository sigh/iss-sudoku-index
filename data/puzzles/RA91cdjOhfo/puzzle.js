// Title: Tau Day King Sudoku
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=RA91cdjOhfo
// Source: https://cracking-the-cryptic.web.app/sudoku/qN2tTDBBLT
//
// Normal sudoku rules apply, and identical digits cannot touch diagonally.
// Diagonal-adjacency non-repeat coincides here with a full king's-move
// non-repeat (orthogonal neighbours already can't repeat under normal
// row/column sudoku), so this is ISS's native AntiKing. No lines, cages,
// arrows or other drawn geometry -- givens only.

// Givens -- transcribed from the source's drawn digits.
const givens = [
  new Given('R1C4', 6),
  new Given('R1C5', 2),
  new Given('R1C6', 8),
  new Given('R2C3', 9),
  new Given('R2C7', 3),
  new Given('R3C2', 6),
  new Given('R3C8', 1),
  new Given('R4C1', 7),
  new Given('R4C9', 8),
  new Given('R5C1', 4),
  new Given('R5C9', 5),
  new Given('R6C1', 6),
  new Given('R6C9', 3),
  new Given('R7C2', 8),
  new Given('R7C8', 9),
  new Given('R8C3', 5),
  new Given('R8C7', 7),
  new Given('R9C4', 9),
  new Given('R9C5', 7),
  new Given('R9C6', 1),
];

return [
  new Shape('9x9'),
  ...givens,
  new AntiKing(),
];
