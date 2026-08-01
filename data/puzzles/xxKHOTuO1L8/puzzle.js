// Title: Chuy the "Frisbee Detective"
// Author: Sandra & Nala
// Video: https://www.youtube.com/watch?v=xxKHOTuO1L8
// Source: https://sudokupad.app/sandra-and-nala/chuy-the-frisbee-detective

// Normal 9x9 Sudoku. The pink palindrome and every drawn Kropki dot are encoded.
// Omitted: the connected light-blue palindrome has no recoverable ordered traversal,
// and the arrow rule does not identify each arrow's source cell in the local payload.
// The following cells are transcribed from the pink line and dot marks in the drawing.
return [
  new Shape('9x9'),
  new Palindrome('R6C7', 'R6C8', 'R7C7', 'R8C7', 'R9C8'),
  new WhiteDot('R3C2', 'R3C3'),
  new WhiteDot('R5C9', 'R6C9'),
  new WhiteDot('R7C3', 'R7C4'),
  new BlackDot('R1C1', 'R2C1'),
  new BlackDot('R2C1', 'R2C2'),
  new BlackDot('R3C7', 'R4C7'),
  new BlackDot('R8C7', 'R9C7'),
];
