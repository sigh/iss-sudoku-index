// Title: Sep 20, 2021: Quad Max
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=rnZRKAvcfBk
// Source: https://tinyurl.com/r4575u6u

// Normal sudoku. Each of the 14 white circles sits at a 2x2-cell
// intersection and is printed with the largest digit among its four
// surrounding cells; that digit may occur more than once among the four
// (unlike a strict/arrow-pointed max), and the other cells may hold any
// smaller digit, repeated or not. Nothing is omitted.

// Quad-max circles: [printed max value, the block's 4 cells]. Provenance:
// the payload's 14 `circle` overlays (each spans exactly one 2x2 block).
const circles = [
  [2, ['R2C3', 'R2C4', 'R3C3', 'R3C4']],
  [4, ['R5C3', 'R5C4', 'R6C3', 'R6C4']],
  [2, ['R4C6', 'R4C7', 'R5C6', 'R5C7']],
  [4, ['R7C6', 'R7C7', 'R8C6', 'R8C7']],
  [5, ['R3C8', 'R3C9', 'R4C8', 'R4C9']],
  [5, ['R6C1', 'R6C2', 'R7C1', 'R7C2']],
  [6, ['R4C7', 'R4C8', 'R5C7', 'R5C8']],
  [5, ['R5C2', 'R5C3', 'R6C2', 'R6C3']],
  [6, ['R1C4', 'R1C5', 'R2C4', 'R2C5']],
  [6, ['R8C5', 'R8C6', 'R9C5', 'R9C6']],
  [8, ['R3C5', 'R3C6', 'R4C5', 'R4C6']],
  [9, ['R7C7', 'R7C8', 'R8C7', 'R8C8']],
  [9, ['R6C4', 'R6C5', 'R7C4', 'R7C5']],
  [8, ['R2C2', 'R2C3', 'R3C2', 'R3C3']],
];

// Each block's top-left cell (min row, min col), for the native Quad class.
function topLeftOf(cells) {
  return cells.reduce((best, cell) => {
    const { row, col } = parseCellId(cell);
    const { row: bRow, col: bCol } = parseCellId(best);
    return (row < bRow || (row === bRow && col < bCol)) ? cell : best;
  });
}

// max(cells) === value: every cell restricted to 1..value (a full-range
// Given at value 9 is redundant with the Shape and skipped), and value
// present at least once in the 2x2 block -- Quad, since every block here is
// a 2x2 square; repeats allowed.
function quadMax(value, cells) {
  return [
    ...(value < 9 ? cells.map(cell => new Given(cell, ...Array.from(
      { length: value }, (_, i) => i + 1))) : []),
    new Quad(topLeftOf(cells), value),
  ];
}

return [
  new Shape('9x9'),

  new Given('R1C1', 3),
  new Given('R2C1', 6),
  new Given('R3C4', 1),
  new Given('R4C6', 1),
  new Given('R6C4', 3),
  new Given('R7C6', 3),
  new Given('R8C9', 2),
  new Given('R9C9', 5),

  ...circles.flatMap(([value, cells]) => quadMax(value, cells)),
];
