// Title: Pepper And Salt
// Author: EasilyAmused
// Video: https://www.youtube.com/watch?v=kILIbnd5eiI
// Source: https://app.crackingthecryptic.com/sudoku/HTF4Hn8rj8

// Normal sudoku, no givens. Cells a knight's move apart cannot repeat (global
// AntiKnight). Each drawn black dot is a 1:2 ratio pair; each drawn white dot
// is a consecutive pair. "Not all possible dots are given" disables the usual
// negative reading, so no dot/no-dot constraint is added for undotted edges.

const blackDots = [
  ['R7C8', 'R8C8'], ['R7C7', 'R7C8'], ['R7C4', 'R8C4'], ['R8C4', 'R9C4'],
  ['R9C1', 'R9C2'], ['R9C2', 'R9C3'], ['R4C2', 'R4C3'], ['R4C3', 'R5C3'],
  ['R2C1', 'R3C1'], ['R1C6', 'R2C6'], ['R2C6', 'R3C6'], ['R1C7', 'R2C7'],
  ['R2C7', 'R3C7'], ['R1C9', 'R2C9'], ['R5C9', 'R6C9'], ['R6C8', 'R6C9'],
  ['R4C5', 'R5C5'], ['R5C5', 'R6C5'],
];

const whiteDots = [
  ['R5C1', 'R6C1'], ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R3C7', 'R4C7'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
