// Title: A New Sudoku Masterpiece
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=xElDT-A3oCU
// Source: https://cracking-the-cryptic.web.app/sudoku/M7PnbJ3RLh

// Normal sudoku rules apply. Four edge markers appear between adjacent
// cells: a black dot (one digit exactly double the other), a white dot
// (the digits are consecutive), a V (the digits add to 5), and an X (the
// digits add to 10). The rules state that not all possible black/white
// dots, Xs and Vs are indicated, so unmarked adjacent pairs carry no
// information -- only the drawn markers below are encoded (no Strict
// variant).

const blackDots = [
  ['R1C5', 'R2C5'],
  ['R1C7', 'R1C8'],
];

const whiteDots = [
  ['R1C1', 'R1C2'],
  ['R2C1', 'R2C2'],
  ['R7C1', 'R8C1'],
  ['R8C1', 'R9C1'],
  ['R9C1', 'R9C2'],
  ['R8C2', 'R9C2'],
  ['R8C5', 'R9C5'],
  ['R8C6', 'R8C7'],
  ['R1C9', 'R2C9'],
  ['R2C8', 'R2C9'],
  ['R3C8', 'R4C8'],
  ['R3C9', 'R4C9'],
  ['R5C8', 'R5C9'],
  ['R6C9', 'R7C9'],
  ['R8C8', 'R8C9'],
  ['R9C8', 'R9C9'],
];

const xDots = [
  ['R1C3', 'R1C4'],
  ['R2C6', 'R2C7'],
  ['R4C1', 'R4C2'],
  ['R5C1', 'R5C2'],
  ['R6C2', 'R7C2'],
  ['R6C3', 'R6C4'],
  ['R6C6', 'R6C7'],
  ['R6C8', 'R7C8'],
  ['R8C3', 'R8C4'],
];

const vDots = [
  ['R2C3', 'R2C4'],
  ['R3C1', 'R3C2'],
];

return [
  new Shape('9x9'),

  new Given('R1C6', 5),
  new Given('R6C1', 5),

  ...blackDots.map((cells) => new BlackDot(...cells)),
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
  ...xDots.map((cells) => new X(...cells)),
  ...vDots.map((cells) => new V(...cells)),
];
