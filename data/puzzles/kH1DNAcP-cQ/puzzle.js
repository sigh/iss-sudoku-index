// Title: Grist for the Gossip Mill
// Author: FullDeck and Missing a Few Cards
// Video: https://www.youtube.com/watch?v=kH1DNAcP-cQ
// Source: https://app.crackingthecryptic.com/p6s6me7gcf

// Normal Sudoku rules apply. Green lines are German Whispers, and each arrow's
// line digits sum to its circle digit.
// Green German Whisper paths transcribed from the drawn lines.
const whispers = [
  new Whisper(5, 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3'),
  new Whisper(5, 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'),
  new Whisper(5, 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7'),
  new Whisper(5, 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R8C9'),
  new Whisper(5, 'R7C9', 'R6C8', 'R5C8'),
  new Whisper(5, 'R9C7', 'R9C8', 'R9C9'),
  new Whisper(5, 'R3C9', 'R2C9', 'R1C9'),
  new Whisper(5, 'R9C1', 'R8C1', 'R7C1'),
  new Whisper(5, 'R1C1', 'R1C2', 'R1C3'),
  new Whisper(5, 'R1C2', 'R2C2'),
];

// Arrow circles and arms transcribed from the drawn arrows.
const arrows = [
  new Arrow('R8C6', 'R7C5', 'R6C4', 'R6C3'),
  new Arrow('R2C2', 'R3C3', 'R3C4'),
  new Arrow('R2C5', 'R3C6', 'R4C7'),
  new Arrow('R7C7', 'R8C8', 'R9C8'),
  new Arrow('R8C3', 'R7C2', 'R6C2'),
  new Arrow('R5C6', 'R4C5', 'R4C4'),
  new Arrow('R4C8', 'R3C8', 'R2C7'),
];

return [
  new Shape('9x9'),
  ...whispers,
  ...arrows,
];
