// Title: Little Wonder
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=wYVBxIq7Qdw
// Source: https://sudokupad.app/objjs2ndf1

// Rules encoded:
// - Three sudoku grids share one 8x10 canvas: a 4x4 at R1C1-R4C4 with 2x2
//   boxes, a 6x6 at R2C3-R7C8 with 2-row x 3-column boxes, and a 4x4 at
//   R5C7-R8C10 with 2x2 boxes. In each, the digits 1 to N appear once each in
//   every row, column and box of that grid. A cell shared by two grids holds a
//   single digit that has to be legal in both of them.
// - The three indicated diagonals have the same sum. Nothing else is stated
//   about a diagonal: digits may repeat along one where no box forbids it, and
//   the common sum is not printed anywhere.
// - The 24 canvas cells that lie in no grid hold nothing.
//
// The canvas rows and columns are not sudoku units of their own: R2C1 and
// R2C5, for example, sit in different grids and are unrelated, and a canvas
// row also runs through cells no grid covers. So the grid type is Raw, which
// carries no implicit row/column/box rules, and every unit is stated below.
// The value range is widened by one below the digits so that value 0 can stand
// for "no grid here" in the empty canvas cells; 1-6 are real digits.
const shape = new Shape('8x10', '0-6', 'Raw');

const range = (count, start = 0) =>
  Array.from({ length: count }, (_, i) => i + start);

// The three grids as drawn: top-left cell, side length, and box dimensions.
// Transcribed from the coloured borders on the canvas -- black outlines and
// 2x2 box borders for the two 4x4 grids, red outline and 2-row x 3-column box
// borders for the 6x6 grid (continued as red dashes where a 6x6 border crosses
// an overlap block).
const GRIDS = [
  { row0: 1, col0: 1, n: 4, boxRows: 2, boxCols: 2 },  // top left
  { row0: 2, col0: 3, n: 6, boxRows: 2, boxCols: 3 },  // middle
  { row0: 5, col0: 7, n: 4, boxRows: 2, boxCols: 2 },  // bottom right
];

// The rows, columns and boxes of one grid, as cell-id lists.
const sudokuUnits = ({ row0, col0, n, boxRows, boxCols }) => {
  const linesOfCells = range(n).flatMap(i => [
    range(n).map(j => makeCellId(row0 + i, col0 + j)),
    range(n).map(j => makeCellId(row0 + j, col0 + i)),
  ]);
  const boxesOfCells = range(n / boxRows).flatMap(boxRow =>
    range(n / boxCols).map(boxCol =>
      range(boxRows).flatMap(i =>
        range(boxCols).map(j =>
          makeCellId(row0 + boxRow * boxRows + i,
                     col0 + boxCol * boxCols + j)))));
  return [...linesOfCells, ...boxesOfCells];
};

// One ContainExact per unit, holding that grid's whole digit multiset over a
// unit of the same size: this states "each of 1..N once" and confines the
// unit's cells to 1..N in a single constraint. It is also what keeps the two
// grid sizes apart on the shared cells -- a cell in both the 6x6 and a 4x4 is
// covered by units of both, so it takes the intersection, 1-4.
const sudokus = GRIDS.flatMap(grid =>
  sudokuUnits(grid).map(
    cells => new ContainExact(range(grid.n, 1).join('_'), ...cells)));

// Cells outside every grid are not part of the puzzle; pin them to the filler
// value so they contribute nothing to the search.
const inSomeGrid = (row, col) => GRIDS.some(
  ({ row0, col0, n }) =>
    row >= row0 && row < row0 + n && col >= col0 && col < col0 + n);
const emptyCells = range(8, 1).flatMap(
  row => range(10, 1).filter(col => !inSomeGrid(row, col))
    .map(col => new Given(makeCellId(row, col), 0)));

// The cell each drawn arrow points into, and the grid that arrow addresses.
// The three arrowheads sit at the canvas border points [row, col] = [0, 4],
// [1, 6] and [4, 10] (0-indexed lattice corners), each drawn just outside its
// grid and pointing down-left across that corner, so each names the cell
// diagonally below-left of its corner.
const DIAGONAL_ENTRIES = [
  { grid: 0, row: 1, col: 4 },   // into the top-left 4x4
  { grid: 1, row: 2, col: 6 },   // into the 6x6, two columns left of its corner
  { grid: 2, row: 5, col: 10 },  // into the bottom-right 4x4
];

// A diagonal runs down-left from its entry cell until it leaves that arrow's
// own grid. For the two 4x4 grids that is the full corner-to-corner
// anti-diagonal; for the 6x6 the arrow enters at R2C6 and the run leaves the
// grid past R5C3, so all three diagonals are four cells long.
const diagonals = DIAGONAL_ENTRIES.map(({ grid, row, col }) => {
  const { row0, col0, n } = GRIDS[grid];
  const length = Math.min(row0 + n - 1 - row, col - col0) + 1;
  return range(length).map(k => makeCellId(row + k, col - k));
});

return [
  shape,
  ...emptyCells,
  ...sudokus,
  new EqualSum(...diagonals),
];
