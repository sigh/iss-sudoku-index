// Title: Row Sum Lines
// Author: Jobo
// Video: https://www.youtube.com/watch?v=pn6SV-LMMlE
// Source: https://sudokupad.app/adkms6bibp

// Normal sudoku rules (default 3x3 boxes, matching the drawn `regions`).
// Digits along a line sum to the same value for each row the line passes
// through -- each line's own row-sums must agree with each other, but the
// four lines are independent of one another (checked from the geometry:
// every line descends through rows monotonically, so each row it touches
// contributes exactly one contiguous run of cells, never two).

// Per-line cell paths, in line order, transcribed from the drawn lines
// (colours noted for cross-reference with the description).
const lineCells = [
  ['R1C3', 'R1C4', 'R2C4', 'R3C3', 'R4C3', 'R4C4', 'R4C5', 'R5C5',
    'R6C6', 'R6C7', 'R7C7', 'R8C7', 'R8C8', 'R8C9'], // cyan
  ['R1C8', 'R1C7', 'R2C6', 'R3C5', 'R3C4', 'R4C4', 'R5C4', 'R5C3',
    'R6C2', 'R7C2', 'R7C1', 'R8C1'], // yellow
  ['R1C5', 'R1C6', 'R2C7', 'R2C8', 'R3C8', 'R4C9', 'R5C8', 'R5C7',
    'R6C6', 'R7C6', 'R7C5', 'R8C4', 'R9C5', 'R9C6'], // pink
  ['R2C3', 'R2C2', 'R3C1', 'R4C1', 'R4C2', 'R5C2', 'R6C3', 'R6C4',
    'R7C4', 'R8C3', 'R9C3', 'R9C4'], // skyblue
];

// Split a line's cells into per-row segments. Cheap to do by "row changed"
// rather than a full group-by, because every line above only moves to a new
// row and never returns to one it already left (verified from the geometry).
function rowSegments(cells) {
  const segments = [];
  let curRow = null;
  for (const cell of cells) {
    const { row } = parseCellId(cell);
    if (row !== curRow) {
      curRow = row;
      segments.push([]);
    }
    segments[segments.length - 1].push(cell);
  }
  return segments;
}

return [
  new Shape('9x9'),
  ...lineCells.map(cells => new EqualSum(...rowSegments(cells))),
];
