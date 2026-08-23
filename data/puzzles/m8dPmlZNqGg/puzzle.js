// Title: Double The Mines
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=m8dPmlZNqGg
// Source: https://app.crackingthecryptic.com/sudoku/T3tMM749d7

// Normal sudoku rules apply (Shape('9x9') below adds the row/column/box
// all-different groups). One black dot is drawn, joining its two digits in a
// 1:2 ratio (BlackDot); "not all dots are given" means undrawn edges carry no
// constraint. Ten grey lines each connect two circle cells: the sum of the
// digits on the line's own cells equals the sum of the digits in the two
// circles at its ends (EqualSum over the line's own cells and its two circle
// ends as the two segments). Shading is the YinYang constraint's YY cell
// group (1 = shaded, 2 = unshaded). Circles are always unshaded and act as
// minesweeper clues: a circle's digit equals the number of its up-to-eight
// king-move neighbours that are shaded (NFA below, following the counting
// pattern in data/scripts/nordschleife.js).

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

// Circle cells: the drawn circle overlays, deduplicated (a cell anchoring more
// than one grey line has one overlay per line, per the grey-line table below).
const circles = [
  'R1C1', 'R2C3', 'R3C5', 'R5C7', 'R3C8', 'R2C7',
  'R8C6', 'R7C8', 'R5C3', 'R8C2', 'R8C4',
];
const circlesUnshaded = shade.at(circles).map(cell => new Given(cell, UNSHADED));

// The one drawn black dot (edge mark between R3C2 and R3C3).
const blackDot = new BlackDot('R3C2', 'R3C3');

// Grey lines: own cells plus the two circle cells at each end, read off the
// drawn stroke and the circle overlay nearest each endpoint.
const greyLines = [
  { cells: ['R1C2', 'R2C1', 'R2C2'], ends: ['R1C1', 'R2C3'] },
  { cells: ['R2C4'], ends: ['R2C3', 'R3C5'] },
  { cells: ['R4C6'], ends: ['R3C5', 'R5C7'] },
  { cells: ['R5C8', 'R4C9'], ends: ['R5C7', 'R3C8'] },
  { cells: ['R4C7', 'R3C6'], ends: ['R3C8', 'R2C7'] },
  { cells: ['R4C5', 'R5C5', 'R6C5', 'R7C6'], ends: ['R3C5', 'R8C6'] },
  { cells: ['R8C7', 'R9C8', 'R9C9', 'R8C9'], ends: ['R8C6', 'R7C8'] },
  { cells: ['R7C5', 'R6C4'], ends: ['R8C6', 'R5C3'] },
  { cells: ['R6C3', 'R7C2'], ends: ['R5C3', 'R8C2'] },
  { cells: ['R9C3'], ends: ['R8C2', 'R8C4'] },
];
const greyLineSums = greyLines.map(({ cells, ends }) =>
  new EqualSum(cells, ends));

// Minesweeper counts: reads the circle's own digit, then each king-move
// neighbour's shade, and accepts when the shaded-neighbour count equals the
// digit (data/scripts/nordschleife.js's circle-count pattern).
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };   // the circle's digit
    const next = count + (value === SHADED ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const mineCounts = circles.map(cell => new NFA(countMachine, 'mine-count',
  cell, ...shade.at(graph.kingNeighbours(cell))));

return [
  new Shape('9x9'),
  new YinYang(),
  ...circlesUnshaded,
  blackDot,
  ...greyLineSums,
  ...mineCounts,
];
