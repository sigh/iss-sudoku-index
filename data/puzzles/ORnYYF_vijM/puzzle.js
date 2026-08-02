// Title: Jousting Hurdles
// Author: Rangsk
// Video: https://www.youtube.com/watch?v=ORnYYF_vijM
// Source: https://sudokupad.app/sudoku/6ddFPmQgFn

// Normal 9x9 Sudoku; knight-separated cells differ. Purple lines are renbans,
// green lines are German whispers, and each arrow's first cell is its circle.
return [
  new Shape('9x9'),
  new AntiKnight(),
  new Renban('R5C3', 'R6C4', 'R7C5'),
  new Renban('R3C5', 'R4C6', 'R5C7'),
  new Whisper(5, 'R5C3', 'R4C4', 'R3C5'),
  new Whisper(5, 'R6C4', 'R5C5', 'R4C6'),
  new Whisper(5, 'R4C7', 'R3C7'),
  new Arrow('R5C5', 'R4C4', 'R3C4'),
  new Arrow('R6C6', 'R7C6', 'R8C6', 'R9C6'),
  new Arrow('R2C2', 'R3C1', 'R4C1', 'R5C1'),
  new Arrow('R4C9', 'R5C9', 'R5C8'),
  new Arrow('R8C1', 'R8C2', 'R9C2'),
  new Arrow('R2C5', 'R2C6', 'R1C5'),
];
