// Title: Trickster
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=F6rusDoB8b0
// Source: https://sudokupad.app/rlkbec6hy3

// Normal sudoku rules apply (default row/column/box all-different).
//
// Column indexing: for each row, a digit V in column 1 forces the cell at
// (row, V) to hold 1; the same holds for column 5 with target digit 5, and
// column 9 with target digit 9. `Indexing('C', ...cells)` natively enforces
// "cell (R,C)=V implies cell (R,V)=C" per control cell's own column C, which
// is exactly this rule when C is 1, 5, or 9 respectively. A drawn outline
// (no total) also surrounds all three columns together; it is a decorative
// grouping, not an extra sum/all-different rule -- omitted, and it could not
// hold anyway since each column is independently a full 1-9 permutation.
//
// Green lines are whisper loops/paths (adjacent digits differ by >= 5). Two
// of the three green lines are each drawn as a matched pair of 6-cell
// hairpin strokes whose edge sets are complementary and together trace a
// full 6-edge cycle around a 3x2 block; each is encoded as a closed loop by
// repeating the first cell at the end. The remaining green line is drawn
// once only, so it is an open path.
//
// Gold lines are Nabner: non-repeating and no two digits anywhere on the
// line are consecutive. `Math.abs(a - b) > 1` over all pairs forbids both
// equal (diff 0) and consecutive (diff 1) values, covering both clauses.
//
// Shaded-square cells (R8C9, R2C7) must hold an even digit.

const nabnerKey = PairX.fnToKey((a, b) => Math.abs(a - b) > 1, 9);

const columnIndexing = [
  // Column 1 -> position of the 1.
  new Indexing('C', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  // Column 5 -> position of the 5.
  new Indexing('C', 'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
  // Column 9 -> position of the 9.
  new Indexing('C', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
];

const whispers = [
  // Top-middle green loop (complementary hairpin pair around R1-3C3-4);
  // closed by repeating the start cell.
  new Whisper('R1C3', 'R2C3', 'R3C3', 'R3C4', 'R2C4', 'R1C4', 'R1C3'),
  // Bottom-right green loop (complementary hairpin pair around R7-9C6-7);
  // closed by repeating the start cell.
  new Whisper('R9C6', 'R8C6', 'R7C6', 'R7C7', 'R8C7', 'R9C7', 'R9C6'),
  // Bottom-left green open path (single drawn stroke).
  new Whisper('R7C3', 'R8C3', 'R9C3', 'R9C4'),
];

const nabnerLines = [
  ['R1C1', 'R2C1', 'R3C1'],
  ['R7C1', 'R8C1', 'R9C1'],
  ['R1C9', 'R2C9', 'R3C9'],
  ['R7C9', 'R8C9', 'R9C9'],
  ['R1C8', 'R2C7', 'R3C8'],
  ['R3C5', 'R4C4', 'R5C3'],
  // Six drawn gold lines, each a 3-cell group.
].map(cells => new PairX(nabnerKey, 'nabner', ...cells));

return [
  new Shape('9x9'),

  ...columnIndexing,

  ...whispers,

  ...nabnerLines,

  // Shaded squares.
  new Given('R8C9', 2, 4, 6, 8),
  new Given('R2C7', 2, 4, 6, 8),
];
