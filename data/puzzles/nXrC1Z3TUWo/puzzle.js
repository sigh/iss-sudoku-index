// Title: PalinPhisto
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=nXrC1Z3TUWo
// Source: https://sudokupad.app/1eo6o1zoq2

// Normal 9x9 Sudoku rules apply. Knight-move-separated cells differ, and the
// grey path is a palindrome. The givens and the path below are transcribed from
// the puzzle grid.
return [
  new Shape('9x9'),
  new Given('R2C8', 7),
  new Given('R3C2', 4),
  new Given('R3C4', 6),
  new Given('R3C6', 2),
  new Given('R7C3', 8),
  new Given('R7C4', 9),
  new Given('R8C5', 3),
  new Given('R9C2', 1),
  new AntiKnight(),
  new Palindrome(
    'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7',
    'R7C6', 'R7C5', 'R7C4', 'R7C3', 'R6C3', 'R5C3', 'R4C3'
  ),
];
