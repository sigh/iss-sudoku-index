// Title: Yin Doubles Yang
// Author: damo_89
// Video: https://www.youtube.com/watch?v=ZZglfDTQ2zQ
// Source: https://sudokupad.app/p0xbzd5rlx

// Normal Sudoku applies. Yin-Yang shading uses two connected orthogonal regions
// with no monochrome 2x2 block. Each drawn cage has distinct digits and sums its
// digits with shaded digits counted twice.

const SHADED = 2;
const UNSHADED = 1;
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const cells = graph.cells();

// Every shade overlay cell is one of the two Yin-Yang states.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// A 2x2 shade sequence is accepted only when it contains both shade values.
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
  new NFA(noMono2x2Machine, 'no-mono-2x2', ...shade.at(graph.block(cells[0], 2, 2))),
  shade.at(cells.filter(cell => graph.block(cell, 2, 2))));

// Drawn cage cells and corner totals from the source payload.
const cages = [
  [51, ['R8C1', 'R8C2', 'R9C1', 'R9C2']],
  [19, ['R1C1', 'R2C1']], [19, ['R1C4', 'R2C3', 'R2C4']],
  [28, ['R2C5', 'R3C5']], [39, ['R8C4', 'R8C5', 'R8C6']],
  [20, ['R9C8', 'R9C9']], [9, ['R8C8', 'R8C9']],
  [10, ['R7C7', 'R8C7']], [7, ['R4C9', 'R5C9', 'R6C9']],
  [35, ['R2C7', 'R2C8', 'R2C9', 'R3C8']], [12, ['R1C6', 'R2C6']],
  [12, ['R3C6', 'R3C7', 'R4C6']], [49, ['R4C7', 'R4C8', 'R5C6', 'R5C7']],
  [12, ['R5C5', 'R6C5']], [10, ['R7C5', 'R7C6']],
  [15, ['R7C2', 'R7C3']], [11, ['R4C3', 'R5C3']], [16, ['R4C4', 'R4C5']],
];

// The NFA reads each cage as digit, shade, ...; its state stores the pending
// digit and adds digit * shade after each shade flag (2 shaded, 1 unshaded).
function doubledCage(total, cageCells) {
  const machine = NFA.encodeSpec({
    startState: { sum: 0 },
    transition: (state, value) => {
      if (state.digit === undefined) return { sum: state.sum, digit: value };
      const sum = state.sum + state.digit * value;
      return sum <= total ? { sum } : undefined;
    },
    accept: state => state.digit === undefined && state.sum === total,
  }, 9);
  return new NFA(machine, `doubled-cage-${total}`,
    ...cageCells.flatMap(cell => [cell, shade.at(cell)]));
}

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...cages.flatMap(([total, cageCells]) => [
    new AllDifferent(...cageCells),
    doubledCage(total, cageCells),
  ]),
];
