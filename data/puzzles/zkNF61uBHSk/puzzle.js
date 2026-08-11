// Title: Knights & Archers Hold The Line
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=zkNF61uBHSk
// Source: https://app.crackingthecryptic.com/sudoku/b4MTDfLJ8L

// Normal sudoku rules (default rows/cols/boxes). Digits along each arrow sum
// to the digit in that arrow's circle (bulb); five circled cells each carry
// one or more arrow arms, so a bulb may appear as the first cell of more
// than one Arrow. Anti-knight: no repeat a knight's move apart. The blue
// diagonal (R1C9..R9C1, top-right to bottom-left) is all-different.

// Arrow bulb (first cell) and arm cells, transcribed from the drawn arrow
// paths and matched to their circle underlays: each arrow starts at its
// circled cell and runs through its arm cells to the arrowhead.
const arrows = [
  ['R3C1', 'R4C2', 'R5C1'],
  ['R6C4', 'R7C3', 'R8C2', 'R8C1'],
  ['R6C4', 'R7C5', 'R8C6'],
  ['R5C5', 'R4C4', 'R3C3', 'R2C2', 'R1C2'],
  ['R4C6', 'R3C5', 'R2C5'],
  ['R4C6', 'R3C7', 'R2C8', 'R1C9'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8'],
  ['R7C9', 'R7C8', 'R7C7', 'R7C6'],
  ['R7C9', 'R6C9', 'R5C9', 'R5C8'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  new AntiKnight(),
  new Diagonal(1),
];
