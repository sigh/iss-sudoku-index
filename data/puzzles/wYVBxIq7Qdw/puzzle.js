// Title: Little Wonder
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=wYVBxIq7Qdw
// Source: https://sudokupad.app/objjs2ndf1

// Three overlapping standard grids: 4x4 at R1C1, 6x6 at R2C3, and 4x4 at
// R5C7. The equal-sum-diagonals rule is omitted: the payload does not identify
// which diagonals its short arrowhead marks select. The 8x10 canvas has holes,
// so its cells are represented by VG1..VG80.
const rows = 8;
const cols = 10;
const vars = new Var('G', 'canvas cells', `${rows}x${cols}`);
const cell = (r, c) => vars.cell(r, c);
const allDifferent = (cells) => new AllDifferent(...cells);
const squareGroups = (r0, c0, n, boxRows, boxCols) => [
  ...Array.from({ length: n }, (_, r) =>
    allDifferent(Array.from({ length: n }, (_, c) => cell(r0 + r, c0 + c)))),
  ...Array.from({ length: n }, (_, c) =>
    allDifferent(Array.from({ length: n }, (_, r) => cell(r0 + r, c0 + c)))),
  ...Array.from({ length: n / boxRows }, (_, br) =>
    Array.from({ length: n / boxCols }, (_, bc) =>
      allDifferent(Array.from({ length: boxRows * boxCols }, (_, i) =>
        cell(r0 + br * boxRows + Math.floor(i / boxCols),
          c0 + bc * boxCols + i % boxCols))))).flat(),
];
const grids = [
  { r: 1, c: 1, n: 4, br: 2, bc: 2 },
  { r: 2, c: 3, n: 6, br: 2, bc: 3 },
  { r: 5, c: 7, n: 4, br: 2, bc: 2 },
];
const active = new Set(grids.flatMap(({ r, c, n }) =>
  Array.from({ length: n * n }, (_, i) => `${r + Math.floor(i / n)},${c + i % n}`)));
// The canvas positions outside every drawn grid are only padding in the source
// answer. Pin them to a harmless value so they cannot create auxiliary solutions.
const padding = Array.from({ length: rows }, (_, r) =>
  Array.from({ length: cols }, (_, c) =>
    active.has(`${r + 1},${c + 1}`) ? null : new Given(cell(r + 1, c + 1), 1))
).flat().filter(Boolean);
// Cells belonging to a 4x4 grid are restricted to its 1-4 alphabet, including
// the cells shared with the 6x6 grid.
const domains = Array.from(active, (key) => {
  const [r, c] = key.split(',').map(Number);
  const smallest = Math.min(...grids
    .filter(g => r >= g.r && r < g.r + g.n && c >= g.c && c < g.c + g.n)
    .map(g => g.n));
  return smallest === 4 ? new Given(cell(r, c), 1, 2, 3, 4) : null;
}).filter(Boolean);
const sudokuGroups = grids.flatMap(({ r, c, n, br, bc }) => squareGroups(r, c, n, br, bc));
return [
  new Shape('1x1', 6),
  vars,
  ...padding,
  ...domains,
  ...sudokuGroups,
];
