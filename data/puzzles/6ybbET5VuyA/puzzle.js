// Title: Guided Sums
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=6ybbET5VuyA
// Source: https://sudokupad.app/if8eo8da5h

// Normal sudoku rules apply. A digit N on a cell with an arrow indicates
// that there is a straight line N cells long starting from the cell the
// arrow clue is on and extending in the direction of that arrow. This line
// acts as a region sum line: box borders divide the line into segments
// with the same sum. Each line must cross at least one box border.
//
// The line's own length is read from the digit on its starting cell, so
// for each arrow we enumerate every length that (a) stays inside the grid
// and (b) actually crosses a box border, and encode "the cell's digit is
// that length AND the resulting line is a region sum line" as one branch
// of an Or. Lengths that don't cross a box border are omitted entirely,
// which also forbids the arrow cell from taking that digit (matching
// "each line must cross at least one box border").

const arrows = [
  // Cell, [rowStep, colStep] -- every arrow here is a diagonal.
  { cell: 'R4C1', dir: [-1, 1] },
  { cell: 'R5C1', dir: [-1, 1] },
  { cell: 'R6C1', dir: [-1, 1] },
  { cell: 'R7C1', dir: [-1, 1] },
  { cell: 'R8C1', dir: [-1, 1] },
  { cell: 'R9C1', dir: [-1, 1] },
  { cell: 'R6C6', dir: [-1, -1] },
  { cell: 'R4C9', dir: [-1, -1] },
  { cell: 'R6C9', dir: [1, -1] },
];

// All cells from `start` extending in `dir` until falling off the grid.
const rayCells = (start, dir) => {
  const cells = [];
  let { row, col } = parseCellId(start);
  while (row >= 1 && row <= 9 && col >= 1 && col <= 9) {
    cells.push(makeCellId(row, col));
    row += dir[0];
    col += dir[1];
  }
  return cells;
};

const boxOf = ({ row, col }) => [Math.ceil(row / 3), Math.ceil(col / 3)];

// True if the prefix of `cells` (in order) passes through more than one box.
const crossesBoxBorder = (cells) => {
  const [firstBoxRow, firstBoxCol] = boxOf(parseCellId(cells[0]));
  return cells.some((cell) => {
    const [boxRow, boxCol] = boxOf(parseCellId(cell));
    return boxRow !== firstBoxRow || boxCol !== firstBoxCol;
  });
};

const guidedSums = arrows.map(({ cell, dir }) => {
  const maxRay = rayCells(cell, dir);
  const branches = [];
  for (let len = 1; len <= maxRay.length; len++) {
    const segment = maxRay.slice(0, len);
    if (!crossesBoxBorder(segment)) continue;
    branches.push(new And([
      new Given(cell, len),
      new RegionSumLine(...segment),
    ]));
  }
  return new Or(branches);
});

return [
  new Shape('9x9'),
  ...guidedSums,
];
