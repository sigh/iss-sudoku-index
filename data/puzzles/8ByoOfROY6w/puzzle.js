// Title: Chocolate Banana Sandwiches
// Author: Scojo
// Video: https://www.youtube.com/watch?v=8ByoOfROY6w
// Source: https://sudokupad.app/f2DNr9b4tb

// Rules encoded below:
//   Normal sudoku.  Shade some cells so that every orthogonally connected group
//   of shaded cells is rectangular, and every orthogonally connected group of
//   unshaded cells is non-rectangular (a square is a rectangle).  A digit in a
//   circle is the number of cells in its own shaded or unshaded group.  A clue
//   above a column is the sum of the shaded cells between the 1 and the 9 of
//   that column; a clue left of a row is the sum of the unshaded cells between
//   the 1 and the 9 of that row.
//
// Omitted: where a circled cell turns out to be unshaded, "the digit is the
// number of cells in its group" is not encoded as an equality.  Only two
// consequences of it are: an unshaded group is non-rectangular so it holds at
// least 3 cells, and it holds the whole of the cell's own horizontal and
// vertical unshaded runs.  An exact count needs per-group sizes over a
// partition that no clue anchors and no rule bounds.

const UNSHADED = 1;
const SHADED = 2;

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// The shading, plus the length of the maximal same-shade run through each cell
// in each direction, counted from the cell itself: runLeft.at(c) is 1 when c
// starts its run, and grows leftwards.
const shade = graph.makeOverlay('VS');
const runLeft = graph.makeOverlay('VL');
const runRight = graph.makeOverlay('VR');
const runUp = graph.makeOverlay('VU');
const runDown = graph.makeOverlay('VD');

const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], UNSHADED, SHADED));

// Read a line outward from the end the runs are counted from, as
// [shade, run, shade, run, ...]: the run restarts at 1 wherever the shade
// changes and is otherwise one more than the previous cell's.
const runSpec = NFA.encodeSpec({
  startState: { want: 'shade', prevShade: 0, prevRun: 0 },
  transition: (state, value) => {
    if (state.want === 'shade') {
      return {
        want: 'run', shade: value,
        prevShade: state.prevShade, prevRun: state.prevRun,
      };
    }
    const expected = state.shade === state.prevShade ? state.prevRun + 1 : 1;
    if (value !== expected) return undefined;
    return { want: 'shade', prevShade: state.shade, prevRun: value };
  },
  accept: (state) => state.want === 'shade',
}, shape);

const runChain = (overlay, line) => new NFA(
  runSpec, 'run',
  ...line.flatMap(cell => [shade.at(cell), overlay.at(cell)]));

const reversed = (cells) => [...cells].reverse();

const runLengths = [
  ...graph.rows().map(row => runChain(runLeft, row)),
  ...graph.rows().map(row => runChain(runRight, reversed(row))),
  ...graph.columns().map(col => runChain(runUp, col)),
  ...graph.columns().map(col => runChain(runDown, reversed(col))),
];

// A 2x2 window holding exactly three shaded cells is a reflex corner of the
// shaded group those three cells share, and a polyomino with no reflex corner
// is a rectangle.  So forbidding the count of three over every window is the
// rectangularity rule for shaded groups.
const notchSpec = NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => Math.min(count + (value === SHADED ? 1 : 0), 4),
  accept: (count) => count !== 3,
  maxDepth: 4,
}, shape);

const windowCorners = graph.cells().filter(
  cell => graph.block(cell, 2, 2) !== null);
const shadedRectangular = shade.makeReplicate(
  new NFA(notchSpec, 'noNotch', ...shade.at(graph.block(windowCorners[0], 2, 2))),
  shade.at(windowCorners));

// runAtLeast(v, n): the run overlay cell v holds n or more.
const runAtLeast = (varCell, n) => new Given(
  varCell, ...Array.from({ length: 10 - n }, (_, i) => n + i));

const differentRun = Pair.fnToKey((a, b) => a !== b, shape);

// A group's topmost-then-leftmost cell t is exactly a cell of it with no group
// cell above and none to its left.  Writing w and h for t's rightward and
// downward runs, the group is the w x h rectangle at t precisely when each of
// the h-1 rows below t also starts at t's column and also has length w, and
// each of the w-1 columns right of t also starts at t's row and also has length
// h -- those conditions leave every cell of the block unshaded and every cell
// around it shaded.  Requiring one of them to fail at every candidate t is
// therefore the non-rectangularity rule for unshaded groups.
function notRectangular(cell) {
  const { row, col } = parseCellId(cell);
  const rowBranches = Array.from({ length: 9 - row }, (_, k) => k + 1)
    .map(i => {
      const below = graph.step(cell, i, 0);
      return new And([
        runAtLeast(runDown.at(cell), i + 1),
        new Or([
          runAtLeast(runLeft.at(below), 2),
          new Pair(differentRun, 'width',
            runRight.at(below), runRight.at(cell)),
        ]),
      ]);
    });
  const colBranches = Array.from({ length: 9 - col }, (_, k) => k + 1)
    .map(j => {
      const right = graph.step(cell, 0, j);
      return new And([
        runAtLeast(runRight.at(cell), j + 1),
        new Or([
          runAtLeast(runUp.at(right), 2),
          new Pair(differentRun, 'height',
            runDown.at(right), runDown.at(cell)),
        ]),
      ]);
    });
  return new Or([
    new Given(shade.at(cell), SHADED),
    runAtLeast(runLeft.at(cell), 2),
    runAtLeast(runUp.at(cell), 2),
    ...rowBranches,
    ...colBranches,
  ]);
}

