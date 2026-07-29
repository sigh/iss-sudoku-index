// Title: Don't Fence Me In
// Author: HalfBakedLunatic (aka David Workman)
// Video: https://www.youtube.com/watch?v=YYC5GdOkZKk
// Source: https://sudokupad.app/qeyblnue96

// Normal Sudoku rules apply. Each colored cage labels a distinct external set:
// blue uses orthogonal neighbours, green uses diagonal-only neighbours, and red
// uses both. Each labelled external set has the shown sum and no repeated digit.
// The coordinate lists below transcribe the colored cage outlines in the drawing.
const coloredCages = [
  ['red', 45, [[1, 1], [1, 2], [1, 3], [2, 3], [3, 3]]],
  ['red', 45, [[7, 7], [8, 7], [9, 7], [9, 8], [9, 9]]],
  ['red', 27, [[8, 1], [8, 2], [9, 2]]],
  ['red', 27, [[1, 8], [2, 8], [2, 9]]],
  ['blue', 18, [[4, 1], [5, 1], [6, 1]]],
  ['blue', 20, [[4, 9], [5, 9], [6, 9]]],
  ['blue', 45, [[1, 7], [2, 7], [3, 7], [3, 8], [3, 9]]],
  ['blue', 45, [[7, 1], [7, 2], [7, 3], [8, 3], [9, 3]]],
  ['green', 3, [[9, 1]]],
  ['green', 3, [[1, 9]]],
  ['green', 4, [[2, 1], [2, 2]]],
  ['green', 5, [[8, 8], [8, 9]]],
  ['green', 18, [[8, 5], [9, 4], [9, 5], [9, 6]]],
  ['green', 29, [[1, 4], [1, 5], [1, 6], [2, 5]]],
  ['green', 27, [[5, 2], [5, 3]]],
  ['green', 25, [[5, 7], [5, 8]]],
  ['green', 15, [[5, 6], [6, 5], [6, 6]]],
  ['green', 15, [[4, 4], [4, 5], [5, 4]]],
];

// Make the outside cells from each drawn outline. Green excludes any cell that
// also shares an orthogonal edge with the cage, as the rule says diagonal only.
const touchingCells = (colour, cage) => {
  const members = new Set(cage.map(([row, col]) => `${row},${col}`));
  const orthogonal = [[-1, 0], [0, -1], [0, 1], [1, 0]];
  const diagonal = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  const steps = colour === 'blue' ? orthogonal
    : colour === 'green' ? diagonal : [...orthogonal, ...diagonal];
  const touched = new Set();
  for (const [row, col] of cage) {
    for (const [rowDelta, colDelta] of steps) {
      const neighbourRow = row + rowDelta;
      const neighbourCol = col + colDelta;
      if (neighbourRow >= 1 && neighbourRow <= 9 && neighbourCol >= 1 && neighbourCol <= 9
          && !members.has(`${neighbourRow},${neighbourCol}`)) {
        touched.add(`${neighbourRow},${neighbourCol}`);
      }
    }
  }
  if (colour === 'green') {
    for (const [row, col] of cage) {
      for (const [rowDelta, colDelta] of orthogonal) {
        touched.delete(`${row + rowDelta},${col + colDelta}`);
      }
    }
  }
  return [...touched].map(cell => `R${cell.replace(',', 'C')}`);
};

return [
  new Shape('9x9'),
  new Given('R5C5', 3),
  ...coloredCages.map(([colour, total, cage]) => new Cage(total, ...touchingCells(colour, cage))),
];
