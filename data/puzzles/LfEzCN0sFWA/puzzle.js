// Title: Clock Dials
// Author: Jonathan Parker
// Video: https://www.youtube.com/watch?v=LfEzCN0sFWA
// Source: https://app.crackingthecryptic.com/sudoku/LgmnJJQRqf

// Normal sudoku rules apply (default row/column/box all-different; the
// payload's regions are the standard nine 3x3 boxes, so no explicit region
// constraint is needed). A clue outside the grid shows the sum of the
// diagonal it points along -- values on a little-killer diagonal may repeat,
// since the rules state only a sum. Digits in a cage sum to its printed
// total (if any) and, when the cage has 4 cells, ascend clockwise starting
// from one of its four corners, left for the solver to determine. 2-cell
// cages carry only their sum (with the usual cage all-different).

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);

// A 4-cell cage's digits ascend clockwise from an undetermined starting
// corner. Every 4-cell cage here is a plain 2x2 block, named by its
// top-left cell; the other three corners are read off it in clockwise
// order (TL, TR, BR, BL). Exactly one of the four cyclic rotations of that
// order is strictly increasing. GreaterThan binds only grid-adjacent pairs
// among its argument cells, and every pair of clockwise-consecutive corners
// in a 2x2 block is grid-adjacent, so listing a rotation from largest to
// smallest turns the block's four edges into that rotation's full
// ascending chain.
const clockwiseAscendCage = (topLeft) => {
  const corners = [
    topLeft,
    graph.step(topLeft, 0, 1), // top-right
    graph.step(topLeft, 1, 1), // bottom-right
    graph.step(topLeft, 1, 0), // bottom-left
  ];
  const rotations = corners.map((_, k) =>
    [...corners.slice(k), ...corners.slice(0, k)]);
  return new Or(rotations.map(rot => new GreaterThan(...rot.toReversed())));
};

// 4-cell cages: [top-left cell, printed total (null if none)]. Transcribed
// from the drawn cages.
const fourCellCages = [
  ['R1C1', 13],
  ['R1C4', 19],
  ['R4C1', 24],
  ['R5C4', null],
  ['R5C8', 15],
  ['R8C8', 26],
];

// 2-cell cages: [total, cellA, cellB]. Transcribed from the drawn cages.
const twoCellCages = [
  [4, 'R1C7', 'R2C7'],
  [15, 'R3C8', 'R3C9'],
  [5, 'R4C4', 'R4C5'],
  [8, 'R7C1', 'R7C2'],
  [16, 'R8C3', 'R9C3'],
  [12, 'R8C6', 'R9C6'],
];

return [
  shape,
  ...fourCellCages.flatMap(([topLeft, total]) => [
    ...(total == null ? [] : [new Cage(
      total, topLeft,
      graph.step(topLeft, 0, 1), graph.step(topLeft, 1, 1), graph.step(topLeft, 1, 0),
    )]),
    clockwiseAscendCage(topLeft),
  ]),
  ...twoCellCages.map(([total, a, b]) => new Cage(total, a, b)),
  // Outside diagonal clue "24": the drawn arrow/overlay sits outside the
  // grid's left edge, on a shaft at exactly 45 degrees whose two waypoints
  // are (row 4.5, col -0.5) and (row 4, col 0) -- a corner shared by R4C1
  // and R5C1, so the entry cell is tied between them. The shaft's row+col
  // invariant is 4.0, which is R4C1's cell-centre line (3.5+0.5) and not
  // R5C1's (4.5+0.5), so the drawn diagonal is R4C1-R3C2-R2C3-R1C4.
  LittleKiller.fromCells(24, graph.ray('R4C1', -1, 1), geometry),
];
