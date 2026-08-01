// Title: Glyph
// Author: FullDeck and Missing a Few Cards
// Video: https://www.youtube.com/watch?v=eSEUqORUMPs
// Source: https://app.crackingthecryptic.com/smwplnh6vb

// Normal Sudoku rules apply. Pink lines are Renban lines; peach lines are Entropic lines.
// Givens are transcribed from the source grid.
const givens = [
  new Given('R1C6', 4),
  new Given('R4C1', 2),
  new Given('R6C9', 8),
  new Given('R9C4', 6),
];

// Pink line paths transcribed from the source drawing.
const renbans = [
  new Renban('R1C1', 'R2C1', 'R3C1'),
  new Renban('R1C3', 'R2C3', 'R3C3'),
  new Renban('R7C1', 'R7C2', 'R7C3'),
  new Renban('R9C1', 'R9C2', 'R9C3'),
  new Renban('R7C7', 'R8C7', 'R9C7'),
  new Renban('R7C9', 'R8C9', 'R9C9'),
  new Renban('R1C7', 'R1C8', 'R1C9'),
  new Renban('R3C7', 'R3C8', 'R3C9'),
  new Renban('R1C4', 'R1C5'),
  new Renban('R9C5', 'R9C6'),
  new Renban('R5C4', 'R4C4', 'R4C5', 'R4C6'),
  new Renban('R5C6', 'R6C6', 'R6C5', 'R6C4'),
  new Renban('R4C9', 'R5C9'),
  new Renban('R5C1', 'R6C1'),
  new Renban('R8C1', 'R8C2'),
  new Renban('R2C8', 'R2C9'),
];

// Peach line paths transcribed from the source drawing.
const entropics = [
  new Entropic('R7C4', 'R6C3', 'R6C2', 'R5C2', 'R4C2', 'R3C2', 'R2C2', 'R1C2'),
  new Entropic('R8C3', 'R8C4', 'R8C5', 'R8C6', 'R7C6', 'R6C7'),
  new Entropic('R2C7', 'R2C6', 'R2C5', 'R2C4', 'R3C4', 'R4C3'),
  new Entropic('R9C8', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R4C7', 'R3C6'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...renbans,
  ...entropics,
];
