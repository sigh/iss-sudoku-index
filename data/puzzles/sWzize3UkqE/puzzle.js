// Title: Candy Wrapper
// Author: HalfBakedLunatic (aka David Workman)
// Video: https://www.youtube.com/watch?v=sWzize3UkqE
// Source: https://sudokupad.app/wftydghvy6

// Standard Sudoku. Killer cages show their sums. Black dots mark 2:1 pairs;
// white dots mark consecutive pairs, and not all possible dots are shown.
// Purple lines are Renbans, red lines are palindromes, and digits on the blue
// main diagonal do not repeat.

const renbanLines = [
  ['R2C1', 'R2C2', 'R2C3', 'R3C4', 'R3C5', 'R3C6'],
  ['R9C8', 'R8C8', 'R7C8', 'R6C7', 'R5C7', 'R4C7'],
  ['R6C4', 'R7C3'],
];

const palindromeLines = [
  ['R6C3', 'R5C3', 'R4C3', 'R3C2', 'R2C2', 'R1C2'],
  ['R7C4', 'R7C5', 'R7C6', 'R8C7', 'R8C8', 'R8C9'],
  ['R3C7', 'R4C6'],
];

const blackDots = [
  ['R7C7', 'R8C7'],
  ['R7C7', 'R7C8'],
  ['R4C4', 'R5C4'],
];

const whiteDots = [
  ['R3C2', 'R3C3'],
  ['R2C3', 'R3C3'],
  ['R6C5', 'R6C6'],
  ['R8C9', 'R9C9'],
  ['R1C1', 'R1C2'],
];

return [
  new Shape('9x9'),

  new Cage(11, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(18, 'R8C1', 'R9C1', 'R9C2'),

  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...palindromeLines.map(cells => new Palindrome(...cells)),

  new AllDifferent(
    'R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5',
    'R6C6', 'R7C7', 'R8C8', 'R9C9',
  ),
];
