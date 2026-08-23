// Title: Line Dancing Killer Sudoku
// Author: Chris Wideman
// Video: https://www.youtube.com/watch?v=04Q8Vhzo7_Y
// Source: https://app.crackingthecryptic.com/sudoku/L48t6Ppbp3

// Standard sudoku rows/columns/boxes (default Shape regions).
// Cages: digits may repeat within a cage, so Sum (not Cage) is used.
// Blue lines: every cell holds an even digit, and digits do not repeat
// along that line (scoped to the line, not the whole grid) -- Given
// restricts the digit set, AllDifferent enforces the no-repeat.
// Red lines: every cell holds an odd digit and the line reads as a
// palindrome.
// "Lines of the same length have the same sum": the four blue lines are
// all length 4, so they share one common sum (EqualSum). The three
// length-3 red lines share a separate common sum. The length-5 red line
// is the only line of its length, so the rule adds nothing further to it.

const blueLines = [
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
];

const redLines = [
  ['R6C2', 'R7C3', 'R8C4'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R6C8', 'R7C7', 'R8C6'],
  ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'],
];

const cages = [
  [['R1C4', 'R1C5', 'R1C6'], 11],
  [['R1C8', 'R2C9', 'R1C9'], 17],
  [['R2C4', 'R3C4', 'R4C4', 'R4C3', 'R4C2'], 35],
  [['R2C7', 'R2C8', 'R3C8', 'R3C7'], 20],
  [['R4C1', 'R5C1', 'R6C1'], 19],
  [['R4C5', 'R4C6', 'R5C6', 'R5C5'], 23],
  [['R4C7', 'R5C7', 'R6C7'], 7],
  [['R6C5', 'R6C4', 'R6C3', 'R7C3', 'R8C3', 'R8C2', 'R8C1'], 20],
  [['R7C4', 'R7C5', 'R7C6'], 23],
  [['R9C6', 'R8C6', 'R8C7', 'R7C7', 'R7C8', 'R6C8', 'R6C9'], 35],
];

return [
  new Shape('9x9'),

  ...cages.map(([cells, total]) => new Sum(total, ...cells)),

  // Blue: even digits, no repeats along each line.
  ...blueLines.flatMap((cells) => cells.map((c) => new Given(c, 2, 4, 6, 8))),
  ...blueLines.map((cells) => new AllDifferent(...cells)),
  new EqualSum(...blueLines),

  // Red: odd digits, palindrome along each line.
  ...redLines.flatMap((cells) => cells.map((c) => new Given(c, 1, 3, 5, 7, 9))),
  ...redLines.map((cells) => new Palindrome(...cells)),
  new EqualSum(...redLines.slice(0, 3)),
];
