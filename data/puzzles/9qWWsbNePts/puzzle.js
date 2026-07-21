// Title: Parity Parity
// Author: Justin Vitanza
// Video: https://www.youtube.com/watch?v=9qWWsbNePts
// Source: https://sudokupad.app/vt15nmht65

// Normal Sudoku and anti-king rules apply. The alternating colours start with
// blue at R1C1. For every digit d, either colour contains exactly d copies.

const givens = [
  ['R1C2', 2], ['R2C3', 3], ['R2C7', 4],
  ['R3C1', 1], ['R3C2', 7], ['R3C5', 6],
  ['R4C4', 3], ['R4C7', 1], ['R5C5', 8],
  ['R5C8', 3], ['R8C7', 6], ['R9C9', 2],
].map(([cell, value]) => new Given(cell, value));

const cellsByColour = [[], []];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    // Even row+column is blue; odd is yellow.
    cellsByColour[(row + col) % 2].push(makeCellId(row, col));
  }
}

const exactCopies = (digit, cells) => new ContainExact(
  Array(digit).fill(digit).join('_'), ...cells);
const parityParity = Array.from({ length: 9 }, (_, index) => {
  const digit = index + 1;
  return new Or(cellsByColour.map(cells => exactCopies(digit, cells)));
});

return [
  new Shape('9x9'),
  ...givens,
  new AntiKing(),
  ...parityParity,
];
