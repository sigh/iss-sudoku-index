// Title: Pinch Yourself
// Author: Memeristor
// Video: https://www.youtube.com/watch?v=quDNUtQvPpw
// Source: https://app.crackingthecryptic.com/sudoku/h92qrddJMN

// Normal sudoku rules apply. In cages, digits must sum to the small clue in
// the top left corner of the cage (if given). Digits cannot repeat within a
// cage: Cage() bakes in both the sum and all-different.
//
// The video description's NOTE states the cage drawn in box 9 (R7C8, R8C8,
// R9C8, R8C9, R8C7) is "purely decorative and does not affect the solve" --
// it has no printed total and is omitted entirely, not even as an
// all-different group.

const givens = [
  new Given('R1C1', 9),
  new Given('R4C4', 2),
  new Given('R9C9', 9),
];

const cages = [
  new Cage(26, 'R1C2', 'R2C2', 'R3C2', 'R2C1', 'R2C3'),
  new Cage(16, 'R2C4', 'R3C4', 'R3C5', 'R2C5'),
  new Cage(19, 'R4C7', 'R5C7', 'R5C8', 'R4C8'),
  new Cage(10, 'R4C5', 'R5C5', 'R5C4'),
  new Cage(28, 'R1C8', 'R2C8', 'R2C9', 'R1C9'),
  new Cage(10, 'R3C8', 'R3C9', 'R4C9'),
  new Cage(17, 'R7C4', 'R8C4', 'R8C5', 'R7C5'),
  new Cage(27, 'R8C1', 'R9C1', 'R9C2', 'R8C2'),
  new Cage(15, 'R5C1', 'R6C1', 'R6C2'),
  new Cage(18, 'R4C2', 'R5C2', 'R5C3', 'R4C3'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
];
