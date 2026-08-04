// Title: Pune
// Author: MavericksJD
// Video: https://www.youtube.com/watch?v=73aryDMy4Ik
// Source: https://app.crackingthecryptic.com/sudoku/2D4HpmQJRN

// Normal sudoku rules apply (default Shape('9x9') row/col/box all-different).
// Digits cannot repeat within a cage, and sum to the number shown: each Cage
// below. Cage cell lists are transcribed from the payload's drawn `cages`
// entries (the payload also carries three metadata-stub `cages` entries for
// title/author/rules text, which are not clues and are not encoded).
return [
  new Shape('9x9'),
  new Cage(23, 'R1C3', 'R2C2', 'R2C3', 'R2C4'),
  new Cage(12, 'R1C4', 'R1C5', 'R1C6', 'R2C5'),
  new Cage(16, 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9'),
  new Cage(13, 'R3C8', 'R4C8', 'R4C9'),
  new Cage(12, 'R6C9', 'R7C8', 'R7C9', 'R8C9'),
  new Cage(33, 'R8C7', 'R8C8', 'R9C6', 'R9C7', 'R9C8'),
  new Cage(33, 'R7C4', 'R7C5', 'R7C6', 'R8C4', 'R9C4'),
  new Cage(12, 'R5C4', 'R6C3', 'R6C4', 'R6C5'),
  new Cage(33, 'R3C6', 'R4C5', 'R4C6', 'R5C5', 'R5C6'),
  new Cage(12, 'R3C1', 'R4C1', 'R4C2', 'R5C1'),
  new Cage(26, 'R6C1', 'R7C1', 'R7C2', 'R8C2'),
  new Cage(14, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(9, 'R7C3', 'R8C3'),
];
