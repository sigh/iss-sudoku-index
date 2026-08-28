// Title: The Scrabblebag Equilibrium
// Author: olima
// Video: https://www.youtube.com/watch?v=Q5tfzfGelAo
// Source: https://tinyurl.com/scrabblesudoku

// Standard 9x9 sudoku, default 3x3 boxes (no jigsaw regions in the payload).
// Killer cages: digits in a cage do not repeat and sum to the printed total,
// or just do not repeat where no total is printed. Grey squares hold even
// digits. Green lines are German whispers: adjacent cells differ by >= 5.

return [
  new Shape('9x9'),

  // Killer cages.
  new Cage(28, 'R1C4', 'R2C4', 'R3C4', 'R4C1', 'R4C2', 'R4C3', 'R4C4'),
  new Cage(24, 'R7C4', 'R8C4', 'R9C4'),
  // No printed total: distinct-only, per catalog guidance for a total-less cage.
  new AllDifferent('R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9', 'R6C5', 'R6C6', 'R6C8', 'R6C9'),

  // Even (grey square) cells: candidate restriction, no dedicated Even class.
  ...['R6C2', 'R8C8', 'R9C3', 'R8C2', 'R7C6', 'R4C6', 'R4C7', 'R4C5', 'R2C5', 'R2C2', 'R1C2']
    .map(cell => new Given(cell, 2, 4, 6, 8)),

  // Green German-whisper lines; min difference 5.
  new Whisper(5, 'R5C6', 'R6C7', 'R7C7', 'R8C6', 'R9C6', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C8', 'R6C8', 'R5C9'),
  new Whisper(5, 'R3C1', 'R4C2', 'R5C2', 'R6C1', 'R7C1'),
  new Whisper(5, 'R7C4', 'R6C4', 'R5C3'),
  new Whisper(5, 'R4C3', 'R5C3'),
  new Whisper(5, 'R7C2', 'R7C1'),
  new Whisper(5, 'R7C4', 'R7C3', 'R7C2'),
  new Whisper(5, 'R3C4', 'R3C3', 'R4C3'),
];
