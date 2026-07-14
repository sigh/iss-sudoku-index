// Title: Fog Of War Rectangle
// Author: Chip Sounder
// Video: https://www.youtube.com/watch?v=0opeH30RSW8
// Source: https://sudokupad.app/x1cy1y9m7x

// Fog controls clue visibility while solving and adds no final-grid constraint.
const geometry = cellGeometry(9);
const row = r => Array.from({ length: 9 }, (_, c) => makeCellId(r, c + 1));
const column = c => Array.from({ length: 9 }, (_, r) => makeCellId(r + 1, c));

const renbans = [
  new Renban('R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'),
  new Renban('R6C4', 'R6C5'),
];

const cages = [
  new Cage(12, 'R7C2', 'R7C3'),
  new Cage(7, 'R5C2', 'R6C2'),
  new Cage(7, 'R8C4', 'R8C5'),
  new Cage(9, 'R8C6', 'R9C6'),
  new Cage(7, 'R4C7', 'R4C8', 'R5C7'),
];

const whispers = [
  new Whisper(5, 'R8C4', 'R7C3', 'R6C2'),
  new Whisper(5, 'R8C5', 'R7C6', 'R6C7', 'R5C8'),
  new Whisper(5, 'R4C2', 'R3C3', 'R2C4', 'R1C5'),
  new Whisper(5, 'R4C8', 'R3C7', 'R2C6'),
];

const sandwichClues = [
  Sandwich.fromCells(35, row(6), geometry),
  Sandwich.fromCells(5, row(7), geometry),
  Sandwich.fromCells(16, column(2), geometry),
  Sandwich.fromCells(27, column(7), geometry),
];

// Only drawn black dots are constrained; the puzzle has no negative Kropki rule.
const blackDots = [
  new BlackDot('R8C3', 'R8C4'),
  new BlackDot('R6C7', 'R6C8'),
  new BlackDot('R4C6', 'R5C6'),
  new BlackDot('R1C8', 'R2C8'),
  new BlackDot('R2C2', 'R2C3'),
];

return [
  new Shape('9x9'),
  ...renbans,
  ...cages,
  ...whispers,
  ...sandwichClues,
  ...blackDots,
];
