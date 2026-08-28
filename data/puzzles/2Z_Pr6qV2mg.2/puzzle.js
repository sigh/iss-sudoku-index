// Title: Dec 10, 2021: Palindrome Quads
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=2Z_Pr6qV2mg
// Source: https://tinyurl.com/ytx3yat2

// Normal sudoku rules apply. Each grey line is a Palindrome: its digits read
// the same forwards and backwards. Each white circle is a Quad: the printed
// digits must each appear somewhere among its surrounding four cells. Quad
// clues are anchored at the top-left cell of their 2x2 square.

// Grey palindrome lines, provenance: the drawn grey lines.
const palindromeLines = [
  new Palindrome('R5C1', 'R4C1', 'R3C2', 'R2C3', 'R1C4'),
  new Palindrome('R5C9', 'R6C9', 'R7C8', 'R8C7', 'R9C6'),
  new Palindrome('R4C9', 'R3C8', 'R2C7', 'R1C6', 'R1C5'),
  new Palindrome('R9C5', 'R9C4', 'R8C3', 'R7C2', 'R6C1'),
  new Palindrome('R5C3', 'R6C4', 'R7C5'),
  new Palindrome('R5C7', 'R4C6', 'R3C5'),
];

// Quadruples, provenance: the drawn white circles and their printed digits.
const quads = [
  new Quad('R4C1', 1, 2, 3, 4),
  new Quad('R1C5', 2, 3, 4, 5),
  new Quad('R5C8', 3, 4, 5, 6),
  new Quad('R8C4', 4, 5, 6, 7),
  new Quad('R6C3', 2, 3, 6, 8),
  new Quad('R3C6', 1, 2, 6, 9),
  new Quad('R1C8', 3, 6, 8, 9),
  new Quad('R8C1', 3, 7, 8, 9),
  new Quad('R5C5', 1, 2, 4, 7),
  new Quad('R4C4', 4, 5, 6, 8),
];

return [
  new Shape('9x9'),
  ...palindromeLines,
  ...quads,
];
