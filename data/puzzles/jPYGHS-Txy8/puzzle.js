// Title: Lego House
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=jPYGHS-Txy8
// Source: https://app.crackingthecryptic.com/sudoku/pbtHB6Db4g

// Rules: killer cages (sum to the printed total, no repeats within a cage)
// and arrows (arm digits sum to the circled cell's digit, repeats on an arm
// allowed unless another rule forbids them). Every cage and arrow sits
// entirely inside one box (checked against the box tiling below).
//
// The puzzle is a two-stage mechanic on the *same* 81 cells:
//   Stage 1: normal sudoku rules do not apply. Each 3x3 box is solved
//     independently, as its own 3x3 Latin square over an unstated,
//     box-specific 3-digit alphabet drawn from 1-9 ("Three digits (selected
//     from 1 to 9) need to be placed in each row/column ... once each" --
//     the same "N digits, placed once each per line" phrasing ordinary
//     Sudoku rules use for a fixed alphabet, here with the alphabet itself
//     unstated instead of always 1-9). So each box's three local rows (and
//     three local columns) are not just internally distinct: all three
//     share one common 3-digit set. The cages and arrows above apply to
//     this stage too.
//   Stage 2 (the reported grid): erase every stage-1 digit whose box number
//     does not match its row number, i.e. box b (numbered 1-9, standard
//     top-left-to-bottom-right tiling) keeps only its row b (worked example
//     in the rules: box 4 keeps r4c1c2c3). The kept digits become givens.
//     Then solve as an ordinary sudoku (full row/column/box) with the same
//     cages and arrows applied again to the whole grid.
//
// Both stages are encoded together as one constraint problem: the real grid
// (R#C#) is the stage-2/reported grid, and a same-shaped Var overlay (VS#,
// addressed VS.cell(row,col)) is the stage-1 grid. Stage-1-only rules (the
// box-local all-different pairs, and the cages/arrows) are duplicated onto
// the VS overlay; the two grids are tied together only on each box's
// surviving row, with a plain per-cell equality (SameValues with two
// singleton sets).

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const stage1 = new Var('S', 'Stage 1 grid (independent per-box mini puzzle)', '9x9');

// Cages: [total, [row, col], ...], transcribed from the drawn cage list
// (coordinates there are 0-indexed [row, col]; converted to 1-indexed here).
const CAGES = [
  [16, [1, 2], [2, 2], [3, 2]],
  [18, [2, 4], [2, 6], [2, 5]],
  [15, [3, 4], [3, 5]],
  [10, [3, 7], [3, 8], [3, 9]],
  [7, [4, 7], [4, 8]],
  [6, [6, 8], [6, 9]],
  [12, [4, 5], [4, 6], [5, 6]],
  [10, [5, 5], [5, 4]],
  [14, [4, 3], [5, 3], [5, 2]],
  [10, [6, 3], [6, 2]],
  [14, [7, 3], [7, 2], [7, 1]],
  [13, [8, 2], [8, 1]],
  [8, [8, 4], [8, 5]],
  [8, [9, 8], [9, 9]],
];

// Arrows: [circleCell, ...armCells], transcribed from the drawn arrow paths.
// The circle cell is confirmed by the matching drawn underlay circle, whose
// centre lands exactly on the first waypoint of the corresponding arrow's
// path in every one of the 9 arrows.
const ARROWS = [
  [[1, 2], [2, 3], [3, 2]],
  [[3, 4], [2, 4], [1, 5]],
  [[2, 7], [1, 7], [2, 8], [3, 9]],
  [[4, 3], [5, 3], [5, 2], [4, 1]],
  [[5, 4], [5, 5], [5, 6]],
  [[4, 9], [5, 8], [6, 9]],
  [[9, 3], [8, 3], [9, 2]],
  [[8, 4], [8, 5], [9, 5], [9, 4]],
  [[8, 9], [9, 8], [8, 7], [7, 7]],
];

const cageConstraints = CAGES.flatMap(([sum, ...cells]) => [
  new Cage(sum, ...cells.map(([r, c]) => makeCellId(r, c))),
  new Cage(sum, ...cells.map(([r, c]) => stage1.cell(r, c))),
]);

const arrowConstraints = ARROWS.flatMap(([circle, ...arm]) => [
  new Arrow(makeCellId(...circle), ...arm.map(([r, c]) => makeCellId(r, c))),
  new Arrow(stage1.cell(...circle), ...arm.map(([r, c]) => stage1.cell(r, c))),
]);

// Stage-1 box-local rule: each 3x3 box's stage1 cells form a 3x3 Latin
// square over one common (unstated) 3-digit set -- three box-local rows and
// three box-local columns each internally distinct (AllDifferent), and the
// three rows tied to the same value set (SameValues; column agreement then
// follows from row agreement plus column-AllDifferent, since every column
// entry is then necessarily drawn from that same 3-value set). graph.box(b)
// returns the main grid's box b row-major, which is only used here to
// derive which (row, col) pairs the box covers, for addressing the
// matching stage1 cells.
const boxLocalConstraints = [];
for (let b = 1; b <= 9; b++) {
  const boxCells = graph.box(b).map((id) => parseCellId(id));
  const stage1BoxCells = boxCells.map(({ row, col }) => stage1.cell(row, col));
  for (let i = 0; i < 3; i++) {
    boxLocalConstraints.push(new AllDifferent(...stage1BoxCells.slice(i * 3, i * 3 + 3)));
  }
  for (let j = 0; j < 3; j++) {
    boxLocalConstraints.push(new AllDifferent(stage1BoxCells[j], stage1BoxCells[j + 3], stage1BoxCells[j + 6]));
  }
  boxLocalConstraints.push(new SameValues(3, ...stage1BoxCells));
}

// Erasure/link: box b (1-9, standard reading-order tiling) keeps only its
// row b (worked example in the rules: box 4 keeps r4c1c2c3) -- found here as
// whichever of box b's own cells have row === b, always exactly one row
// since every box's row band contains its own box number. The kept stage-1
// digit becomes the stage-2 given at the same cell.
const linkConstraints = [];
for (let b = 1; b <= 9; b++) {
  const keepCells = graph.box(b).map((id) => parseCellId(id)).filter(({ row }) => row === b);
  for (const { row, col } of keepCells) {
    linkConstraints.push(new SameValues(2, makeCellId(row, col), stage1.cell(row, col)));
  }
}

return [
  shape,
  stage1,
  ...cageConstraints,
  ...arrowConstraints,
  ...boxLocalConstraints,
  ...linkConstraints,
];
