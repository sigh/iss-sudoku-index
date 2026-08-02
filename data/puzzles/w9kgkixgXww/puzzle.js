// Title: Yin-Yang Thermos
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=w9kgkixgXww
// Source: https://app.crackingthecryptic.com/sudoku/489rPm6j4f

// Normal Sudoku, Yin-Yang shading, row-9 shade counts, and the columnwise
// hidden thermometers are encoded. Red dots sum to 9; circled digits are +9
// only when their shaded-column order is compared.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// The two shade states cover every cell.
const shadeDomain = shade.makeReplicate(
  new Given(shade.at(gridCells[0]), SHADED, UNSHADED));

// Every 2x2 must contain both shade states. The drawn puzzle supplies no
// pre-shaded cells; shaded/unshaded labels are fixed by the row-9 count rule.
const noMono2x2Spec = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: state => state.done === true,
}, 9);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Spec, 'no-monochrome-2x2',
    ...shade.at(graph.block('R1C1', 2, 2))),
  shade.at(blockOrigins));

// Row-9 digits count shaded cells in their own columns. Each scan reads the
// nine shade flags followed by that column's row-9 digit.
const shadeCountSpec = NFA.encodeSpec({
  startState: { index: 0, count: 0 },
  transition: (state, value) => {
    if (state.index < 9) {
      if (value !== SHADED && value !== UNSHADED) return undefined;
      return { index: state.index + 1, count: state.count + (value === SHADED ? 1 : 0) };
    }
    return value === state.count ? { index: 10, count: state.count } : undefined;
  },
  accept: state => state.index === 10,
}, 9);
const shadeCounts = Array.from({ length: 9 }, (_, col) => {
  const cells = graph.column(col + 1);
  return new NFA(shadeCountSpec, `shaded-count-column-${col + 1}`,
    ...shade.at(cells), makeCellId(9, col + 1));
});

// Circled cells, from the four white circular underlays. Their effective
// values are digit + 9 in the shaded-digit column ordering.
const circles = new Set(['R2C4', 'R2C7', 'R3C7', 'R5C7']);
function shadedOrderSpec(columnCells, direction) {
  return NFA.encodeSpec({
    startState: { phase: 'shade', index: 0, previous: null },
    transition: (state, value) => {
      if (state.phase === 'shade') {
        if (value !== SHADED && value !== UNSHADED) return undefined;
        return { ...state, phase: 'digit', currentShade: value };
      }
      const effective = value + (circles.has(columnCells[state.index]) ? 9 : 0);
      if (state.currentShade === SHADED && state.previous !== null &&
          (direction === 'up' ? effective <= state.previous : effective >= state.previous)) {
        return undefined;
      }
      return {
        phase: 'shade',
        index: state.index + 1,
        previous: state.currentShade === SHADED ? effective : state.previous,
      };
    },
    accept: state => state.phase === 'shade' && state.index === 9,
    maxDepth: 18,
  }, 9);
}
const hiddenThermos = Array.from({ length: 9 }, (_, col) => {
  const cells = graph.column(col + 1);
  const scan = cells.flatMap(cell => [shade.at(cell), cell]);
  return new Or([
    new NFA(shadedOrderSpec(cells, 'up'), `shaded-up-column-${col + 1}`, ...scan),
    new NFA(shadedOrderSpec(cells, 'down'), `shaded-down-column-${col + 1}`, ...scan),
  ]);
});

// Red edge overlays, provenance: the three red rounded marks in the payload.
const redDots = [
  ['R2C2', 'R3C2'],
  ['R4C5', 'R4C6'],
  ['R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  shade.toVar('yin-yang shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...shadeCounts,
  ...hiddenThermos,
  ...redDots.map(cells => new Sum(9, ...cells)),
];
