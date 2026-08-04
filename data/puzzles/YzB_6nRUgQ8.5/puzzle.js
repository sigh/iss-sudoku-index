// Title: 2/17/23: Odd/Even/Big/Small
// Author: clover!
// Video: https://www.youtube.com/watch?v=YzB_6nRUgQ8
// Source: https://tinyurl.com/mfymaz3w

// Rules: fill the 8x8 grid 1-8, no repeat in any row, column, or one of the
// eight irregular 2x4/4x2 regions. Every outside O/E/S/B letter restricts
// the two grid cells nearest it (the "first two digits") to that letter's
// digit set: O = odd (1,3,5,7), E = even (2,4,6,8), S = small (1,2,3,4),
// B = big (5,6,7,8). A cell targeted by both a row clue and a column clue
// gets both restrictions (the two `Given`s below intersect automatically).

// Rectangle helper for the eight jigsaw regions, built from each region's
// (rows, cols) extent rather than hand-listing 64 cell ids.
const rect = (r0, r1, c0, c1) => {
  const cells = [];
  for (let r = r0; r <= r1; r++) {
    for (let c = c0; c <= c1; c++) {
      cells.push(makeCellId(r, c));
    }
  }
  return cells;
};

// Eight 8-cell regions, read off which cells share a region label (or share
// the same unlabelled default-box gap) in the source grid data. 1-indexed
// row/col ranges.
const regions = [
  rect(1, 2, 1, 4), // R0-1,C0-3 (unlabelled cells; default 2x4 box)
  rect(3, 4, 1, 4), // R2-3,C0-3 (region 1 in source)
  rect(1, 4, 5, 6), // R0-3,C4-5 (region 2 in source)
  rect(1, 4, 7, 8), // R0-3,C6-7 (region 3 + unlabelled cells)
  rect(5, 8, 1, 2), // R4-7,C0-1 (region 4 + unlabelled cells)
  rect(5, 8, 3, 4), // R4-7,C2-3 (region 5 in source)
  rect(5, 6, 5, 8), // R4-5,C4-7 (region 6 in source)
  rect(7, 8, 5, 8), // R6-7,C4-7 (unlabelled cells; default 2x4 box)
];

const O = [1, 3, 5, 7];
const E = [2, 4, 6, 8];
const S = [1, 2, 3, 4];
const B = [5, 6, 7, 8];

// Column outside clues: O sits above (reads the top two cells of the
// column), E sits below (reads the bottom two cells).
const topO = [1, 3, 5, 7];    // columns with an O clue above
const bottomE = [2, 4, 6, 8]; // columns with an E clue below

const columnClues = [
  ...topO.flatMap(col => [
    new Given(makeCellId(1, col), ...O),
    new Given(makeCellId(2, col), ...O),
  ]),
  ...bottomE.flatMap(col => [
    new Given(makeCellId(8, col), ...E),
    new Given(makeCellId(7, col), ...E),
  ]),
];

// Row outside clues: left/right letter, reading the two cells nearest that
// side. Rows 2, 4, 5, and 7 (1-indexed) carry no outside letter clue.
const rowClues = [
  // Row 1: S left, S right.
  new Given(makeCellId(1, 1), ...S), new Given(makeCellId(1, 2), ...S),
  new Given(makeCellId(1, 8), ...S), new Given(makeCellId(1, 7), ...S),
  // Row 3: B left, S right.
  new Given(makeCellId(3, 1), ...B), new Given(makeCellId(3, 2), ...B),
  new Given(makeCellId(3, 8), ...S), new Given(makeCellId(3, 7), ...S),
  // Row 6: S left, B right.
  new Given(makeCellId(6, 1), ...S), new Given(makeCellId(6, 2), ...S),
  new Given(makeCellId(6, 8), ...B), new Given(makeCellId(6, 7), ...B),
  // Row 8: no left clue, S right.
  new Given(makeCellId(8, 8), ...S), new Given(makeCellId(8, 7), ...S),
];

return [
  new Shape('8x8'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('8x8', ...cells)),

  // Givens, 1-indexed (R2C3=3, R2C4=6, R7C5=5, R7C6=2 in-app numbering).
  new Given('R2C3', 3),
  new Given('R2C4', 6),
  new Given('R7C5', 5),
  new Given('R7C6', 2),

  ...columnClues,
  ...rowClues,
];
