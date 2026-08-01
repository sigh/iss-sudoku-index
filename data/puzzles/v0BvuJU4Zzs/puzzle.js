// Title: Where Is The 8th?
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=v0BvuJU4Zzs
// Source: https://sudokupad.app/DtnH4LnTPM

// Standard 9x9 Sudoku, the five drawn givens, anti-knight, and the seven
// drawn arrows (circle first, then the shaft cells).
// Arrow paths are transcribed from the seven circle-and-arrow primitives.
return [
  new Shape('9x9'),
  new Given('R2C4', 8),
  new Given('R4C8', 9),
  new Given('R4C9', 4),
  new Given('R7C5', 3),
  new Given('R7C6', 6),
  new AntiKnight(),
  new Arrow('R1C1', 'R2C2', 'R3C2', 'R3C3'),
  new Arrow('R7C2', 'R6C1', 'R5C1', 'R4C1'),
  new Arrow('R2C3', 'R1C4', 'R1C5', 'R1C6'),
  new Arrow('R9C1', 'R8C2', 'R8C3', 'R7C3'),
  new Arrow('R8C7', 'R9C6', 'R9C5', 'R9C4'),
  new Arrow('R1C9', 'R2C8', 'R2C7', 'R3C7'),
  new Arrow('R3C8', 'R4C9', 'R5C9', 'R6C9'),
];
