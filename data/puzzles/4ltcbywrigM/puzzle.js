// Title: Whispers in the mist
// Author: pdyxs
// Video: https://www.youtube.com/watch?v=4ltcbywrigM
// Source: https://sudokupad.app/usquoo8ao3

// Standard sudoku plus Yin-Yang shading (native YinYang constraint; shading
// itself is not given -- the solver discovers it). Fog/reveal state is
// solving UI and is not encoded.
// Unshaded Whispers: two orthogonally adjacent cells that are BOTH unshaded
// must differ by >= 5; a pair with a shaded side is unconstrained. Kropki:
// three white dots (consecutive digits). The rules' "Given Digits" clause is
// not encoded -- no digit, colour, or position data for it is recoverable;
// it is the puzzle's own joke ("But ... the Given Digit is WHITE!").

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');
const gridCells = graph.cells();

// White-dot (Kropki, consecutive) edges, from the source's three drawn
// edge-sized white/black-bordered dot overlays.
const dots = [
  ['R2C7', 'R2C8'],
  ['R3C6', 'R3C7'],
  ['R6C6', 'R7C6'],
];
const dotRules = dots.map(([a, b]) => new WhiteDot(a, b));

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
  new YinYang(),
  ...dotRules,
  ...whispers,
];
