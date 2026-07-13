// Title: Odd!
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=ueofJZ22joA
// Source: https://sudokupad.app/23xbq0xofa

// Normal sudoku rules apply (default Shape gives row/column/box all-different).
const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Positive diagonals run south-west to north-east (step -1 row, +1 col). Every
// such diagonal has a unique south-west-most cell: the left column covers the
// diagonals from the top-left corner down to the main diagonal, and the
// bottom row (excluding its first cell, already covered by the column) covers
// the rest.
const diagonalStarts = [
  ...graph.column(1),
  ...graph.row(9).slice(1),
];

const diagonalConstraints = diagonalStarts.flatMap(start => {
  const diagonal = graph.ray(start, -1, 1);
  const result = [];

  // "Along every positive diagonal the difference between neighbouring
  // digits is at least 2" applies to every such diagonal, drawn green or not.
  if (diagonal.length >= 2) {
    result.push(new Whisper(2, ...diagonal));
  }

  // The drawn green lines are exactly the diagonals whose 0-indexed
  // row+col is odd (the main diagonal, row+col=8, and the two single-cell
  // corners are not marked). "Every green line contains only odd digits" is
  // modelled as a candidate restriction per cell rather than a public class.
  const { row, col } = parseCellId(start);
  const zeroIndexedSum = (row - 1) + (col - 1);
  if (zeroIndexedSum % 2 === 1) {
    for (const cell of diagonal) {
      result.push(new Given(cell, 1, 3, 5, 7, 9));
    }
  }

  return result;
});

// The central 3x3 box (R4C4:R6C6) is a magic square: every row, column, and
// 3-cell diagonal of the box sums to the same total.
const box = graph.block('R4C4', 3, 3);
const at = (r, c) => box[(r - 1) * 3 + (c - 1)];
const magicSegments = [
  [at(1, 1), at(1, 2), at(1, 3)],
  [at(2, 1), at(2, 2), at(2, 3)],
  [at(3, 1), at(3, 2), at(3, 3)],
  [at(1, 1), at(2, 1), at(3, 1)],
  [at(1, 2), at(2, 2), at(3, 2)],
  [at(1, 3), at(2, 3), at(3, 3)],
  [at(1, 1), at(2, 2), at(3, 3)],
  [at(1, 3), at(2, 2), at(3, 1)],
];

return [
  shape,
  new Given('R1C5', 2),
  new Given('R1C8', 1),
  new Given('R3C1', 1),
  ...diagonalConstraints,
  new EqualSum(...magicSegments),
];
