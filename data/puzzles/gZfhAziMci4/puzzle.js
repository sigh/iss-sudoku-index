// Title: pH Anti-Knight Killer Sudoku
// Author: Akash Jain
// Video: https://www.youtube.com/watch?v=gZfhAziMci4
// Source: https://app.crackingthecryptic.com/webapp/7TbrLjNJq4

const givens = [
  new Given('R4C2', 9),
];

// Killer cages: no digit repeats within a cage, and the value sums the cage.
const cages = [
  new Cage(31, 'R2C2', 'R2C3', 'R3C3', 'R4C1', 'R4C2', 'R4C3', 'R5C3'),
  new Cage(10, 'R5C1', 'R5C2', 'R6C2'),
  new Cage(32, 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R8C2', 'R8C4', 'R9C4'),
  new Cage(6, 'R8C5', 'R8C6', 'R9C5'),
  new Cage(29, 'R1C6', 'R2C6', 'R2C8', 'R3C5', 'R3C6', 'R3C7', 'R3C8'),
  new Cage(12, 'R1C5', 'R2C4', 'R2C5'),
  // No total drawn; still a real cage, so digits within it may not repeat.
  new Cage(0, 'R4C8', 'R5C8', 'R5C9'),
  new Cage(38, 'R5C7', 'R6C7', 'R6C8', 'R6C9', 'R7C7', 'R8C7', 'R8C8'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  new AntiKnight(),
  // "<" chevron on the R2C5|R2C6 border, point in R2C5: R2C5 is the smaller.
  new GreaterThan('R2C6', 'R2C5'),
];
