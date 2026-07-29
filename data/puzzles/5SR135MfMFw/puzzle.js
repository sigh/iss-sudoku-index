// Title: Joust odd
// Author: Pulsar
// Video: https://www.youtube.com/watch?v=5SR135MfMFw
// Source: https://app.crackingthecryptic.com/q19d8cr03p

// Normal Sudoku, anti-knight, odd circles, and numeric distinct cages are
// encoded. The 1X/2X cages are omitted because local rules do not settle X.
return [
  new Shape('9x9'), new AntiKnight(),
  ...['R2C2','R2C5','R3C4','R4C3','R4C6','R5C2','R5C5','R6C4','R6C7','R7C6','R8C8']
    .map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  new Cage(16, 'R4C4','R4C5','R5C4'), new Cage(14, 'R5C6','R6C5','R6C6'),
  new Cage(15, 'R6C7','R7C6','R7C7'), new Cage(22, 'R7C8','R7C9','R8C9'),
  new Cage(15, 'R9C7','R9C8','R9C9'), new Cage(12, 'R9C1','R9C2','R9C3'),
  new Cage(32, 'R8C5','R8C6','R9C4','R9C5','R9C6'),
];
