// Title: Steamed Hams
// Author: Perladel
// Video: https://www.youtube.com/watch?v=N7PRY8s_ssc
// Source: https://app.crackingthecryptic.com/sudoku/TNGQtNP6jL

// Standard Sudoku; anti-knight; distinct killer cages; and the drawn peach
// entropic lines. Cage coordinates and totals are transcribed from the drawn cages.
const cages = [
  [22, 'R1C2', 'R2C2', 'R2C3'],
  [8, 'R1C8', 'R1C9', 'R2C9'],
  [22, 'R3C4', 'R4C4', 'R4C3'],
  [22, 'R6C6', 'R7C6', 'R6C7'],
  [5, 'R8C1', 'R9C1'],
  [22, 'R5C1', 'R5C2', 'R6C2'],
  [22, 'R8C8', 'R9C8', 'R8C9'],
];

// Cell paths are transcribed from the peach line strokes, in stroke order.
const entropicLines = [
  ['R3C4', 'R4C4'],
  ['R6C6', 'R6C7'],
  ['R6C3', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R4C7'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...entropicLines.map(cells => new Entropic(...cells)),
];
