// Title: Mitosis
// Author: Mitchell Lee
// Video: https://www.youtube.com/watch?v=QEnVuvbmkqE
// Source: https://yusitnikov.github.io/puzzletv/#2-mitosis

// FRACTIONAL SUDOKU. The real board is a 4x4 grid of cells (area 4 each),
// quartered into four 2x2 boxes. Every cell is one or two "cell pieces"
// (grey-line-bounded regions), each holding one digit 1-4; a row, column or
// box's pieces holding digit d must sum to area 4 (one cell's worth) for
// every d, and a cell's own pieces may not repeat a digit.
//
// This is modelled as an 8x8 grid of unit-area subcells, two subcells per
// real cell per axis, so a piece's area is just its subcell count:
//   - the four corner cells (R1C1, R1C4, R4C1, R4C4) are one whole,
//     undivided piece (area 4 = all 4 of their subcells);
//   - every other cell is bisected by a single vertical grey line into a
//     left-half piece and a right-half piece (area 2 each), the drawn
//     geometry the source encodes.
// A row/column/box of 4 real cells is then 16 subcells, and "each digit's
// pieces sum to one cell's area" becomes "each digit occupies exactly 4 of
// those 16 subcells", i.e. ContainExact of four of each digit.
//
// The rules explicitly allow either order for a split cell's two (equal
// size) pieces, so which physical half gets which digit is not itself part
// of the answer. The GreaterThan below both forces the two pieces apart (as
// "digits may not repeat in a cell" requires) and canonically orders them
// (left < right), picking one of the two equally-valid recordings so the
// grid does not double-count a solution via this acknowledged relabelling.

const shape = new Shape('8x8', '1-4', 'Raw');

// Real-cell corners are the only whole, undivided cells (one piece each);
// every other real cell is the vertical left/right split described above.
const wholeCells = [[1, 1], [1, 4], [4, 1], [4, 4]];
const isWhole = (R, C) => wholeCells.some(([wr, wc]) => wr === R && wc === C);

// The three printed givens, all on whole cells.
const givenAt = { '1,1': 1, '1,4': 2, '4,1': 3 };

const pieces = [];
const givens = [];
const orderings = [];
for (let R = 1; R <= 4; R++) {
  for (let C = 1; C <= 4; C++) {
    const sr = 2 * (R - 1) + 1, sc = 2 * (C - 1) + 1;
    if (isWhole(R, C)) {
      const cells = [
        makeCellId(sr, sc), makeCellId(sr, sc + 1),
        makeCellId(sr + 1, sc), makeCellId(sr + 1, sc + 1),
      ];
      pieces.push(new SameValues(4, ...cells));
      const g = givenAt[`${R},${C}`];
      if (g !== undefined) givens.push(new Given(cells[0], g));
    } else {
      const left = [makeCellId(sr, sc), makeCellId(sr + 1, sc)];
      const right = [makeCellId(sr, sc + 1), makeCellId(sr + 1, sc + 1)];
      pieces.push(new SameValues(2, ...left));
      pieces.push(new SameValues(2, ...right));
      // GreaterThan(a, b) means a > b, so this is right > left, i.e. left < right.
      orderings.push(new GreaterThan(right[0], left[0]));
    }
  }
}

// Each digit's pieces must total one cell's area (4 subcells) in every real
// row, column, and box (16 subcells each).
const MULTISET = '1_1_1_1_2_2_2_2_3_3_3_3_4_4_4_4';
const areaBalances = [];
for (let R = 1; R <= 4; R++) {
  const cells = [];
  for (let sr = 2 * (R - 1) + 1; sr <= 2 * (R - 1) + 2; sr++)
    for (let sc = 1; sc <= 8; sc++) cells.push(makeCellId(sr, sc));
  areaBalances.push(new ContainExact(MULTISET, ...cells));
}
for (let C = 1; C <= 4; C++) {
  const cells = [];
  for (let sc = 2 * (C - 1) + 1; sc <= 2 * (C - 1) + 2; sc++)
    for (let sr = 1; sr <= 8; sr++) cells.push(makeCellId(sr, sc));
  areaBalances.push(new ContainExact(MULTISET, ...cells));
}
for (let BR = 1; BR <= 2; BR++) {
  for (let BC = 1; BC <= 2; BC++) {
    const cells = [];
    for (let sr = 4 * (BR - 1) + 1; sr <= 4 * (BR - 1) + 4; sr++)
      for (let sc = 4 * (BC - 1) + 1; sc <= 4 * (BC - 1) + 4; sc++)
        cells.push(makeCellId(sr, sc));
    areaBalances.push(new ContainExact(MULTISET, ...cells));
  }
}

return [shape, ...givens, ...pieces, ...orderings, ...areaBalances];
