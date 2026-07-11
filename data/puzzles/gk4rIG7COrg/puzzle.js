// Title: Goalie
// Author: Daniel Hanson
// Video: https://www.youtube.com/watch?v=gk4rIG7COrg
// Source: https://sudokupad.app/4pd5gy143h

// Normal sudoku. Antiknight. Black/white Kropki dots (not all given).
// Grey line is a palindrome. Green line: adjacent digits differ by >= 5.
// Grey circle cell must hold an odd digit.
return [
  new Shape('9x9'),

  new Given('R9C1', 1),

  new AntiKnight(),

  new BlackDot('R8C3', 'R8C4'),
  new WhiteDot('R9C7', 'R9C8'),

  new Palindrome(
    'R7C5', 'R7C6', 'R8C7', 'R7C8', 'R6C7', 'R5C6', 'R4C6', 'R4C5', 'R3C4', 'R2C4'
  ),

  new Whisper(
    5,
    'R6C6', 'R5C7', 'R4C7', 'R3C7', 'R2C6', 'R2C5', 'R1C5', 'R1C4', 'R2C4',
    'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R5C2', 'R6C1', 'R7C1', 'R7C2', 'R8C1',
    'R8C2', 'R7C3', 'R6C3', 'R6C4', 'R7C5', 'R8C4', 'R8C5', 'R9C5', 'R8C6', 'R8C7'
  ),

  new Given('R8C6', 1, 3, 5, 7, 9),
];
