// Title: Purple Reign
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=ftx4AbNRU84
// Source: https://sudokupad.app/sw5a5iw9s2

// Normal sudoku rules apply. Cells a knight's move apart cannot repeat.
// Every coloured line is a Renban: its digits are distinct and consecutive,
// in any order. The grey line is included because the rule applies to lines
// of any colour.
const renbans = [
  ['R4C3', 'R5C3', 'R6C3', 'R7C2', 'R8C2', 'R9C2'],
  ['R2C2', 'R3C3', 'R3C4', 'R4C5'],
  ['R5C4', 'R4C4', 'R5C5', 'R5C6', 'R6C6', 'R7C6', 'R7C5', 'R8C4', 'R9C3'],
  ['R5C7', 'R5C8', 'R4C7'],
  ['R7C7', 'R8C8', 'R9C9'],
  ['R4C1', 'R5C1', 'R6C2', 'R7C3', 'R7C4', 'R8C5', 'R9C5'],
];

return [
  new Shape('9x9'),
  new Given('R6C8', 1),
  new AntiKnight(),
  ...renbans.map(cells => new Renban(...cells)),
];
