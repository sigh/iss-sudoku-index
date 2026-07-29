// Title: UEFA EURO 2024 Opening Game
// Author: Arlo Lipof
// Video: https://www.youtube.com/watch?v=l_Fz2l9Ptog
// Source: https://app.crackingthecryptic.com/PMbj498TFt

// Normal Sudoku; the outlined 5 cage; orange arrows; distinct arrow circles;
// grey palindromes; and the marked positive white and black Kropki dots.
// The cage cells are from the drawn outlined cage.
const cage = new Cage(5, 'R1C8', 'R1C9');

// Each list starts with its drawn circle, followed by its arrow arm.
const arrows = [
  new Arrow('R1C1', 'R2C2', 'R3C2', 'R4C2'),
  new Arrow('R5C8', 'R4C9', 'R3C9', 'R2C9', 'R1C8'),
  new Arrow('R5C2', 'R6C2', 'R7C3', 'R8C4', 'R8C5'),
  new Arrow('R8C6', 'R7C6', 'R6C5', 'R5C5'),
  new Arrow('R4C5', 'R3C6', 'R4C7'),
];

const circleDigits = new AllDifferent('R1C1', 'R5C8', 'R5C2', 'R8C6', 'R4C5');

// The grey strokes run along these arrow-arm segments.
const palindromes = [
  new Palindrome('R6C2', 'R7C3', 'R8C4', 'R8C5'),
  new Palindrome('R7C6', 'R6C5', 'R5C5'),
  new Palindrome('R3C6', 'R4C7'),
];

// The drawn white-dot and black-dot adjacencies.
const whiteDots = [
  new WhiteDot('R2C8', 'R2C9'), new WhiteDot('R2C7', 'R3C7'),
  new WhiteDot('R3C8', 'R4C8'), new WhiteDot('R3C3', 'R4C3'),
  new WhiteDot('R4C3', 'R5C3'), new WhiteDot('R5C3', 'R5C4'),
  new WhiteDot('R7C4', 'R7C5'), new WhiteDot('R7C2', 'R8C2'),
  new WhiteDot('R4C6', 'R5C6'),
];
const blackDot = new BlackDot('R1C9', 'R2C9');

return [new Shape('9x9'), cage, ...arrows, circleDigits, ...palindromes, ...whiteDots, blackDot];
