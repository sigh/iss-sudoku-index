// Title: March 28, 2023: Cross Sums
// Author: clover!
// Video: https://www.youtube.com/watch?v=0Zieiss9eo0
// Source: https://tinyurl.com/4dj8k8kb

// Normal sudoku rules apply. Whenever an X appears at the corner of four
// cells, each of the two diagonal pairs of cells surrounding it must have
// the same sum: EqualSum([topLeft, bottomRight], [topRight, bottomLeft]).

// Givens, transcribed from the puzzle's grid.
const givens = [
  ['R1C1', 6], ['R1C9', 2],
  ['R2C2', 1], ['R2C5', 7], ['R2C8', 5],
  ['R3C4', 3], ['R3C6', 1],
  ['R4C3', 1], ['R4C7', 6],
  ['R5C2', 9], ['R5C8', 3],
  ['R6C3', 6], ['R6C7', 9],
  ['R7C4', 9], ['R7C6', 6],
  ['R8C2', 6], ['R8C5', 2], ['R8C8', 9],
  ['R9C1', 9], ['R9C9', 8],
];

// Each entry is the four cells of one circled "X" mark, transcribed from
// the puzzle's drawn circle overlays (all have value "X"). Cell order
// within an entry follows the source's own listing and is not geometric;
// cornersOf() below
// sorts by row/col to find the 2x2 block's actual top-left/top-right/
// bottom-left/bottom-right cells.
const xMarkCells = [
  ['R3C4', 'R3C3', 'R4C4', 'R4C3'],
  ['R6C3', 'R6C4', 'R7C3', 'R7C4'],
  ['R7C6', 'R7C7', 'R6C6', 'R6C7'],
  ['R3C6', 'R3C7', 'R4C6', 'R4C7'],
  ['R2C2', 'R2C1', 'R1C2', 'R1C1'],
  ['R1C9', 'R1C8', 'R2C9', 'R2C8'],
  ['R3C6', 'R3C5', 'R2C6', 'R2C5'],
  ['R3C5', 'R3C4', 'R2C5', 'R2C4'],
  ['R8C5', 'R8C4', 'R7C5', 'R7C4'],
  ['R8C6', 'R8C5', 'R7C6', 'R7C5'],
  ['R6C2', 'R6C3', 'R7C2', 'R7C3'],
  ['R6C7', 'R6C8', 'R7C7', 'R7C8'],
];

const cornersOf = (cells) => {
  const [topLeft, topRight, bottomLeft, bottomRight] = [...cells].sort(
    (a, b) => {
      const pa = parseCellId(a);
      const pb = parseCellId(b);
      return (pa.row - pb.row) || (pa.col - pb.col);
    }
  );
  return { topLeft, topRight, bottomLeft, bottomRight };
};

const xMarks = xMarkCells.map((cells) => {
  const { topLeft, topRight, bottomLeft, bottomRight } = cornersOf(cells);
  return new EqualSum([topLeft, bottomRight], [topRight, bottomLeft]);
});

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...xMarks,
];
