// Title: Guess the Renban
// Author: gdc
// Video: https://www.youtube.com/watch?v=gHP5BbfA6Zw
// Source: https://app.crackingthecryptic.com/sudoku/m3GGq4Ht96

// Normal Sudoku. Purple five-cell lines are Renbans; black dots are 1:2 ratios
// and white dots are consecutive. The rules state that unmarked dots are allowed.
const renbans = [
  ['R8C6', 'R7C6', 'R7C7', 'R6C7', 'R6C8'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R8C8'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R6C3', 'R7C3', 'R8C3', 'R8C4', 'R8C5'],
  ['R7C5', 'R7C4', 'R6C4', 'R5C4', 'R5C5'],
  ['R5C1', 'R5C2', 'R4C2', 'R4C3', 'R3C3'],
  ['R2C2', 'R2C3', 'R2C4', 'R3C4', 'R3C5'],
  ['R1C7', 'R2C7', 'R2C8', 'R3C8', 'R4C8'],
];

return [
  new Shape('9x9'),
  ...renbans.map((cells) => new Renban(...cells)),
  // Drawn black-dot edges.
  new BlackDot('R6C7', 'R7C7'),
  new BlackDot('R7C6', 'R7C7'),
  // Drawn white-dot edges.
  new WhiteDot('R6C8', 'R7C8'),
  new WhiteDot('R6C8', 'R6C9'),
  new WhiteDot('R3C1', 'R2C1'),
  new WhiteDot('R8C6', 'R8C7'),
  new WhiteDot('R8C8', 'R8C9'),
];
