// Title: Between Stars
// Author: Laura Soler
// Video: https://www.youtube.com/watch?v=SNAh_k16Aos
// Source: https://cracking-the-cryptic.web.app/sudoku/NHpMRLJHpP

// Rules (transcribed from the video's on-screen rules panel):
// "Place the numbers 1 to 7 and two stars in each row, column and 3x3 box.
// Stars cannot touch, even diagonally. Numbers outside the grid give the sum
// of cells sandwiched between the stars in the relevant row/column."
//
// Each of the 9 cells of every row, column and box holds either a digit 1-7
// (each exactly once) or a star (exactly two per house, no digit value). This
// is modeled on a Raw grid (no implicit Sudoku rules) with domain 0-7, 0
// standing for "star": one ContainExact per house pins its 9 cells to the
// multiset {0, 0, 1, 2, 3, 4, 5, 6, 7} -- digit uniqueness and the star count
// in one constraint.
//
// A row/column clue sums a variable-width run (the cells strictly between the
// two, as-yet-unplaced, star cells of that house), so it is an Or over every
// candidate pair of star positions in the house: each branch pins both star
// cells with Given(0) and sums the cells strictly between them. Branches
// where the two stars would be adjacent (an empty "between" run) are omitted
// -- the no-touch rule already forbids that pair, so no candidate is lost.

const shape = new Shape('9x9', '0-7', 'Raw');
const graph = cellGraph(shape);

const STAR = 0;
const HOUSE_MULTISET = '0_0_1_2_3_4_5_6_7';

// Outside clues -- provenance: the drawn overlay numbers left of rows 1-9
// (top to bottom) and above columns 1-9 (left to right).
const ROW_CLUES = [17, 3, 24, 4, 6, 6, 23, 12, 6];
const COL_CLUES = [12, 28, 3, 23, 7, 21, 4, 7, 9];

// The Raw grid type has no default box geometry (only the Sudoku grid type
// does), so the nine 3x3 boxes are built explicitly from their top-left
// corners.
const boxTopLefts = [1, 4, 7].flatMap(
  r => [1, 4, 7].map(c => makeCellId(r, c)));
const boxes = boxTopLefts.map(tl => graph.block(tl, 3, 3));

const houses = [...graph.rows(), ...graph.columns(), ...boxes];

function betweenStarsClue(total, cells) {
  const branches = [];
  for (let i = 0; i < cells.length; i++) {
    // j starts at i + 2: j = i + 1 would leave an empty "between" run, a
    // pairing the no-touch rule already excludes.
    for (let j = i + 2; j < cells.length; j++) {
      branches.push(new And([
        new Given(cells[i], STAR),
        new Given(cells[j], STAR),
        new Sum(total, ...cells.slice(i + 1, j)),
      ]));
    }
  }
  return new Or(branches);
}

// No-touch: no two star (0) cells may be king-move adjacent, anywhere on the
// board. One Pair template per unordered adjacency offset, replicated onto
// every cell that has a neighbour there.
const notBothStar = Pair.fnToKey((a, b) => a !== STAR || b !== STAR, shape);
const TOUCHING_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const noTouchPairs = TOUCHING_OFFSETS.map(([dr, dc]) => {
  const origins = graph.cells().filter(cell => graph.step(cell, dr, dc));
  const anchor = origins[0];
  const template = new Pair(
    notBothStar, 'stars do not touch', anchor, graph.step(anchor, dr, dc));
  return new Replicate(
    [template], Replicate.encodeTargetCells(origins, anchor, graph), anchor);
});

return [
  shape,
  ...houses.map(house => new ContainExact(HOUSE_MULTISET, ...house)),

  // Givens -- provenance: the two drawn digits, R5C4=1 and R5C6=2.
  new Given('R5C4', 1),
  new Given('R5C6', 2),

  ...noTouchPairs,

  ...ROW_CLUES.map((total, i) => betweenStarsClue(total, graph.row(i + 1))),
  ...COL_CLUES.map((total, i) => betweenStarsClue(total, graph.column(i + 1))),
];
