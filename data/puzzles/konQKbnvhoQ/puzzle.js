// Title: Whispering Fives
// Author: M.K.
// Video: https://www.youtube.com/watch?v=konQKbnvhoQ
// Source: https://sudokupad.app/wdb9oj31j6

// Rules encoded below:
//  - Every row, column and 2x5 box holds the digits 0 to 9 once each.
//  - Digits in a cage sum to the small number in its corner (if given).
//  - Adjacent digits on a green line differ by at least 5.
//  - Each cage starts one straight green line from its left cell going either
//    up, left, or down. A line cannot enter another cage, but may cross or
//    overlap another line.
//  - The two digits in a cage represent the sum of the digits on the line
//    originating from that cage (a cage holding 1 and 9 goes with a line
//    summing to 19); zero is a valid starting number.
// Nothing is omitted.

const shape = new Shape('10x10', '0-9');
const geometry = cellGeometry(shape);

// The drawn boxes are 5 rows tall and 2 columns wide (C1-C2, C3-C4, ... each
// split at the R5/R6 line). ISS's default tiling for a 10x10 grid is the other
// way round, 2 rows by 5 columns, so the defaults are dropped and the drawn
// boxes given as jigsaw regions.
const boxes = [1, 6].flatMap(
  top => [1, 3, 5, 7, 9].map(
    left => [0, 1, 2, 3, 4].flatMap(
      dRow => [0, 1].map(dCol => makeCellId(top + dRow, left + dCol)))));

// Given digits, read off the grid: row, column, digit.
const GIVENS = [
  [1, 1, 1], [1, 10, 0], [2, 3, 7], [3, 5, 1], [4, 7, 0],
  [7, 1, 0], [7, 6, 9], [8, 3, 9], [10, 10, 1],
];

// The nine drawn cages, each a horizontal domino, left cell first; `total` is
// the number printed in the cage's corner, absent where none is printed.
const CAGES = [
  { cells: [[9, 1], [9, 2]], total: 5 },
  { cells: [[9, 6], [9, 7]] },
  { cells: [[8, 8], [8, 9]], total: 5 },
  { cells: [[7, 5], [7, 6]] },
  { cells: [[5, 6], [5, 7]] },
  { cells: [[2, 2], [2, 3]] },
  { cells: [[1, 4], [1, 5]] },
  { cells: [[2, 8], [2, 9]] },
  { cells: [[4, 9], [4, 10]], total: 5 },
];

// The one green line printed on the grid: two cells running down out of the
// left cell of the R5C6-R5C7 cage. The other eight cages' lines are not drawn -
// the rules say where each starts, which ways it may run, where it may not go
// and what fixes its length, so those eight are for the solver to find.
const DRAWN_LINE = [[5, 6], [6, 6]];

const id = ([row, col]) => makeCellId(row, col);
const key = ([row, col]) => row * 100 + col;
const CAGE_CELLS = new Set(CAGES.flatMap(cage => cage.cells).map(key));

// Up, left, down: the three directions the rules allow, as row/column steps.
const DIRECTIONS = [[-1, 0], [0, -1], [1, 0]];

// Every straight path a cage's line could take: from the cage's left cell, one
// direction, every length from two cells (a direction means at least one step)
// out to the grid edge or the first cell of a cage, which a line may not enter.
// This reads the drawn geometry only; no digit enters the enumeration.
const linePaths = start => DIRECTIONS.flatMap(([dRow, dCol]) => {
  const paths = [];
  const path = [start];
  for (let row = start[0] + dRow, col = start[1] + dCol;
    row >= 1 && row <= 10 && col >= 1 && col <= 10
    && !CAGE_CELLS.has(key([row, col]));
    row += dRow, col += dCol) {
    path.push([row, col]);
    paths.push(path.slice());
  }
  return paths;
});

// What one candidate path must satisfy: the whisper along it, and its digits
// totalling the cage read left to right as a two-digit number, 10*left + right.
// The cage's left cell is also the line's first cell, so it is counted once as
// a line cell and once as the tens digit: net coefficient 1 - 10 = -9.
const lineRules = (cage, path) => [
  new Whisper(5, ...path.map(id)),
  new Sum(0,
    [id(cage.cells[0]), -9], [id(cage.cells[1]), -1],
    ...path.slice(1).map(id)),
];

const greenLines = CAGES.flatMap(cage =>
  key(cage.cells[0]) === key(DRAWN_LINE[0])
    ? lineRules(cage, DRAWN_LINE)
    : [new Or(linePaths(cage.cells[0]).map(
      path => new And(lineRules(cage, path))))]);

return [
  shape,
  new NoBoxes(),
  ...boxes.map(cells => new Jigsaw(geometry.name, ...cells)),
  ...GIVENS.map(([row, col, digit]) => new Given(makeCellId(row, col), digit)),
  // A printed cage total is a sum only: the rules never say a cage's digits
  // differ, and the row they share already forbids a repeat.
  ...CAGES.filter(cage => cage.total !== undefined).map(
    cage => new Sum(cage.total, ...cage.cells.map(id))),
  ...greenLines,
];
