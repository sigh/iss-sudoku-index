// Title: odd minesweeper
// Author: fezzy
// Video: https://www.youtube.com/watch?v=CBIdz-XWDfo
// Source: https://sudokupad.app/zwjpx8pg0t

// Normal sudoku, no givens. White dots join consecutive digits; black dots
// join digits in a 1:2 ratio (neither list is claimed exhaustive).
//
// Omitted: "a digit in a large circle represents the count of odd digits a
// king's move away from the circle within that 3x3 box" -- the payload draws
// 14 such circles but carries no digit/text for any of them (no text field
// on the underlays, no givens in `cells`), so the count each circle displays
// cannot be recovered from this source. Fog is solving UI, not encoded.

const whiteDotEdges = [
  ['R1C2', 'R1C3'],
  ['R1C4', 'R2C4'],
  ['R2C4', 'R2C5'],
  ['R4C1', 'R5C1'],
  ['R3C1', 'R3C2'],
  ['R2C1', 'R3C1'],
  ['R2C1', 'R2C2'],
  ['R7C2', 'R7C3'],
  ['R9C7', 'R9C8'],
  ['R5C5', 'R5C6'],
  ['R4C8', 'R5C8'],
  ['R4C8', 'R4C9'],
  ['R1C7', 'R2C7'],
];

const blackDotEdges = [
  ['R1C3', 'R2C3'],
  ['R1C5', 'R2C5'],
  ['R4C1', 'R4C2'],
  ['R5C1', 'R6C1'],
  ['R8C1', 'R8C2'],
  ['R8C3', 'R9C3'],
  ['R6C4', 'R6C5'],
  ['R9C5', 'R9C6'],
];

return [
  new Shape('9x9'),
  ...whiteDotEdges.map((cells) => new WhiteDot(...cells)),
  ...blackDotEdges.map((cells) => new BlackDot(...cells)),
];
