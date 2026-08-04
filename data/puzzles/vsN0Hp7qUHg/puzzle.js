// Title: Clean Slate
// Author: Seren
// Video: https://www.youtube.com/watch?v=vsN0Hp7qUHg
// Source: https://app.crackingthecryptic.com/sudoku/qp3QFfMQ4N

// Standard rows/columns plus 9 given irregular (jigsaw) regions each contain
// 1-9; no boxes. Column 1: the digit at a cell gives the column in which
// digit 1 sits in that row. Column 9: same, for digit 9. Row 1: the digit at
// a cell gives the row in which digit 1 sits in that column. Row 9: same,
// for digit 9. `Indexing('C', ...cells)` on a set of same-column control
// cells encodes exactly this: for control cell (R, C) with value V, cell
// (R, V) holds C -- so column-1 control cells (C=1) force cell (R, V) = 1,
// and column-9 control cells (C=9) force cell (R, V) = 9.
// `Indexing('R', ...cells)` is the transposed reading for rows 1 and 9.
// The four corner cells each sit in two Indexing groups at once (one row,
// one column), matching the rules as written.

// Jigsaw region cells, transcribed from the puzzle's drawn region layout.
const REGIONS = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R3C1', 'R1C4', 'R1C5', 'R4C1'],
  ['R4C2', 'R4C3', 'R5C2', 'R6C2', 'R6C3', 'R3C2', 'R3C3', 'R7C3', 'R7C2'],
  ['R7C1', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2', 'R9C3', 'R6C1', 'R5C1'],
  ['R1C6', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C5', 'R2C3', 'R1C7', 'R4C4'],
  ['R4C5', 'R4C6', 'R5C4', 'R5C5', 'R6C5', 'R5C3', 'R7C5', 'R8C5', 'R7C6'],
  ['R7C4', 'R8C4', 'R8C6', 'R9C4', 'R9C5', 'R9C6', 'R6C4', 'R9C7', 'R9C8'],
  ['R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9', 'R3C6'],
  ['R4C7', 'R4C8', 'R5C7', 'R5C8', 'R6C7', 'R5C6', 'R6C6', 'R7C7', 'R8C7'],
  ['R7C8', 'R7C9', 'R8C8', 'R8C9', 'R9C9', 'R6C8', 'R6C9', 'R5C9', 'R4C9'],
];
const jigsawRegions = REGIONS.map(cells => new Jigsaw('9x9', ...cells));

const COL1 = ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'];
const COL9 = ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'];
const ROW1 = ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'];
const ROW9 = ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...jigsawRegions,
  new Indexing('C', ...COL1),
  new Indexing('C', ...COL9),
  new Indexing('R', ...ROW1),
  new Indexing('R', ...ROW9),
];
