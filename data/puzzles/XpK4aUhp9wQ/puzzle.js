// Title: Welcome to Secondary School
// Author: Flipsen
// Video: https://www.youtube.com/watch?v=XpK4aUhp9wQ
// Source: https://app.crackingthecryptic.com/H39GqQM78J

// Normal Sudoku and anti-knight apply. Each listed cage reads left-to-right as
// a prime; arrows sum their arms to their circles; white dots are consecutive;
// black dots have a 1:2 ratio; and the X sums to 10.
const twoDigitPrime = '(11|13|17|19|23|29|31|37|41|43|47|53|59|61|67|71|73|79|83|89|97)';
const primeCages = [
  ['R8C1', 'R8C2'], ['R8C3', 'R8C4'], ['R8C6', 'R8C7'], ['R8C8', 'R8C9'],
  ['R4C5', 'R4C6'], ['R5C7', 'R5C8'],
].map(cells => new Regex(twoDigitPrime, ...cells));

// The single-cell cage is a one-digit prime.
const singlePrimeCage = new Regex('(2|3|5|7)', 'R8C5');

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...primeCages,
  singlePrimeCage,
  new Arrow('R5C5', 'R6C5', 'R7C5'),
  new Arrow('R8C4', 'R8C5', 'R8C6'),
  new Arrow('R8C7', 'R7C8', 'R7C7'),
  new WhiteDot('R8C2', 'R8C3'),
  new WhiteDot('R8C7', 'R8C8'),
  new WhiteDot('R9C8', 'R9C9'),
  new BlackDot('R6C7', 'R7C7'),
  new BlackDot('R6C9', 'R7C9'),
  new BlackDot('R6C5', 'R7C5'),
  new BlackDot('R3C9', 'R4C9'),
  new BlackDot('R2C2', 'R3C2'),
  new X('R8C9', 'R9C9'),
];
