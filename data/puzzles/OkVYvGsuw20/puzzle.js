// Title: Nurimisaki Sudoku
// Author: Mark Sweep
// Video: https://www.youtube.com/watch?v=OkVYvGsuw20
// Source: https://app.crackingthecryptic.com/sudoku/GjDNNTdp4r

// Normal sudoku, plus Nurimisaki: shade some cells so the unshaded cells form
// one orthogonally-connected area (ConnectedValues), with no 2x2 block wholly
// shaded or wholly unshaded (anti-mono NFA). Circles mark exactly the unshaded
// cells with exactly one unshaded orthogonal neighbour (the area's endpoints):
// encoded per-cell as "must be an endpoint" at the six drawn circles and "must
// not be an endpoint" everywhere else. None of this puzzle's circles carry a
// digit, so the "digit = length of the line out of the circle" clause has no
// instance to encode here. Orthogonally adjacent cells that are both unshaded
// must differ by at least 5 (a whisper gated on both cells' shade).

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// Drawn empty-circle underlays (six white circles marked on the grid).
const circles = ['R2C2', 'R3C4', 'R4C2', 'R5C5', 'R8C8', 'R3C9'];
const circleSet = new Set(circles);

// No 2x2 block may be all shaded or all unshaded: one NFA on the top-left
// block, replicated to every block origin.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    const allSame = next.every(v => v === next[0]);
    return allSame ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'no-mono-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Reads (self, ...orthogonal neighbours). Requires self unshaded and exactly
// one unshaded neighbour: the definition of a circled endpoint.
const mustBeEndpointMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, value) => {
    if (phase === 'start') {
      return value === UNSHADED ? { phase: 'on', count: 0 } : undefined;
    }
    // Clamp at 2: once the count passes 1 it can never satisfy count === 1
    // again, so 2 and above are one sink value (bounds the compiled state
    // count instead of growing with the neighbour list length).
    const next = Math.min(count + (value === UNSHADED ? 1 : 0), 2);
    return { phase: 'on', count: next };
  },
  accept: ({ phase, count }) => phase === 'on' && count === 1,
}, geometry.numValues);

// Reads (self, ...orthogonal neighbours). Shaded cells are free; an unshaded
// cell must NOT have exactly one unshaded neighbour (i.e. is not an endpoint).
const mustNotBeEndpointMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, value) => {
    if (phase === 'start') {
      return value === UNSHADED ? { phase: 'on', count: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    // Clamp at 2 (see mustBeEndpointMachine): count === 1 is the only
    // distinguished value for acceptance.
    const next = Math.min(count + (value === UNSHADED ? 1 : 0), 2);
    return { phase: 'on', count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count !== 1,
}, geometry.numValues);

const endpointRules = gridCells.map(cell => {
  const machine = circleSet.has(cell)
    ? mustBeEndpointMachine : mustNotBeEndpointMachine;
  return new NFA(machine, 'endpoint',
    ...shade.at([cell, ...graph.neighbours(cell)]));
});

// Reads (shadeA, digitA, shadeB, digitB) for an orthogonally adjacent pair.
// If both cells are unshaded their digits must differ by >= 5; otherwise the
// pair is unconstrained. Off-path cells' remaining symbols are skipped.
const MIN_DIFF = 5;
const pathWhisperMachine = NFA.encodeSpec({
  startState: { phase: 'aShade' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aShade':
        return value === UNSHADED
          ? { phase: 'aDigit' } : { phase: 'skip', left: 3 };
      case 'aDigit':
        return { phase: 'bShade', aDigit: value };
      case 'bShade':
        return value === UNSHADED
          ? { phase: 'bDigit', aDigit: state.aDigit }
          : { phase: 'skip', left: 1 };
      case 'bDigit': {
        const diff = Math.abs(state.aDigit - value);
        return diff >= MIN_DIFF ? { phase: 'done' } : undefined;
      }
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const pathWhispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(pathWhisperMachine, 'path-whisper',
    shade.at(cell), cell, shade.at(other), other)));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  new Given('R3C7', 5),
  shadeDomain,
  // Nurimisaki connectivity: the unshaded cells form one connected region.
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...endpointRules,
  ...pathWhispers,
];
