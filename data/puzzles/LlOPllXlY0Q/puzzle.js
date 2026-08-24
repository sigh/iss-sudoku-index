// Title: The Barrel
// Author: tallcat
// Video: https://www.youtube.com/watch?v=LlOPllXlY0Q
// Source: https://app.crackingthecryptic.com/sudoku/gJPqRPQjrF

// Standard 9x9 sudoku (rows/columns/3x3 boxes, drawn explicitly and matching
// the default), no givens.
// Arrows: the digits on an arrow's arm sum to the digit in its circled bulb
// cell (bulb cell listed first); digits may repeat on an arm. 11 arrows are
// drawn; a 12th `arrows[]` payload entry has no coordinates and renders
// nothing, so it is not a clue and is not encoded. Two arrows (the 3rd and
// 4th below) share the single bulb cell R2C7 -- that cell's digit equals
// both arm sums independently.

return [
  new Shape('9x9'),

  new Arrow('R1C1', 'R1C2', 'R1C3', 'R2C3'),
  new Arrow('R1C6', 'R1C5', 'R1C4'),
  new Arrow('R2C7', 'R1C7', 'R1C8'),
  new Arrow('R2C7', 'R3C7', 'R3C6'),
  new Arrow('R3C9', 'R4C9', 'R5C8', 'R5C7'),
  new Arrow('R3C2', 'R4C3', 'R5C4', 'R5C5'),
  new Arrow('R6C1', 'R5C2', 'R5C3'),
  new Arrow('R7C1', 'R8C1', 'R9C2', 'R9C3'),
  new Arrow('R7C4', 'R8C4', 'R9C5'),
  new Arrow('R9C6', 'R8C5', 'R9C4'),
  new Arrow('R9C9', 'R9C8', 'R9C7'),
];
