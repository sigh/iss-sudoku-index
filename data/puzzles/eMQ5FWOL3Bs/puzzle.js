// Title: 8x8 Irregular Renban antiXV
// Author: ???
// Video: https://www.youtube.com/watch?v=eMQ5FWOL3Bs
// Source: https://app.crackingthecryptic.com/sudoku/fmt4P39DJt

// Rules encoded here, in full:
//  * 1-8 must be placed in each row, column and marked region. The marked
//    regions are eight irregular eight-cell shapes, so the default rectangular
//    boxes are removed and each region is a Jigsaw piece.
//  * A purple line contains a sequence of consecutive digits in any order.
//  * Cells separated by an X sum to 10. Cells separated by a V sum to 5.
//  * All X's and V's are given.
// Nothing is omitted.
//
// No X and no V is drawn on the board. "All X's and V's are given" therefore
// leaves the negative half of the rule as the only live clue: every
// orthogonally adjacent pair must avoid both sums. StrictXV states exactly
// that over an empty list of marks, which is also what the title's "antiXV"
// names.

const SHAPE = '8x8';

// The eight marked regions, transcribed from the drawn heavy borders: one
// letter per cell, read row by row from R1C1.
const regionLayout = [
  'ABBBBBBB',
  'AABCCCCC',
  'AACCDDFC',
  'EADDDDFF',
  'EADGDFFF',
  'EAEGHHHF',
  'EEEGHHHF',
  'EGGGGGHH',
];

const regionCells = new Map();
regionLayout.forEach((rowStr, r) => {
  [...rowStr].forEach((label, c) => {
    if (!regionCells.has(label)) regionCells.set(label, []);
    regionCells.get(label).push(makeCellId(r + 1, c + 1));
  });
});

// Purple lines, transcribed from the two drawn strokes. Each is a closed loop,
// so it has no ends and no reading direction; Renban constrains the cell set,
// which is the loop's four distinct cells (the stroke's repeated start cell is
// dropped).
const renbanLoops = [
  // Square loop over the top-left 2x2 block.
  ['R1C1', 'R1C2', 'R2C2', 'R2C1'],
  // Diamond loop around R4C4, drawn with four diagonal strokes; the strokes
  // only graze the corners of the cells between, so R4C4 is not on the line.
  ['R3C4', 'R4C3', 'R5C4', 'R4C5'],
];

return [
  new Shape(SHAPE),
  new NoBoxes(),
  ...[...regionCells.values()].map(cells => new Jigsaw(SHAPE, ...cells)),

  new Given('R6C7', 5),

  ...renbanLoops.map(cells => new Renban(...cells)),

  new StrictXV(),
];
