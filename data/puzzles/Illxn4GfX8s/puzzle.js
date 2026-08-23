// Title: Unlucky for Some
// Author: Farkov
// Video: https://www.youtube.com/watch?v=Illxn4GfX8s
// Source: https://app.crackingthecryptic.com/sudoku/m2F9RPPr6R

// Normal sudoku rules apply. Cages show their sums (no repeats within a
// cage). Orthogonally neighbouring cells cannot contain consecutive digits
// (AntiConsecutive applies this to every orthogonal pair on the grid).

// Cage cell lists transcribed from the source's cage geometry.
return [
  new Shape('9x9'),
  new AntiConsecutive(),

  new Cage(13, 'R1C6', 'R1C7', 'R1C8', 'R1C9'),
  new Cage(13, 'R1C2', 'R1C3', 'R2C2', 'R2C3'),
  new Cage(13, 'R2C7', 'R3C7'),
  new Cage(13, 'R4C2', 'R5C2'),
  new Cage(13, 'R5C6', 'R5C7', 'R5C8', 'R5C9'),
  new Cage(13, 'R7C2', 'R8C2', 'R9C2'),
  new Cage(13, 'R8C3', 'R8C4'),
  new Cage(13, 'R9C7', 'R9C8', 'R9C9'),
];
