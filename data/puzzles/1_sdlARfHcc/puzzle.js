// Title: Ornithological Adjacency
// Author: Jrosas
// Video: https://www.youtube.com/watch?v=1_sdlARfHcc
// Source: https://sudokupad.app/n2v6rs916k

// Normal sudoku rules apply.
//
// White dot: across the white dot the two digits are consecutive.
//
// Bird rule: some orthogonally adjacent cells are separated by a bird icon
// (8 species drawn: peacock, penguin, owl, dodo, dove, flamingo, parrot,
// duck). Each species indicates a specific digit ratio; every pair of
// digits separated by the same species shares that ratio (or an
// equivalent fraction, e.g. a 1:3 bird also allows 2:6 or 3:9). The rules
// do not say which ratio each species has - the solver must discover it -
// so each species's ratio is left genuinely unknown-but-shared rather than
// fixed from the known solution. Different species may end up with the
// same or a different ratio; nothing in the rules forbids either.
// "Not all possible birds are given" is flavour text: no negative
// inference is drawn from an unmarked adjacency.

// Species -> its drawn edges (orthogonally adjacent cell pairs), taken
// directly from the overlay geometry.
const SPECIES = {
  peacock: [['R7C7', 'R7C8'], ['R8C1', 'R9C1'], ['R4C4', 'R5C4'], ['R2C8', 'R2C9']],
  penguin: [['R1C7', 'R1C8'], ['R2C9', 'R3C9'], ['R1C2', 'R2C2']],
  owl: [['R5C3', 'R6C3'], ['R8C1', 'R8C2'], ['R5C2', 'R5C3']],
  dodo: [['R6C8', 'R6C9'], ['R4C2', 'R4C3']],
  dove: [['R1C5', 'R2C5'], ['R2C8', 'R3C8'], ['R9C1', 'R9C2'], ['R6C9', 'R7C9']],
  flamingo: [['R4C8', 'R5C8'], ['R8C2', 'R8C3'], ['R6C4', 'R7C4']],
  parrot: [['R3C3', 'R3C4'], ['R4C5', 'R4C6'], ['R7C2', 'R8C2'], ['R6C2', 'R7C2'], ['R4C6', 'R5C6']],
  duck: [['R6C4', 'R6C5'], ['R6C5', 'R6C6'], ['R8C4', 'R8C5'], ['R3C1', 'R4C1']],
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

// One compact NFA per species: read its edges' cells two at a time
// (each edge contributes an (a, b) pair). The state carries the ratio
// (in lowest terms) discovered from the first completed pair - not a
// value chosen up front - and every later pair must reduce to that same
// ratio. This lets the solver find each species' shared ratio itself
// instead of the encoding asserting one.
const ratioNFA = (edges) => {
  const cells = edges.flat();
  const spec = NFA.encodeSpec({
    // phase 0: about to read the first cell of a pair.
    // phase 1: read `first`, about to read the second cell of the pair.
    // ratio: [p, q] (p < q, coprime) fixed by the first completed pair,
    // or null before any pair has completed.
    startState: { phase: 0, first: null, ratio: null },

    transition: (state, value) => {
      if (state.phase === 0) {
        return { phase: 1, first: value, ratio: state.ratio };
      }
      const x = state.first, y = value;
      const g = gcd(x, y);
      const p = Math.min(x, y) / g, q = Math.max(x, y) / g;
      if (state.ratio === null) {
        return { phase: 0, first: null, ratio: [p, q] };
      }
      if (state.ratio[0] === p && state.ratio[1] === q) {
        return { phase: 0, first: null, ratio: state.ratio };
      }
      return undefined;
    },

    // Must end having just completed a pair (even number of cells, which
    // is always true here: two cells per edge).
    accept: (state) => state.phase === 0,
  }, 9);
  return { spec, cells };
};

return [
  new Shape('9x9'),

  new WhiteDot('R8C7', 'R9C7'),

  ...Object.entries(SPECIES).map(([name, edges]) => {
    const { spec, cells } = ratioNFA(edges);
    return new NFA(spec, name, ...cells);
  }),
];
