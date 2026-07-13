// Title: Square Pairs
// Author: Derek LeClair
// Video: https://www.youtube.com/watch?v=1WoNu_Hze9k
// Source: https://sudokupad.app/7k71v1ey6x

// Normal sudoku rules apply. A pair of adjacent digits along a line sum to a
// square number (4, 9, or 16). Each line below is encoded as a single Pair
// constraint so the custom relation applies only between its own adjacent
// cells, not across separate lines.

const squarePairKey = Pair.fnToKey((a, b) => {
  const s = a + b;
  const root = Math.round(Math.sqrt(s));
  return root * root === s;
}, 9);

const lines = [
  ['R3C1', 'R4C1', 'R5C1'],
  ['R3C9', 'R2C9', 'R1C9'],
  ['R1C3', 'R1C4', 'R1C5'],
  ['R3C4', 'R4C3'],
  ['R9C3', 'R9C4', 'R9C5'],
  ['R7C9', 'R6C9', 'R5C9'],
  ['R7C8', 'R7C7', 'R7C6', 'R7C5'],
  ['R4C8', 'R4C7', 'R4C6'],
  ['R2C5', 'R2C6'],
  ['R7C4', 'R8C3'],
  ['R6C1', 'R7C1'],
  ['R1C8', 'R2C7'],
  ['R6C3', 'R6C4'],
  ['R8C7', 'R9C7'],
];

return [
  new Shape('9x9'),
  new Given('R7C2', 5),
  ...lines.map(cells => new Pair(squarePairKey, 'Square pair', ...cells)),
];
