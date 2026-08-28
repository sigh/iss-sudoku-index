// Title: Oct. 14, 2021: Making Lemonade
// Author: Sham Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=B1GJadtsIRg
// Source: https://tinyurl.com/en5d3byw
//
// Normal sudoku rules. Digits around each yellow "lemon" shape sum to the
// two-digit total given in the two cells the shape surrounds (read
// left-to-right for a horizontal pair, top-to-bottom for a vertical pair).
// Digits may repeat on a lemon's own cells.
//
// The drawn shading marks 24 cells; they form exactly four lemons. Each
// lemon is a 2-cell domino (left unshaded -- its two digits are the
// tens/ones of the total) plus the 6 cells orthogonally adjacent to that
// domino (the shaded "peel", summed).

const lemons = [
  // Lemon 1: vertical domino R2C2(tens)/R3C2(ones).
  { ring: ['R1C2', 'R2C1', 'R2C3', 'R3C1', 'R3C3', 'R4C2'], tens: 'R2C2', ones: 'R3C2' },
  // Lemon 2: horizontal domino R2C7(tens)/R2C8(ones).
  { ring: ['R1C7', 'R1C8', 'R2C6', 'R2C9', 'R3C7', 'R3C8'], tens: 'R2C7', ones: 'R2C8' },
  // Lemon 3: vertical domino R7C8(tens)/R8C8(ones).
  { ring: ['R6C8', 'R7C7', 'R7C9', 'R8C7', 'R8C9', 'R9C8'], tens: 'R7C8', ones: 'R8C8' },
  // Lemon 4: horizontal domino R8C2(tens)/R8C3(ones).
  { ring: ['R7C2', 'R7C3', 'R8C1', 'R8C4', 'R9C2', 'R9C3'], tens: 'R8C2', ones: 'R8C3' },
];

// ring sum - 10*tens - ones = 0
const lemonSums = lemons.map(
  ({ ring, tens, ones }) => new Sum(0, ...ring, [tens, -10], [ones, -1])
);

const givens = [
  new Given('R1C2', 6), new Given('R1C8', 7),
  new Given('R2C1', 5), new Given('R2C3', 7), new Given('R2C5', 9),
  new Given('R2C7', 4), new Given('R2C9', 6),
  new Given('R3C2', 8), new Given('R3C6', 3), new Given('R3C8', 5),
  new Given('R4C3', 9), new Given('R4C5', 1),
  new Given('R5C2', 3), new Given('R5C4', 9), new Given('R5C6', 2), new Given('R5C8', 1),
  new Given('R6C5', 3), new Given('R6C7', 7),
  new Given('R7C2', 7), new Given('R7C4', 4), new Given('R7C8', 2),
  new Given('R8C1', 8), new Given('R8C3', 1), new Given('R8C5', 2), new Given('R8C7', 3), new Given('R8C9', 5),
  new Given('R9C2', 9), new Given('R9C8', 4),
];

return [
  new Shape('9x9'),
  ...givens,
  ...lemonSums,
];
