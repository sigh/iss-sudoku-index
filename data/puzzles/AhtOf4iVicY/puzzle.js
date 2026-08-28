// Title: Four Times the Magic
// Author: Unknown
// Video: https://www.youtube.com/watch?v=AhtOf4iVicY
// Source: https://cracking-the-cryptic.web.app/sudoku/d8pD7tGQJB

// Rules encoded:
// - Normal sudoku: 1-9 once per row, column and box (default Sudoku grid;
//   the payload's regions are the standard 3x3 tiling).
// - Four fixed 3x3 areas, shown by coloured shading (payload underlays), are
//   each a 1-9 magic square: nine cells holding 1-9 once (AllDifferent),
//   whose 3 rows, 3 columns and 2 diagonals all sum to the same total
//   (EqualSum). None of the four areas coincides with a sudoku box, so each
//   needs its own explicit AllDifferent as well as the EqualSum.

// Top-left corner (row, col) of each coloured 3x3 area, transcribed from the
// drawn underlay shading (9 shaded 1x1 cells per colour):
//   gold        (#f7d038): R1C5-R3C7
//   yellowgreen (#a3e048): R3C1-R5C3
//   deepskyblue (#34bbe6): R5C7-R7C9
//   red         (#e6261f): R7C3-R9C5
const MAGIC_AREAS = [
  [1, 5], // gold
  [3, 1], // yellowgreen
  [5, 7], // deepskyblue
  [7, 3], // red
];

// The 8 three-cell lines (3 rows, 3 columns, 2 diagonals) of the 3x3 area
// whose top-left corner is (r0, c0).
function areaSegments(r0, c0) {
  const cell = (r, c) => makeCellId(r, c);
  const rows = [0, 1, 2].map((dr) => [0, 1, 2].map((dc) => cell(r0 + dr, c0 + dc)));
  const cols = [0, 1, 2].map((dc) => [0, 1, 2].map((dr) => cell(r0 + dr, c0 + dc)));
  const diag1 = [0, 1, 2].map((d) => cell(r0 + d, c0 + d));
  const diag2 = [0, 1, 2].map((d) => cell(r0 + d, c0 + 2 - d));
  return [...rows, ...cols, diag1, diag2];
}

const magicClauses = MAGIC_AREAS.flatMap(([r0, c0]) => {
  const segments = areaSegments(r0, c0);
  const areaCells = segments.slice(0, 3).flat(); // the 3 row-segments cover all 9 cells
  return [new AllDifferent(...areaCells), new EqualSum(...segments)];
});

return [
  new Shape('9x9'),

  new Given('R2C9', 1),
  new Given('R9C2', 6),

  ...magicClauses,
];
