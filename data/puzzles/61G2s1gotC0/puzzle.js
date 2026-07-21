// Title: Sudocube
// Author: BlueBirdBrokenLeg
// Video: https://www.youtube.com/watch?v=61G2s1gotC0
// Source: https://sudokupad.app/twavox6vat

// Coloured squares reproduce six familiar constraint types on cube faces.
const sums = [
  new Sum(8, 'R3C3', 'R3C4', 'R4C3', 'R4C4'),
  new Sum(28, 'R7C7', 'R7C8', 'R8C7', 'R8C8'),
];

// Repeating the first cell closes each whisper around all four square edges.
const whispers = [
  new Whisper(5, 'R3C5', 'R3C6', 'R4C6', 'R4C5', 'R3C5'),
  new Whisper(5, 'R7C5', 'R7C6', 'R8C6', 'R8C5', 'R7C5'),
];

const quadruples = [
  new Quad('R3C7', 4, 8, 9),
  new Quad('R5C3', 3, 7, 8, 9),
];

const renban = new Renban(
  'R5C5', 'R5C6', 'R5C7', 'R5C8',
  'R6C5', 'R6C6', 'R6C7', 'R6C8',
);

const palindromes = [
  new Palindrome('R7C3', 'R8C4'),
  new Palindrome('R7C4', 'R8C3'),
];

const whiteDots = [
  new WhiteDot('R1C2', 'R2C2'),
  new WhiteDot('R1C2', 'R1C3'),
  new WhiteDot('R1C8', 'R1C9'),
  new WhiteDot('R1C9', 'R2C9'),
  new WhiteDot('R8C1', 'R9C1'),
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  ...sums,
  ...whispers,
  ...quadruples,
  renban,
  ...palindromes,
  ...whiteDots,
];
