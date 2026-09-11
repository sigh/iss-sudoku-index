// Title: 8x8 Irregular Renban AntiXV
// Author: ???
// Video: https://www.youtube.com/watch?v=stCigrQLi64
// Source: https://app.crackingthecryptic.com/sudoku/fmt4P39DJt

// Rules encoded here, in full:
//  * 1-8 must be placed in each row, column and marked region. The board is
//    8x8, so rows and columns come from the shape; the marked regions are eight
//    irregular eight-cell pieces, and there are no rectangular boxes.
//  * A purple line contains a sequence of consecutive digits in any order.
//  * Cells separated by an X sum to 10. Cells separated by a V sum to 5.
//  * All X's and V's are given. No X and no V is drawn anywhere on the board,
//    so every orthogonally adjacent pair is an unmarked pair: none of them may
//    sum to 10 and none may sum to 5.
// Nothing is omitted.

const shape = new Shape('8x8');

// Marked regions, as drawn: one letter per cell, row-major from R1C1.
const regionLayout = [
  'ABBBBBBB',
  'AABCCCCC',
  'AACCDDFC',
  'EADDDDFF',
  'EADGDFFF',
  'EAEGHHHF',
  'EEEGHHHF',
  'EGGGGGHH',
].join('');

const regionCells = new Map();
for (let i = 0; i < regionLayout.length; i++) {
  const letter = regionLayout[i];
  if (!regionCells.has(letter)) regionCells.set(letter, []);
  // Row-major index -> printed 1-based coordinates.
  regionCells.get(letter).push(
    makeCellId(Math.floor(i / 8) + 1, (i % 8) + 1));
}

// Purple lines, as drawn: each is a closed four-cell ring, so the stroke's
// waypoints end where they began. Renban reads its cells as a set, so each ring
// is listed once per cell and needs no repeated closing cell.
const renbanRings = [
  // Diamond around R4C4; its steps are diagonal, which a renban does not care
  // about.
  ['R3C4', 'R4C3', 'R5C4', 'R4C5'],
  // The 2x2 block in the top-left corner.
  ['R1C1', 'R1C2', 'R2C2', 'R2C1'],
];

return [
  shape,
  new NoBoxes(),
  ...Array.from(regionCells.values(), cells => new Jigsaw('8x8', ...cells)),
  new Given('R6C7', 5),
  ...renbanRings.map(cells => new Renban(...cells)),
  // The exhaustiveness clause: with no X or V drawn, this forbids sums of 10
  // and 5 on every orthogonally adjacent pair in the grid.
  new StrictXV(),
];
