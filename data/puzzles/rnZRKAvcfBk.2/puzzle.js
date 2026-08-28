// Title: Sept. 21, 2021: Crash Into Me
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=rnZRKAvcfBk
// Source: https://tinyurl.com/2rypnzsm

// Normal sudoku. Each of the 12 white circles sits at a 2x2-cell
// intersection and is printed with the largest digit among its four
// surrounding cells; that digit may occur more than once among the four
// (unlike a strict/arrow-pointed max), and the other cells may hold any
// smaller digit, repeated or not. Nothing is omitted.

// Quad-max circles: [printed max value, the block's 4 cells]. Provenance:
// the payload's 12 `circle` overlays (each spans exactly one 2x2 block).
const circles = [
  [4, ['R7C1', 'R7C2', 'R6C1', 'R6C2']],
  [6, ['R8C3', 'R8C2', 'R7C3', 'R7C2']],
  [8, ['R8C4', 'R8C3', 'R9C4', 'R9C3']],
  [4, ['R2C3', 'R2C2', 'R3C3', 'R3C2']],
  [5, ['R3C4', 'R3C3', 'R4C4', 'R4C3']],
  [6, ['R5C4', 'R5C5', 'R4C4', 'R4C5']],
  [7, ['R5C5', 'R5C6', 'R6C5', 'R6C6']],
  [8, ['R6C6', 'R6C7', 'R7C6', 'R7C7']],
  [9, ['R7C7', 'R7C8', 'R8C7', 'R8C8']],
  [3, ['R2C6', 'R2C7', 'R1C6', 'R1C7']],
  [5, ['R2C8', 'R2C7', 'R3C8', 'R3C7']],
  [7, ['R3C9', 'R3C8', 'R4C9', 'R4C8']],
];

// A circle's 4 cells always form one 2x2 square; Quad's anchor is its
// top-left corner (lowest row, then lowest column).
const geometry = cellGraph('9x9').gridGeometry();
function topLeftOfSquare(cells) {
  const parsed = cells.map(id => geometry.parseCellId(id));
  const r = Math.min(...parsed.map(p => p.row));
  const c = Math.min(...parsed.map(p => p.col));
  return geometry.makeCellId(r, c);
}

// max(cells) === value: every cell restricted to 1..value (skipped when
// value is already the top of the range, which restricts nothing), and
// value present at least once among the cells -- `Quad` is exactly this
// "value(s) present in the surrounding 2x2 square" rule.
function quadMax(value, cells) {
  return [
    ...(value < 9 ? cells.map(cell => new Given(cell, ...Array.from(
      { length: value }, (_, i) => i + 1))) : []),
    new Quad(topLeftOfSquare(cells), value),
  ];
}

return [
  new Shape('9x9'),

  new Given('R1C4', 4),
  new Given('R4C1', 4),
  new Given('R4C7', 3),
  new Given('R5C2', 5),
  new Given('R5C8', 2),
  new Given('R6C3', 6),
  new Given('R6C9', 1),
  new Given('R9C6', 7),

  ...circles.flatMap(([value, cells]) => quadMax(value, cells)),
];