const unshadedNonRectangular = graph.cells().map(notRectangular);

// The 14 white circles drawn on the board.
const circles = [
  'R1C1', 'R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R8C5',
  'R9C5', 'R9C3', 'R3C7', 'R1C8', 'R5C8',
];

// Read [leftRun, rightRun, upRun, downRun, digit].  A shaded group is a
// rectangle, so the runs through any of its cells are its width and height and
// the group holds width * height cells.
const shadedSizeSpec = NFA.encodeSpec({
  startState: { step: 0 },
  transition: (state, value) => {
    switch (state.step) {
      case 0:
        return { step: 1, width: value };
      case 1: {
        const width = state.width + value - 1;
        return width > 9 ? undefined : { step: 2, width };
      }
      case 2:
        return { step: 3, width: state.width, height: value };
      case 3: {
        const size = state.width * (state.height + value - 1);
        return size > 9 ? undefined : { step: 4, size };
      }
      default:
        return value === state.size ? { step: 5 } : undefined;
    }
  },
  accept: (state) => state.step === 5,
}, shape);

// Read [leftRun, rightRun, upRun, downRun, digit].  An unshaded group holds the
// whole horizontal run and the whole vertical run through its cell, and those
// two meet only at the cell, so it holds at least
// (left + right - 1) + (up + down - 1) - 1 cells.  A total past 12 puts that
// bound above 9, which no digit can reach.
const unshadedMinSpec = NFA.encodeSpec({
  startState: { step: 0, total: 0 },
  transition: (state, value) => {
    if (state.step === 4) {
      return value >= state.total - 3 ? { step: 5, total: 0 } : undefined;
    }
    const total = state.total + value;
    return total > 12 ? undefined : { step: state.step + 1, total };
  },
  accept: (state) => state.step === 5,
}, shape);

const circleClues = circles.map(cell => {
  const runs = [
    runLeft.at(cell), runRight.at(cell), runUp.at(cell), runDown.at(cell),
  ];
  return new Or([
    new And([
      new Given(shade.at(cell), SHADED),
      new NFA(shadedSizeSpec, 'circleShaded', ...runs, cell),
    ]),
    new And([
      new Given(shade.at(cell), UNSHADED),
      new Given(cell, 3, 4, 5, 6, 7, 8, 9),
      new NFA(unshadedMinSpec, 'circleUnshaded', ...runs, cell),
    ]),
  ]);
});

// Read a line as [digit, shade, digit, shade, ...].  Counting starts after the
// first of {1, 9}, adds the digit of every cell carrying the counted shade, and
// must have reached the clue exactly when the other of {1, 9} arrives.
function sandwichSpec(total, counted) {
  return NFA.encodeSpec({
    startState: { phase: 'before' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'before':
          if (value === 1) return { phase: 'crust', end: 9 };
          if (value === 9) return { phase: 'crust', end: 1 };
          return { phase: 'beforeShade' };
        case 'beforeShade':
          return { phase: 'before' };
        case 'crust':
          return { phase: 'inside', end: state.end, sum: 0 };
        case 'inside':
          if (value === state.end) {
            return state.sum === total ? { phase: 'lastCrust' } : undefined;
          }
          return {
            phase: 'insideShade', end: state.end, sum: state.sum, digit: value,
          };
        case 'insideShade': {
          const sum = state.sum + (value === counted ? state.digit : 0);
          return sum > total ? undefined : { phase: 'inside', end: state.end, sum };
        }
        case 'lastCrust':
          return { phase: 'after' };
        case 'after':
          return { phase: 'afterShade' };
        default:
          return { phase: 'after' };
      }
    },
    accept: (state) => state.phase === 'after',
  }, shape);
}

const sandwich = (line, total, counted, name) => new NFA(
  sandwichSpec(total, counted), name,
  ...line.flatMap(cell => [cell, shade.at(cell)]));

// Clues printed above columns 2, 5, 8 and left of rows 2, 5, 8.
const columnClues = [[2, 13], [5, 15], [8, 14]];
const rowClues = [[2, 30], [5, 15], [8, 18]];

const outsideClues = [
  ...columnClues.map(([col, total]) =>
    sandwich(graph.column(col), total, SHADED, 'shadedSandwich')),
  ...rowClues.map(([row, total]) =>
    sandwich(graph.row(row), total, UNSHADED, 'unshadedSandwich')),
];

return [
  shape,
  shade.toVar('shade'),
  runLeft.toVar('runLeft'),
  runRight.toVar('runRight'),
  runUp.toVar('runUp'),
  runDown.toVar('runDown'),
  shadeDomain,
  ...runLengths,
  shadedRectangular,
  ...unshadedNonRectangular,
  ...circleClues,
  ...outsideClues,
];
