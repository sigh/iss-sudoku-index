// Title: Product 36
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=JYoaJ74y6lc
// Source: https://sudokupad.app/xei72tt12o

// Rules encoded:
// - Normal sudoku rules.
// - The product of the digits along each of the six five-cell lines is 36
//   (digits may repeat along a line; no rule forbids it).
// - Each of the four arrows: the digits on its arm (two cells, the last being
//   the shared centre cell R5C5) sum to the digit in its circle.
// Omissions: none.

// Five-cell lines, from the drawn line strokes.
const lines = [
  ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'],
  ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'],
  ['R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5'],
  ['R1C5', 'R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7'],
  ['R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3'],
];

// NFA state = running product of the digits read so far; reject above 36.
const product36 = NFA.encodeSpec({
  startState: 1,
  transition: (state, value) => {
    const p = state * value;
    if (p > 36) return;
    return p;
  },
  accept: state => state === 36,
}, 9);

// Arrow: [circle, arm cells...] as drawn.
const arrows = [
  ['R5C3', 'R5C4', 'R5C5'],
  ['R3C5', 'R4C5', 'R5C5'],
  ['R5C7', 'R5C6', 'R5C5'],
  ['R7C5', 'R6C5', 'R5C5'],
];

return [
  new Shape('9x9'),
  // Givens from the drawn digits.
  new Given('R3C1', 3),
  new Given('R3C7', 2),
  new Given('R7C1', 7),
  new Given('R8C8', 4),
  ...lines.map(cells => new NFA(product36, 'product 36', ...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
