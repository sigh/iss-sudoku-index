// Title: Setting Things Straight
// Author: Jrosas
// Video: https://www.youtube.com/watch?v=Ycv_I-4FCkE
// Source: https://sudokupad.app/yo8k09d2y1

// Rules: ordinary sudoku, plus Yin-Yang (the grid splits into exactly two
// orthogonally-connected shades, no 2x2 box monochrome). Every +/-1 line's
// adjacent cells differ by 1 and share their Yin-Yang shade; all such lines
// are given. Twelve counting circles: a circle's digit counts (a) how many
// of the 12 circles hold that digit, and (b) how many cells sharing this
// circle's own Yin-Yang shade hold that digit, over the whole grid -- the
// rules text's own wording ("a digit in a cell in a yin Yang region
// indicates how many cells in that yin Yang region contain the digit"), not
// narrowed to the other circles; all circles are given.
//
// Fog is solving UI (dynamic reveal), not a final-grid rule -- omitted.

const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('YY');

// +/-1 lines, transcribed from the drawn line paths. Several lines step
// diagonally between cells (e.g. R1C5-R2C6), so the relation is encoded with
// Pair over the line's own ordered cell list rather than WhiteDot, which only
// recognises orthogonally-adjacent cells.
const lines = [
  ['R1C2', 'R2C1'],
  ['R5C1', 'R6C1'],
  ['R8C1', 'R9C1'],
  ['R1C5', 'R2C6'],
  ['R1C6', 'R2C7'],
  ['R1C8', 'R2C9'],
  ['R3C7', 'R4C7', 'R5C6'],
  ['R3C5', 'R4C5', 'R4C4'],
  ['R4C3', 'R5C4', 'R6C5'],
  ['R6C4', 'R7C5', 'R8C4'],
  ['R9C2', 'R8C3', 'R9C3'],
  ['R7C7', 'R8C6'],
  ['R8C7', 'R9C7', 'R9C6'],
  ['R7C8', 'R8C8'],
  ['R3C1', 'R4C1'],
  ['R2C2', 'R3C3'],
  ['R7C2', 'R8C2'],
  ['R3C8', 'R4C8', 'R5C8'],
  ['R4C8', 'R5C7'],
];

// Twelve counting circles, transcribed from the drawn circle markers (all 12
// are plain white-filled, red/crimson-bordered circles; the differing exact
// hex shade and one 0.88-vs-0.82 width are drawing noise, not a second type).
const circles = [
  'R3C2', 'R3C1', 'R2C4', 'R2C6', 'R3C7', 'R5C6',
  'R6C7', 'R6C9', 'R7C8', 'R8C9', 'R7C5', 'R8C3',
];

const diffOneKey = Pair.fnToKey((a, b) => a === b + 1 || b === a + 1, shape);

const lineConstraints = lines.flatMap(cells => [
  new Pair(diffOneKey, '+/-1', ...cells),
  // Every cell on the line shares one shade: as many singleton sets as
  // cells, each required to hold the same value.
  new SameValues(cells.length, ...shade.at(cells)),
]);

// Circles, clause (a): a circle's digit counts how many of all 12 circles
// hold that digit -- CountingCircles' exact semantics, over every circle.
const circleCountAll = new CountingCircles(...circles);

// Circles, clause (b): a circle's digit also counts how many cells of its
// own shade, across the whole grid, hold that digit. One NFA per circle: it
// first reads the circle's own digit and shade (seeding the targets D and
// S), then sweeps every grid cell's (digit, shade) pair -- the circle's own
// cell included, since it is itself a same-shade cell holding D -- counting
// matches, and accepts only when the final count equals D. The count only
// grows, so a partial count already past D is a dead end and is pruned.
const allCellsInterleaved = graph.cells().flatMap(cell => [cell, shade.at(cell)]);

const regionCountSpec = NFA.encodeSpec({
  startState: { phase: 'seedDigit' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'seedDigit':
        return { phase: 'seedShade', digit: value };
      case 'seedShade':
        return { phase: 'scanValue', digit: state.digit, shade: value, count: 0 };
      case 'scanValue':
        return { ...state, phase: 'scanShade', valueMatch: value === state.digit };
      case 'scanShade': {
        const count = (state.valueMatch && value === state.shade)
          ? state.count + 1 : state.count;
        if (count > state.digit) return undefined;
        return { phase: 'scanValue', digit: state.digit, shade: state.shade, count };
      }
    }
  },
  accept: (state) => state.phase === 'scanValue' && state.count === state.digit,
}, 9);

const circleRegionCounts = circles.map(cell => new NFA(
  regionCountSpec,
  `region-count-${cell}`,
  cell, shade.at(cell), ...allCellsInterleaved,
));

return [
  shape,
  new Given('R1C9', 6),
  new YinYang(),
  // Nothing in the rules names one shade over the other, so swapping shaded
  // and unshaded everywhere is a symmetry of every rule above. Pin R1C1 to
  // the lower shade value to select one representative grid.
  new Given(shade.at('R1C1'), 1),
  ...lineConstraints,
  circleCountAll,
  ...circleRegionCounts,
];
