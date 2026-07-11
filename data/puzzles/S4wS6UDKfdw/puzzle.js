// Title: Shh..eep Jo-King
// Author: olima
// Video: https://www.youtube.com/watch?v=S4wS6UDKfdw
// Source: https://sudokupad.app/5yvmd3yk1m

// Normal Sudoku rules apply. Digits a king's move away must be different.
// Adjacent digits on a green line differ by at least 5 (Whisper, diff=5).
// Purple lines contain a set of distinct consecutive digits in any order
// (Renban); here every purple line has exactly 2 cells, so it just requires
// the pair to be consecutive.
// Black dots: one digit is double the other. White dots: consecutive
// digits. Not all dots are shown (positive-only clues, no negative
// constraint implied).
//
// Green lines are decoded as 7 separate hook/ring shaped polylines rather
// than one merged shape, even though two of them touch at the same cell.

return [
  new Shape('9x9'),

  new AntiKing(),

  // Green lines (Whisper, min difference 5)
  new Whisper(5, 'R4C6', 'R4C5', 'R4C4'),
  new Whisper(5, 'R4C7', 'R4C8', 'R5C9', 'R5C8'),
  new Whisper(5, 'R5C2', 'R5C1', 'R4C2', 'R4C3'),
  new Whisper(5, 'R8C2', 'R8C3', 'R7C3', 'R7C4', 'R6C4', 'R6C3', 'R7C3'),
  new Whisper(5, 'R8C2', 'R7C1', 'R6C1', 'R6C2', 'R7C3'),
  new Whisper(5, 'R8C7', 'R8C8', 'R7C9', 'R6C9', 'R6C8', 'R7C7', 'R8C7'),
  new Whisper(5, 'R7C7', 'R6C7', 'R6C6', 'R7C6', 'R7C7'),

  // Purple lines (Renban, 2 cells each -> consecutive pair)
  new Renban('R8C7', 'R9C7'),
  new Renban('R8C8', 'R9C8'),
  new Renban('R7C9', 'R8C9'),
  new Renban('R8C3', 'R9C3'),
  new Renban('R8C2', 'R9C2'),
  new Renban('R7C1', 'R8C1'),

  // White dots (consecutive)
  new WhiteDot('R4C6', 'R4C7'),
  new WhiteDot('R1C1', 'R2C1'),
  new WhiteDot('R1C9', 'R2C9'),
  new WhiteDot('R2C7', 'R2C8'),
  new WhiteDot('R2C2', 'R2C3'),

  // Black dots (double)
  new BlackDot('R4C3', 'R4C4'),
  new BlackDot('R1C5', 'R2C5'),
];
