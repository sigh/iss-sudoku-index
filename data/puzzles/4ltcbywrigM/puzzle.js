// Title: Whispers in the mist
// Author: pdyxs
// Video: https://www.youtube.com/watch?v=4ltcbywrigM
// Source: https://sudokupad.app/usquoo8ao3

// Standard sudoku plus Yin-Yang shading (both colours orthogonally
// connected, no 2x2 block monochrome; shading itself is not given -- the
// solver discovers it). Fog/reveal state is solving UI and is not encoded.
// Unshaded Whispers: two orthogonally adjacent cells that are BOTH unshaded
// must differ by >= 5; a pair with a shaded side is unconstrained. Kropki:
// three white dots (consecutive digits). The rules' "Given Digits" clause is
// not encoded -- no digit, colour, or position data for it is recoverable;
// it is the puzzle's own joke ("But ... the Given Digit is WHITE!").

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

// White-dot (Kropki, consecutive) edges, from the source's three drawn
// edge-sized white/black-bordered dot overlays.
const dots = [
  ['R2C7', 'R2C8'],
  ['R3C6', 'R3C7'],
  ['R6C6', 'R7C6'],
];
const dotRules = dots.map(([a, b]) => new WhiteDot(a, b));

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

// Unshaded Whispers: reads (shadeA, digitA, shadeB, digitB) for an
// orthogonally adjacent pair. If both shades are UNSHADED, the digits must
// differ by >= 5; otherwise the pair is unconstrained (skip on either side).
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'aShade' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aShade':
        return { phase: 'aDigit', active: value === UNSHADED };
      case 'aDigit':
        return { phase: 'bShade', active: state.active, aDigit: value };
      case 'bShade':
        return {
          phase: 'bDigit',
          active: state.active && value === UNSHADED,
          aDigit: state.aDigit,
        };
      case 'bDigit':
        if (!state.active) return { phase: 'done' };
        return Math.abs(state.aDigit - value) >= 5 ? { phase: 'done' } : undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
// Right/down steps only: each orthogonal pair is covered once.
const whispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(whisperMachine, 'unshaded-whisper',
    shade.at(cell), cell, shade.at(other), other)));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  // Yin-Yang connectivity: each shade forms one orthogonally connected region.
  new ConnectedValues('VS', SHADED),
  new ConnectedValues('VS', UNSHADED),
  noMono2x2,
  ...dotRules,
  ...whispers,
];
