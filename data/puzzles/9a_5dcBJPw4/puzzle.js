// Title: Leftover German GP Renban Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=9a_5dcBJPw4
// Source: https://cracking-the-cryptic.web.app/sudoku/Qnm3JR38Nb

// Normal sudoku rules apply. Additionally, each of the 9 coloured shapes
// (5 grey, 4 green) is a Renban region: it holds a run of 5 consecutive
// digits, in any order. Grey vs. green is cosmetic only -- the rules text
// treats both colours identically ("all coloured shapes ... contain a run
// of (5) consecutive digits").
//
// Each shape's 5 cells were recovered from the payload's coloured 1x1
// underlay fills by grouping same-colour cells into orthogonally-connected
// components; every component is a plus-pentomino (a centre cell plus its
// four orthogonal neighbours).

const greyShapes = [
  ['R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'],
  ['R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C2'],
  ['R1C8', 'R2C7', 'R2C8', 'R2C9', 'R3C8'],
  ['R7C2', 'R8C1', 'R8C2', 'R8C3', 'R9C2'],
  ['R7C8', 'R8C7', 'R8C8', 'R8C9', 'R9C8'],
];

const greenShapes = [
  ['R2C4', 'R3C3', 'R3C4', 'R3C5', 'R4C4'],
  ['R3C7', 'R4C6', 'R4C7', 'R4C8', 'R5C7'],
  ['R5C3', 'R6C2', 'R6C3', 'R6C4', 'R7C3'],
  ['R6C6', 'R7C5', 'R7C6', 'R7C7', 'R8C6'],
];

return [
  new Shape('9x9'),

  new Given('R1C5', 2),
  new Given('R1C6', 7),
  new Given('R4C1', 6),
  new Given('R5C1', 9),
  new Given('R5C9', 6),
  new Given('R6C9', 3),
  new Given('R9C4', 3),
  new Given('R9C5', 6),

  ...[...greyShapes, ...greenShapes].map(cells => new Renban(...cells)),
];
