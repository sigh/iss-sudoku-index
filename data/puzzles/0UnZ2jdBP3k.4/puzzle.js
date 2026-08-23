// Title: Renban Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=0UnZ2jdBP3k
// Source: https://app.crackingthecryptic.com/sudoku/gnTqBG79H8

// Normal sudoku rules apply (standard 3x3 boxes, from the payload's regions).
// Each marked (grey) line must contain a non-repeating set of consecutive
// digits, in any order: Renban. Six lines, each a 2x2 block of 4 cells.

const renbanLines = [
  ['R1C9', 'R2C9', 'R2C8', 'R1C8'],
  ['R2C2', 'R3C2', 'R3C3', 'R2C3'],
  ['R4C7', 'R5C7', 'R5C6', 'R4C6'],
  ['R6C3', 'R5C3', 'R5C4', 'R6C4'],
  ['R9C2', 'R8C2', 'R8C1', 'R9C1'],
  ['R8C7', 'R7C7', 'R7C8', 'R8C8'],
];

return [
  new Shape('9x9'),

  new Given('R1C4', 5), new Given('R1C5', 8),
  new Given('R2C1', 9), new Given('R2C6', 6),
  new Given('R3C1', 8), new Given('R3C7', 6),
  new Given('R4C1', 7), new Given('R4C8', 5),
  new Given('R6C2', 3), new Given('R6C9', 1),
  new Given('R7C3', 4), new Given('R7C9', 2),
  new Given('R8C4', 4), new Given('R8C9', 3),
  new Given('R9C5', 5), new Given('R9C6', 8),

  ...renbanLines.map((cells) => new Renban(...cells)),
];
