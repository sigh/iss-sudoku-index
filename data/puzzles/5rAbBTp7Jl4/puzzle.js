// Title: Away in a Manger
// Author: GBPack
// Video: https://www.youtube.com/watch?v=5rAbBTp7Jl4
// Source: https://app.crackingthecryptic.com/sudoku/RM83D8qNL9

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Arrows: arm cells sum to the circle digit (bulb cell listed first).
// Green lines: adjacent digits differ by at least 5 (Whisper(5)). The drawn
// shape is five separate strokes; three of them share cells pairwise at
// R7C5, R8C4 and R7C3, so they are encoded as three separate chains rather
// than one path.

return [
  new Shape('9x9'),

  new Arrow('R1C2', 'R2C2', 'R2C1', 'R1C1'),
  new Arrow('R6C5', 'R6C4', 'R6C3'),
  new Arrow('R5C7', 'R6C7', 'R7C6', 'R6C6'),

  new Whisper(5,
    'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5',
    'R3C4', 'R4C3', 'R5C2', 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Whisper(5, 'R9C8', 'R9C7', 'R8C8', 'R7C7', 'R6C7'),
  new Whisper(5, 'R6C6', 'R7C5', 'R8C4', 'R9C3'),
  new Whisper(5, 'R7C5', 'R7C4', 'R7C3', 'R7C2'),
  new Whisper(5, 'R7C3', 'R8C4', 'R9C5'),
];
