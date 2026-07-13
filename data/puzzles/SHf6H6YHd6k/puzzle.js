// Title: Nearly pi
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=SHf6H6YHd6k
// Source: https://sudokupad.app/5ry14x9azl

// Normal sudoku rules apply.
return [
  new Shape('9x9'),

  // Givens (spell out 3-1-4-2, the "Nearly pi" of the title).
  new Given('R3C6', 3),
  new Given('R4C7', 1),
  new Given('R5C8', 4),
  new Given('R6C9', 2),

  // Adjacent digits along an orange line have a difference of at least four.
  new Whisper(4, 'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3', 'R3C2', 'R3C1'),
  new Whisper(4, 'R2C3', 'R2C2'),
  new Whisper(4, 'R2C4', 'R3C4', 'R4C4', 'R5C4'),
  new Whisper(4, 'R7C6', 'R6C6', 'R6C7'),
  new Whisper(4, 'R7C7', 'R6C8', 'R7C9', 'R8C8', 'R9C7', 'R9C8', 'R9C9'),
  // This orange line is a closed loop (R6C6-R5C6-R4C6-R5C5-R6C4-R6C5-R6C6);
  // encode the drawn run plus its closing edge back to the start.
  new Whisper(4, 'R6C6', 'R5C6', 'R4C6', 'R5C5', 'R6C4', 'R6C5'),
  new Whisper(4, 'R6C5', 'R6C6'),

  // The gray lines are palindromes, reading the same from both directions.
  new Palindrome('R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'),
  new Palindrome('R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6'),

  // Cells separated by an X sum to ten. Not all possible Xs are necessarily
  // given, so only the drawn pairs are constrained (no negative implication
  // for unmarked adjacent cells).
  new Sum(10, 'R5C2', 'R5C3'),
  new Sum(10, 'R6C8', 'R7C8'),
  new Sum(10, 'R3C5', 'R4C5'),
  new Sum(10, 'R2C4', 'R3C4'),
  new Sum(10, 'R7C6', 'R7C7'),
];
