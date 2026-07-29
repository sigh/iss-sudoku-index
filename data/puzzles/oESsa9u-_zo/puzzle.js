// Title: Viper in the Fog
// Author: Jolly Rogers
// Video: https://www.youtube.com/watch?v=oESsa9u-_zo
// Source: https://sudokupad.app/23fMD676d3

// Rules encoded below:
//   Normal 9x9 sudoku. A one-cell-wide orthogonal, non-branching snake starts
//   and ends in box 4, and may touch itself. Box N has N snake cells including
//   digit N. Both digits in each drawn 2x2 circle occur in its cells. Every
//   off-snake cell connects orthogonally through off-snake cells to the edge.
// Omitted: enforcing that every used edge belongs to the one start-to-end
//   snake, rather than to a touching disconnected cycle; and the sums of the
//   snake's unknown within-box segments.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const cells = graph.cells();

// VS records the predecessor direction of a snake cell. START has no
// predecessor; OFF is not on the snake. VE marks its unique terminal cell.
const OFF = 1, START = 2, FROM_N = 3, FROM_E = 4, FROM_S = 5, FROM_W = 6;
const END = 2, NOT_END = 1;
const ON = [START, FROM_N, FROM_E, FROM_S, FROM_W];
const DIRS = [
  { code: FROM_N, dr: -1, dc: 0, back: FROM_S },
  { code: FROM_E, dr: 0, dc: 1, back: FROM_W },
  { code: FROM_S, dr: 1, dc: 0, back: FROM_N },
  { code: FROM_W, dr: 0, dc: -1, back: FROM_E },
];
const snake = graph.makeOverlay('VS');
const end = graph.makeOverlay('VE');
const inBox4 = cell => {
  const { row, col } = parseCellId(cell);
  return row >= 4 && row <= 6 && col <= 3;
};
const neighbours = cell => DIRS.map(d => ({ ...d, cell: graph.step(cell, d.dr, d.dc) }))
  .filter(d => d.cell);

// The circle data is transcribed from the four drawn corner circles.
const CIRCLES = [
  ['R2C4', '3_9'], ['R2C7', '4_6'], ['R5C2', '3_8'], ['R8C2', '7_9'],
];

const domains = cells.flatMap(cell => {
  const permitted = [OFF, ...neighbours(cell).map(d => d.code)];
  if (inBox4(cell)) permitted.splice(1, 0, START);
  return [new Given(snake.at(cell), ...permitted)];
});
const endDomains = [
  end.makeReplicate(new Given(end.cells()[0], NOT_END, END)),
  end.makeReplicate(new Given(end.cells()[0], NOT_END), end.at(cells.filter(cell => !inBox4(cell)))),
];

// A terminal is an on-snake cell other than START. The two global counts place
// exactly one start and one terminal, both in box 4.
const terminalKey = Pair.fnToKey(
  (pathCode, endCode) => endCode !== END || (pathCode !== OFF && pathCode !== START),
  geometry.numValues);
const endpointRules = [
  new ContainExact(String(START), ...snake.at(cells)),
  new ContainExact(String(END), ...end.at(cells)),
  ...cells.map(cell => new Pair(terminalKey, 'terminal is an entered snake cell',
    snake.at(cell), end.at(cell))),
];

// Each predecessor pointer names a real adjacent predecessor. Counting the
// pointers that point back gives one successor at ordinary snake cells, none
// at OFF cells or the terminal, and prevents branches.
const successorSpecs = new Map();
function successorSpec(backCodes) {
  const key = backCodes.join('_');
  if (!successorSpecs.has(key)) {
    successorSpecs.set(key, NFA.encodeSpec({
      startState: { phase: 0, expected: 0, count: 0 },
      transition: (state, value) => {
        if (state.phase === 0) return { ...state, phase: 1, pathCode: value };
        if (state.phase === 1) {
          const expected = state.pathCode === OFF || value === END ? 0 : 1;
          return { phase: 2, expected, count: 0 };
        }
        const next = state.count + (value === backCodes[state.phase - 2] ? 1 : 0);
        return next > state.expected ? undefined : { ...state, phase: state.phase + 1, count: next };
      },
      accept: state => state.count === state.expected,
      maxDepth: 2 + backCodes.length,
    }, geometry.numValues));
  }
  return successorSpecs.get(key);
}
const degreeRules = cells.map(cell => {
  const dirs = neighbours(cell);
  return new NFA(successorSpec(dirs.map(d => d.back)), 'snake successor count',
    snake.at(cell), end.at(cell), ...dirs.map(d => snake.at(d.cell)));
});

// The ON layer is one orthogonally connected set of cells. This is sound for a
// snake but cannot distinguish a touching separate cycle from the main route.
const connectivity = [
  new ConnectedValues('VS', ON),
  new ConnectedValues('VS', OFF),
  new Or(cells.filter(cell => {
    const { row, col } = parseCellId(cell);
    return row === 1 || row === 9 || col === 1 || col === 9;
  }).map(cell => new Given(snake.at(cell), OFF))),
];

const boxCells = (boxRow, boxCol) => Array.from({ length: 3 }, (_, dr) =>
  Array.from({ length: 3 }, (_, dc) => makeCellId(boxRow * 3 + dr + 1, boxCol * 3 + dc + 1))).flat();
const boxSpec = target => NFA.encodeSpec({
  startState: { count: 0, sawTarget: false, pathCode: null },
  transition: (state, value) => {
    if (state.pathCode === null) return { ...state, pathCode: value };
    const on = state.pathCode !== OFF;
    const count = state.count + (on ? 1 : 0);
    if (count > target) return undefined;
    return { count, sawTarget: state.sawTarget || (on && value === target), pathCode: null };
  },
  accept: state => state.pathCode === null && state.count === target && state.sawTarget,
  maxDepth: 18,
}, geometry.numValues);
const boxRules = Array.from({ length: 9 }, (_, i) => {
  const target = i + 1;
  const box = boxCells((i / 3) | 0, i % 3);
  return new NFA(boxSpec(target), 'box snake count and digit',
    ...box.flatMap(cell => [snake.at(cell), cell]));
});

return [
  new Shape('9x9'),
  snake.toVar('snake predecessor directions'),
  end.toVar('snake terminal'),
  ...domains,
  ...endDomains,
  ...endpointRules,
  ...degreeRules,
  ...connectivity,
  ...boxRules,
  ...CIRCLES.map(([topLeft, values]) =>
    new Quad(topLeft, ...values.split('_').map(Number))),
];
