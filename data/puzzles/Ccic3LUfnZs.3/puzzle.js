// Title: Consecutive Circles Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Ccic3LUfnZs
// Source: https://app.crackingthecryptic.com/sudoku/j7qqn66P3L

// Normal Sudoku rules apply. Each marked circle must contain a sequence of
// consecutive digits. The starting point and direction are unknown.
//
// The circles are drawn as unfilled outlines, and each one's stroke runs
// through a closed ring of cells: a circle of diameter m*sqrt(2) centred on
// the middle of an m x m block circumscribes that block, so its stroke passes
// exactly through the block's four corner points and bulges through the cells
// orthogonally adjacent to the block, skipping the diagonal ones. Scoring the
// stroke by arc length per cell separates the two cleanly: each ring cell
// carries a full quarter-arc, every other cell at most a rounding-width graze
// at a corner point. Two circles have diameter 1.414 (m = 1, a 4-cell ring)
// and two have 2.828 (m = 2, an 8-cell ring).
//
// Reading the digits around that ring is what the rule's "starting point and
// direction are unknown" refers to: a closed loop has no first cell and two
// ways round. So each ring's digits, read around the circle from some cell in
// some direction, are k, k+1, ..., k+n-1.

const SQRT2 = Math.SQRT2;

// The four `circle` underlays as drawn, [centreRow, centreCol] in 0-indexed
// grid units (a whole number is a grid corner, a .5 a cell centre) plus the
// drawn diameter.
const circles = [
  { centre: [2.5, 6.5], diameter: 1.414 },
  { centre: [6.5, 2.5], diameter: 1.414 },
  { centre: [2, 2], diameter: 2.828 },
  { centre: [7, 7], diameter: 2.828 },
];

// The ring of cells one circle's stroke passes through, in cyclic order:
// walk the border of the circumscribed m x m block clockwise from the cell
// above its top-left corner, taking the orthogonal neighbours of each edge
// and skipping the four diagonal corners the stroke only grazes.
const ringCells = ({ centre: [cy, cx], diameter }) => {
  const m = Math.round(diameter / SQRT2);        // block width, in cells
  const top = cy - m / 2 + 1;                    // block's top row, 1-indexed
  const left = cx - m / 2 + 1;                   // block's left column
  const span = (n) => Array.from({ length: m }, (_, i) => n + i);
  return [
    ...span(left).map((c) => makeCellId(top - 1, c)),          // above
    ...span(top).map((r) => makeCellId(r, left + m)),          // right
    ...span(left).reverse().map((c) => makeCellId(top + m, c)), // below
    ...span(top).reverse().map((r) => makeCellId(r, left - 1)), // left
  ];
};

// Reads the n ring cells plus the first one again, closing the loop, so the
// machine sees all n cyclic steps. State: `prev` is the last digit read, `dir`
// the direction settled on so far (0 until the first step), and `seams` counts
// the single wrap from the run's end back to its start. Every step is +1 or -1
// in one consistent direction except that one seam of -(n-1) or +(n-1); n such
// steps returning to the starting digit is exactly a run of n consecutive
// digits laid around the loop.
const ringSpec = (n) => NFA.encodeSpec({
  startState: { prev: null, dir: 0, seams: 0 },
  transition: ({ prev, dir, seams }, v) => {
    if (prev === null) return { prev: v, dir: 0, seams: 0 };
    const d = v - prev;
    if (d === 1 && dir >= 0) return { prev: v, dir: 1, seams };
    if (d === -1 && dir <= 0) return { prev: v, dir: -1, seams };
    if (d === -(n - 1) && dir >= 0 && seams === 0) return { prev: v, dir: 1, seams: 1 };
    if (d === n - 1 && dir <= 0 && seams === 0) return { prev: v, dir: -1, seams: 1 };
    return undefined;
  },
  accept: ({ seams }) => seams === 1,
  maxDepth: n + 1,
}, 9);

const specs = new Map([4, 8].map((n) => [n, ringSpec(n)]));

const consecutiveCircles = circles.map((circle) => {
  const cells = ringCells(circle);
  return new NFA(specs.get(cells.length), `circle${cells.length}`,
    [...cells, cells[0]]);
});

return [
  new Shape('9x9'),

  // Givens, from the payload's cell values.
  new Given('R1C1', 1), new Given('R1C4', 2),
  new Given('R2C6', 5), new Given('R2C8', 8),
  new Given('R4C1', 3), new Given('R4C4', 1),
  new Given('R4C6', 6), new Given('R4C8', 7),
  new Given('R6C2', 8), new Given('R6C4', 7),
  new Given('R6C6', 9), new Given('R6C9', 4),
  new Given('R8C2', 5), new Given('R8C4', 6),
  new Given('R9C6', 1), new Given('R9C9', 9),

  ...consecutiveCircles,
];
