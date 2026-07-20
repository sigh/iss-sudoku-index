// Title: Chaos Construc-to-N
// Author: mellowrobinson
// Video: https://www.youtube.com/watch?v=px_YBffmcRY
// Source: https://sudokupad.app/g7mtvua99q

// Each clue scans alternating grid digits and chaos-region labels. Before digit N,
// it accumulates the clue sum and requires a single region; N must then be in a
// different region. A null total represents a question mark (any positive sum).

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

const CLUES = [
  { side: 'top', index: 2, total: 23 },
  { side: 'top', index: 4, total: null },
  { side: 'top', index: 8, total: null },
  { side: 'bottom', index: 1, total: 30 },
  { side: 'bottom', index: 4, total: 21 },
  { side: 'bottom', index: 8, total: 19 },
  { side: 'bottom', index: 9, total: null },
  { side: 'left', index: 1, total: null },
  { side: 'left', index: 3, total: null },
  { side: 'left', index: 4, total: 24 },
  { side: 'left', index: 5, total: null },
  { side: 'left', index: 6, total: null },
  { side: 'left', index: 7, total: null },
  { side: 'left', index: 8, total: null },
  { side: 'right', index: 1, total: null },
  { side: 'right', index: 5, total: 21 },
  { side: 'right', index: 8, total: null },
  { side: 'right', index: 9, total: null },
];

const lineCells = ({ side, index }) => {
  const cells = side === 'top' || side === 'bottom'
    ? graph.column(index)
    : graph.row(index);
  return side === 'bottom' || side === 'right' ? [...cells].reverse() : cells;
};

const machineFor = (target, total) => NFA.encodeSpec({
  startState: { phase: 'digit', mode: 'prefix', sum: 0, region: 0 },
  transition(state, value) {
    const { phase, mode, sum, region } = state;

    if (phase === 'digit') {
      if (mode === 'done') return { phase: 'region', mode };
      if (value === target) {
        const sumMatches = total === null ? sum === 1 : sum === total;
        return sumMatches ? { phase: 'region', mode: 'target', sum, region } : undefined;
      }
      // For a '?' clue only positivity matters, so 1 is the canonical nonempty sum.
      const nextSum = total === null ? 1 : sum + value;
      if (total !== null && nextSum > total) return undefined;
      return { phase: 'region', mode: 'prefix', sum: nextSum, region };
    }

    if (mode === 'prefix') {
      if (region !== 0 && value !== region) return undefined;
      return { phase: 'digit', mode, sum, region: region || value };
    }
    if (mode === 'target') {
      if (region === 0 || value === region) return undefined;
      return { phase: 'digit', mode: 'done' };
    }
    return { phase: 'digit', mode: 'done' };
  },
  accept: ({ phase, mode }) => phase === 'digit' && mode === 'done',
}, 9);

const upToN = CLUES.map(clue => {
  const cells = lineCells(clue);
  const interleaved = cells.flatMap(cell => [cell, cc.at(cell)]);
  const label = `${clue.side} ${clue.index}: ${clue.total === null ? '?' : clue.total}`;
  return new NFA(machineFor(clue.index, clue.total), label, ...interleaved);
});

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...upToN,
];
