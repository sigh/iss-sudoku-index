// Title: Bridging The Mines
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=0jgxKnNxEvA
// Source: https://sudokupad.app/crqk2uytmu

// Normal Sudoku applies. Marked white/black dots are consecutive/ratio clues.
// The path-circle count rule is omitted: its circle-to-line attachment is not
// decidable from this drawing. Every circle is an unshaded Minesweeper clue.
// The shade layer obeys Yin-Yang rules.

const SHADED = 1;
const UNSHADED = 2;
const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// The dot positions come from the drawn white and black edge marks.
const whiteDots = [
  ['R4C3', 'R4C4'], ['R3C7', 'R4C7'], ['R5C9', 'R6C9'], ['R9C2', 'R9C3'],
];
const blackDots = [
  ['R5C1', 'R5C2'], ['R8C3', 'R8C4'], ['R9C6', 'R9C7'], ['R7C8', 'R8C8'],
];

// Every circle is shown on a cell and its digit counts shaded king-neighbours.
const circles = ['R9C1', 'R8C5', 'R1C1', 'R2C3', 'R3C5', 'R2C9', 'R3C8', 'R6C7', 'R4C5', 'R6C4'];
const mineMachine = NFA.encodeSpec({
  startState: { phase: 'circle' },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      return state.phase === 'target' ? { ...state, phase: 'neighbours' } : undefined;
    }
    if (state.phase === 'circle') return { phase: 'target', target: value, count: 0 };
    if (state.phase === 'neighbours') {
      return { ...state, count: state.count + (value === SHADED ? 1 : 0) };
    }
    return undefined;
  },
  accept: ({ phase, target, count }) => phase === 'neighbours' && target === count,
  maxDepth: 10,
}, geometry, { multiSegment: true });
const mineClues = circles.flatMap(circle => [
  new Given(shade.at(circle), UNSHADED),
  new NFA(mineMachine, `minesweeper-${circle}`, [circle], shade.at(graph.kingNeighbours(circle))),
]);

// A 2x2 shading block may not contain four equal shade states.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2', ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...mineClues,
  noMono2x2,
];
