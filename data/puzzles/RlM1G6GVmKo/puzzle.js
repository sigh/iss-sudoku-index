// Title: Rod of Eternal Coherence
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=RlM1G6GVmKo
// Source: https://sudokupad.app/5k5lcjymlk

// Killer-cage digits are distinct and sum to the displayed total.
const cages = [
  new Cage(12, 'R1C1', 'R1C2', 'R2C1', 'R3C1'),
  new Cage(8, 'R5C4', 'R5C5', 'R6C5'),
  new Cage(21, 'R7C2', 'R8C2', 'R8C3'),
  new Cage(12, 'R8C9', 'R9C7', 'R9C8', 'R9C9'),
];

const palindrome = new Palindrome(
  'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1',
);

// The green line is split across two drawing strokes in the source.
const greenWhisper = new Whisper(
  5, 'R6C7', 'R5C6', 'R4C5', 'R3C4',
);

// Each teal line has one digit from each residue class modulo 3.
const tealLines = [
  new Modular(3, 'R4C1', 'R4C2', 'R4C3'),
  new Modular(3, 'R7C6', 'R8C6', 'R9C6'),
  new Modular(3, 'R7C9', 'R7C8', 'R8C8'),
  new Modular(3, 'R1C3', 'R2C3', 'R2C2'),
];

// The six interior red-line digits sum to the two circled endpoint digits.
const redLineSum = new EqualSum(
  ['R1C6', 'R1C7', 'R1C8', 'R2C9', 'R3C9', 'R4C9'],
  ['R2C6', 'R4C8'],
);

return [
  new Shape('9x9'),
  ...cages,
  palindrome,
  greenWhisper,
  ...tealLines,
  redLineSum,
  new WhiteDot('R7C5', 'R8C5'),
  new BlackDot('R5C2', 'R5C3'),
];
