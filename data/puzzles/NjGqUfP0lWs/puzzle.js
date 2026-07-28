// Title: Medieval Buffet
// Author: Manta Ray
// Video: https://www.youtube.com/watch?v=NjGqUfP0lWs
// Source: https://sudokupad.app/t2HrhT8rMM

// Encode the jigsaw grid, the two connected shades, non-monochromatic 2x2s,
// shade-selected arrow sums, and shade-region cage sums. The supplied shaded
// sandwich total is 9 above active column C8. The all-different condition on
// the remaining row and column sandwich totals is omitted.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// Drawn jigsaw-region cells, transcribed from the source regions after removing
// the one-cell top and left canvas frame.
const regions = [
  ['R1C7','R1C8','R1C9','R2C7','R2C8','R2C9','R3C9','R3C8','R3C7'],
  ['R2C1','R2C2','R2C3','R3C1','R3C2','R3C3','R1C1','R1C2','R1C3'],
  ['R4C1','R4C2','R4C3','R5C1','R5C2','R5C3','R6C3','R6C2','R6C1'],
  ['R4C7','R4C8','R4C9','R5C7','R5C8','R5C9','R6C7','R6C8','R6C9'],
  ['R3C4','R2C4','R1C4','R1C5','R1C6','R2C6','R2C5','R3C5','R3C6'],
  ['R6C5','R6C6','R6C4','R5C4','R4C4','R4C5','R4C6','R5C6','R5C5'],
  ['R8C1','R8C2','R8C3','R9C1','R9C2','R9C3','R7C3','R7C2','R7C1'],
  ['R8C5','R8C6','R9C5','R9C6','R7C6','R7C5','R7C4','R8C4','R9C4'],
  ['R7C7','R7C9','R7C8','R8C7','R8C8','R8C9','R9C9','R9C8','R9C7'],
];

// No 2x2 block may be all shaded or all unshaded.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, 9);
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2', ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// Each branch fixes an arrow's shade pattern, then sums exactly the arm cells
// whose shade matches the circle's shade.
function shadeArrow(circle, arms) {
  const cells = [circle, ...arms];
  return new Or(Array.from({ length: 1 << cells.length }, (_, mask) => {
    const colors = cells.map((_, i) => (mask & (1 << i)) ? SHADED : UNSHADED);
    const selected = arms.filter((_, i) => colors[i + 1] === colors[0]);
    if (!selected.length) return null;
    return new And([
      ...shade.at(cells).map((cell, i) => new Given(cell, colors[i])),
      new EqualSum([circle], selected),
    ]);
  }).filter(Boolean));
}

const arrows = [
  ['R2C1', ['R1C2','R1C3']],
  ['R3C5', ['R3C4','R3C3','R2C2','R1C1']],
  ['R3C5', ['R2C6','R1C5','R1C4']],
  ['R5C7', ['R5C6','R5C5','R4C4']],
  ['R2C7', ['R2C8','R1C9']],
  ['R4C5', ['R4C6','R4C7','R4C8','R4C9','R5C9']],
  ['R4C5', ['R3C4','R2C3']],
  ['R5C3', ['R6C4','R6C5','R6C6']],
  ['R3C2', ['R4C3','R5C4','R5C5']],
  ['R8C1', ['R7C1','R6C1','R5C1','R4C1']],
  ['R8C1', ['R9C1','R9C2']],
].map(([circle, arms]) => shadeArrow(circle, arms));

function isConnected(cells) {
  if (!cells.length) return true;
  const pending = [cells[0]];
  const seen = new Set(pending);
  while (pending.length) {
    const cell = pending.pop();
    const { row, col } = parseCellId(cell);
    for (const other of cells) {
      const pos = parseCellId(other);
      if (!seen.has(other) && Math.abs(pos.row - row) + Math.abs(pos.col - col) === 1) {
        seen.add(other);
        pending.push(other);
      }
    }
  }
  return seen.size === cells.length;
}

// Drawn cage cells and totals. When both shades occur, each shade's cells must
// be one orthogonal region; either displayed shade-region may supply the total.
function shadeCage(cells, total) {
  return new Or(Array.from({ length: 1 << cells.length }, (_, mask) => {
    const shaded = cells.filter((_, i) => mask & (1 << i));
    const unshaded = cells.filter((_, i) => !(mask & (1 << i)));
    if (shaded.length && unshaded.length && (!isConnected(shaded) || !isConnected(unshaded))) return null;
    const sums = [shaded, unshaded].filter(group => group.length).map(group => new Sum(total, ...group));
    return new And([
      ...shade.at(cells).map((cell, i) => new Given(cell, (mask & (1 << i)) ? SHADED : UNSHADED)),
      new Or(sums),
    ]);
  }).filter(Boolean));
}

const cages = [
  [23, ['R2C7','R2C8','R2C9','R3C9','R4C9','R3C8','R3C7']],
  [16, ['R5C8','R5C9','R6C9']],
  [10, ['R4C1','R4C2','R4C3']],
  [27, ['R6C1','R7C1','R8C1','R9C1','R9C2','R8C2']],
  [6, ['R1C1','R2C1','R2C2','R2C3','R3C3']],
].map(([total, cells]) => shadeCage(cells, total));

// This NFA reads digit/shade pairs and accepts exactly when the shaded digits
// strictly between the 1 and 9 sum to the supplied sandwich total.
function shadedSandwich(total, cells) {
  const machine = NFA.encodeSpec({
    startState: { phase: 'digit', started: false, finished: false, pending: 0, sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        const endpoint = value === 1 || value === 9;
        if (!state.started && endpoint) return { phase: 'shade', started: true, finished: false, pending: 0, sum: 0 };
        if (state.started && !state.finished && endpoint) return { phase: 'shade', started: true, finished: true, pending: 0, sum: state.sum };
        return { ...state, phase: 'shade', pending: state.started && !state.finished ? value : 0 };
      }
      const sum = state.sum + (state.pending && value === SHADED ? state.pending : 0);
      return sum > total ? undefined : { ...state, phase: 'digit', pending: 0, sum };
    },
    accept: state => state.phase === 'digit' && state.started && state.finished && state.sum === total,
    maxDepth: cells.length * 2,
  }, 9);
  return new NFA(machine, `shaded-sandwich-${total}`, ...cells.flatMap(cell => [cell, shade.at(cell)]));
}

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...arrows,
  ...cages,
  shadedSandwich(9, graph.column('R1C8')),
];
