// Title: Knights and Bishops in the Fog
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=0f663XIyQt8
// Source: https://app.crackingthecryptic.com/29pegnk9xe

// Normal Sudoku and anti-knight apply. Fog clearing is UI-only.
// Each numbered cell gives the sum on one of its two full diagonals; the
// direction is unknown. Each arrow bulb equals its two-cell arm's sum.

// Diagonal-sum labels, transcribed from the four labelled payload cells.
const diagonalClues = [
  [69, 'R5C6'],
  [36, 'R5C9'],
  [17, 'R9C7'],
  [7, 'R2C9'],
];

// Start at the board edge opposite the supplied direction, then follow the
// complete diagonal through the labelled cell.
function diagonalThrough(cell, rowStep, colStep) {
  let { row, col } = parseCellId(cell);
  while (row - rowStep >= 1 && row - rowStep <= 9
      && col - colStep >= 1 && col - colStep <= 9) {
    row -= rowStep;
    col -= colStep;
  }
  const cells = [];
  while (row >= 1 && row <= 9 && col >= 1 && col <= 9) {
    cells.push(makeCellId(row, col));
    row += rowStep;
    col += colStep;
  }
  return cells;
}

const diagonalSums = diagonalClues.map(([sum, cell]) => new Or([
  new Sum(sum, ...diagonalThrough(cell, 1, 1)),
  new Sum(sum, ...diagonalThrough(cell, 1, -1)),
]));

// Arrows, transcribed bulb first and then along the drawn arm.
const arrows = [
  ['R4C3', 'R4C2', 'R5C3'],
  ['R3C1', 'R2C1', 'R2C2'],
  ['R4C5', 'R4C6', 'R4C7'],
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...diagonalSums,
  ...arrows.map(cells => new Arrow(...cells)),
];
