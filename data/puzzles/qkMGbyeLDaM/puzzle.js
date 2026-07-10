// Title: Ba-King Ratio Recommender - Confused? Soon many hints... endless.
// Author: olima
// Video: https://www.youtube.com/watch?v=qkMGbyeLDaM
// Source: https://sudokupad.app/vc62zmuo08

// Red cells use column indexing: if RrCc is red and contains v, then RrCv is c.
const redCells = [
  'R5C2', 'R4C2', 'R3C3', 'R4C4', 'R6C3', 'R7C4', 'R8C4', 'R9C3',
  'R8C2', 'R9C7', 'R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C8',
  'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R6C8',
];

return [
  new Shape('9x9'),
  new AntiKing(),

  new Whisper(5, 'R2C4', 'R2C5', 'R2C6'),
  new Whisper(5, 'R3C6', 'R3C5', 'R3C4'),

  new Renban('R8C2', 'R9C3', 'R8C4', 'R7C4', 'R6C3', 'R6C2', 'R5C2', 'R4C2'),
  new Renban('R4C3', 'R4C4'),
  new Renban('R3C8', 'R3C9', 'R4C9', 'R5C9', 'R6C8', 'R7C9', 'R8C8', 'R8C7'),
  new Renban('R1C6', 'R1C5', 'R1C4'),

  new BlackDot('R4C2', 'R4C3'),
  new BlackDot('R4C7', 'R4C8'),
  new BlackDot('R5C8', 'R5C9'),
  new BlackDot('R5C1', 'R5C2'),
  new BlackDot('R2C5', 'R3C5'),

  new Indexing('C', ...redCells),
];
