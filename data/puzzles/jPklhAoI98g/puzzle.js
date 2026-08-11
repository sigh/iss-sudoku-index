// Title: Holiday Time
// Author: Fool on Hill
// Video: https://www.youtube.com/watch?v=jPklhAoI98g
// Source: https://app.crackingthecryptic.com/sudoku/39jphNn83b

// Normal sudoku rules (default 3x3 boxes). No given digits.
//
// Black dots: one digit is double the other. Cells a knight's move or a
// king's move apart must be different. Orthogonally adjacent cells cannot
// be consecutive.
//
// Not all black dots are given: only the drawn dots are encoded, with no
// negative inference for undotted pairs.

return [
  new Shape('9x9'),

  new AntiKnight(),
  new AntiKing(),
  new AntiConsecutive(),

  // Black (double) dots: drawn edge-centred rounded marks between two
  // orthogonally adjacent cells.
  new BlackDot('R1C2', 'R1C3'),
  new BlackDot('R3C3', 'R4C3'),
  new BlackDot('R4C3', 'R4C4'),
  new BlackDot('R5C2', 'R6C2'),
  new BlackDot('R9C1', 'R9C2'),
  new BlackDot('R8C3', 'R9C3'),
  new BlackDot('R8C7', 'R8C8'),
  new BlackDot('R5C6', 'R5C7'),
  new BlackDot('R1C7', 'R2C7'),
  new BlackDot('R3C8', 'R3C9'),
  new BlackDot('R7C9', 'R8C9'),
];
