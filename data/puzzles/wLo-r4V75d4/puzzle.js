// Title: Royal Clone
// Author: Philipp Huber
// Video: https://www.youtube.com/watch?v=wLo-r4V75d4
// Source: https://cracking-the-cryptic.web.app/sudoku/HgNJLgBgmG

// The source states no rules, so only the drawn clues are encoded:
//   - normal Sudoku on the standard 3x3 boxes;
//   - two given digits;
//   - five cages, each summing to its printed total.
// Omitted: the light grey fill covering all 27 cells of box 1, box 5 and
// box 9. It is drawn, but nothing on the board says what it means, so it
// carries no constraint here.

const givens = [
  // From the two printed digits.
  new Given('R2C5', 4),
  new Given('R6C1', 8),
];

// From the five drawn cages and their printed totals. Each cage lies wholly
// inside one box, so Cage's uniqueness clause repeats that box's constraint.
const cages = [
  new Cage(17, 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'),
  new Cage(17, 'R4C5', 'R5C5', 'R6C5'),
  new Cage(6, 'R4C6', 'R5C6'),
  new Cage(13, 'R5C4', 'R6C4'),
  new Cage(35, 'R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
];
