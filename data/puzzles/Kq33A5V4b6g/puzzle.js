// Title: Chaos Sudoku With Slitherlink #1
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=Kq33A5V4b6g
// Source: https://tinyurl.com/y267e524

// Rules encoded here:
//  1. Every row, every column and every area holds each number 0-8 exactly once.
//  2. The nine areas of the irregular sudoku are not drawn; the solver has to
//     locate them. Each is nine orthogonally connected cells.
//  3. Where a cell carries a circle, the number in that cell says how many of
//     that cell's own four edges and four corners are used by area boundaries.
//     The outer frame of the grid counts as an area boundary.
// Nothing is omitted.
//
// The circles carry no printed number of their own, so the counted value is the
// cell's solution digit. The rules' worked example forces that reading: the
// circle in R4C9 "MUST contain at least a 3 because the outer frame on its right
// involves two corners of r4c9's cell and one line segment joining these
// corners" -- a statement about a digit still to be placed. Five of the sixteen
// circles happen to sit on cells whose digit is printed anyway.

// Drawn data, read off the grid: the sixteen circles and the eight printed numbers.
const CIRCLES = [
  'R1C1', 'R1C5', 'R2C7', 'R3C2', 'R3C3', 'R3C5', 'R3C7', 'R4C9',
  'R5C1', 'R5C4', 'R5C5', 'R6C7', 'R7C3', 'R7C7', 'R8C5', 'R8C8',
];
const GIVENS = [
  ['R1C9', 7], ['R3C3', 0], ['R3C7', 1], ['R5C5', 2],
  ['R7C3', 1], ['R7C7', 0], ['R9C1', 8], ['R9C6', 4],
];

const shape = new Shape('9x9', '0-8');
const graph = cellGraph(shape);
// The area label the solver assigns to each grid cell.
const cc = graph.makeOverlay('CC');

// A "part" is one edge or one corner of the lattice, described by the cells that
// meet at it. An edge is used by an area boundary exactly when the two cells it
// separates are in different areas. A corner is used exactly when a boundary
// segment passes through it, which is the same as saying the four cells meeting
// there are not all in one area: the four segments at a corner are the four
// orthogonal pairs of that 2x2 block. A part on the frame has fewer cells here
// because the rest lie outside the grid, and the frame is a boundary by rule, so
// such a part is always used.
const makePart = (key, coords) => {
  const cells = coords
    .filter(([r, c]) => r >= 1 && r <= 9 && c >= 1 && c <= 9)
    .map(([r, c]) => makeCellId(r, c));
  return { key, cells, frame: cells.length < coords.length };
};
// Edge between R{r}C{c} and R{r+1}C{c}.
const hEdge = (r, c) => makePart('H' + r + '_' + c, [[r, c], [r + 1, c]]);
// Edge between R{r}C{c} and R{r}C{c+1}.
const vEdge = (r, c) => makePart('V' + r + '_' + c, [[r, c], [r, c + 1]]);
// Corner at the bottom right of R{r}C{c}.
const corner = (r, c) => makePart('P' + r + '_' + c,
  [[r, c], [r, c + 1], [r + 1, c], [r + 1, c + 1]]);

// The eight parts a circle in `cell` counts: its four edges, then its four corners.
const partsAround = (cell) => {
  const { row, col } = parseCellId(cell);
  return [
    hEdge(row - 1, col), hEdge(row, col), vEdge(row, col - 1), vEdge(row, col),
    corner(row - 1, col - 1), corner(row - 1, col),
    corner(row, col - 1), corner(row, col),
  ];
};

// One 0/1 variable per distinct part that some circle counts.
const parts = new Map();
for (const part of CIRCLES.flatMap(partsAround)) parts.set(part.key, part);
const partList = [...parts.values()];
const partVars = new Var('B', 'boundaryUsed', partList.length);
const varOf = new Map(partList.map((part, i) => [part.key, partVars.cell(i + 1)]));

// Reads [labelA, labelB, used] and requires used = 1 exactly when the two area
// labels differ. The machine also pins `used` to 0 or 1.
const edgeNFA = NFA.encodeSpec({
  startState: { phase: 0, a: null, differ: null },
  transition(state, value) {
    if (state.phase === 0) return { phase: 1, a: value, differ: null };
    if (state.phase === 1) {
      return { phase: 2, a: null, differ: value !== state.a ? 1 : 0 };
    }
    if (state.phase === 2) {
      return value === state.differ ? { phase: 3, a: null, differ: null } : undefined;
    }
    return undefined;
  },
  accept: (state) => state.phase === 3,
}, shape);

// Reads [label, label, label, label, used] for the 2x2 block round a corner and
// requires used = 1 exactly when those four labels are not all equal. `a` holds
// the first label and is dropped once two labels are known to differ, so the
// compiled machine stays small.
const cornerNFA = NFA.encodeSpec({
  startState: { seen: 0, a: null, allEqual: true },
  transition(state, value) {
    if (state.seen === 0) return { seen: 1, a: value, allEqual: true };
    if (state.seen < 4) {
      const equal = state.allEqual && value === state.a;
      return { seen: state.seen + 1, a: equal ? state.a : null, allEqual: equal };
    }
    if (state.seen === 4) {
      return value === (state.allEqual ? 0 : 1)
        ? { seen: 5, a: null, allEqual: null } : undefined;
    }
    return undefined;
  },
  accept: (state) => state.seen === 5,
}, shape);

const partRules = partList.map((part) => part.frame
  ? new Given(varOf.get(part.key), 1)
  : new NFA(
    part.cells.length === 2 ? edgeNFA : cornerNFA,
    part.cells.length === 2 ? 'BoundaryEdge' : 'BoundaryCorner',
    ...cc.at(part.cells), varOf.get(part.key)));

const circleCounts = CIRCLES.map((cell) => new Arrow(
  cell, ...partsAround(cell).map((part) => varOf.get(part.key))));

return [
  shape,
  new NoBoxes(),
  new ChaosConstruction(),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  partVars,
  ...partRules,
  ...circleCounts,
];
