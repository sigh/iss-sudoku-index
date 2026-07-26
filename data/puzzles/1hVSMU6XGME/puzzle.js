// Title: Box 8 is Sus!
// Author: Panthera
// Video: https://www.youtube.com/watch?v=1hVSMU6XGME
// Source: https://sudokupad.app/7ry8w31ry3

// Normal Sudoku, plus Japanese Sums with a solver-discovered shading layer
// (each cell shaded or unshaded): outside clues give, in order, the digit-sums
// of the maximal shaded runs in that row/column. The imposter twist: for each
// row and column independently, its whole clue set may instead describe the
// UNshaded runs (never a mix within one line -- one flag per line), and the
// row-5 clue was erased outright (no constraint for that row beyond normal
// Sudoku, the columns, and the global count). Fewer cells are shaded than
// unshaded overall.
//
// Outside-clue order is farthest-from-grid first (the reading order of the
// whole picture: outermost label, then inward, then the grid).

const SHADED = 1;
const UNSHADED = 2;

// Clue lists in farthest-to-nearest order == first-run-to-last-run order,
// transcribed from the underlay text badges. `null` means no surviving clue
// for that line.
const ROW_CLUES = [
  [19],
  [7, 31, 4],
  [3, 20],
  [1, 7, 8],
  null, // row 5: erased entirely
  [8, 22],
  [4, 32, 5],
  [6, 10, 4],
  [20, 13],
];
const COL_CLUES = [
  [16, 28],
  [5, 30],
  [9, 4, 12],
  [3, 6, 13],
  [14, 15, 4],
  [38],
  [41],
  [42],
  [13, 19],
];

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const shadeVar = shade.toVar('shaded state');
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// One flag Var per clued line: its value is the shade this line's clue list
// targets (SHADED or UNSHADED), read as the first symbol of that line's NFA.
const CLUED_LINES = [
  ...ROW_CLUES.map((clues, i) => ({ clues, cells: graph.row(i + 1) })),
  ...COL_CLUES.map((clues, i) => ({ clues, cells: graph.column(i + 1) })),
].filter(line => line.clues !== null);
const flags = new Var('F', 'clue line target-shade flags', CLUED_LINES.length);
const flagDomain = flags.cells().map(cell => new Given(cell, SHADED, UNSHADED));

// Scans [flag, digit1, shade1, digit2, shade2, ...]. `target` (from the flag)
// is the shade whose maximal runs must sum, in order, to `clues`. `pending`
// holds a read digit until its paired shade cell arrives. A non-target cell
// closes any open run, which must match `clues[idx]` exactly before `idx`
// advances; finishing with an unmatched or under-run clue rejects.
function lineNFA(clues) {
  const spec = NFA.encodeSpec({
    startState: { phase: 'flag' },
    transition: (state, value) => {
      if (state.phase === 'flag') {
        // Normalize to {SHADED, UNSHADED} so off-domain compile-time probes
        // (the flag cell's real candidates are given as just those two) don't
        // fork the target field into up to 9 branches.
        const target = value === SHADED ? SHADED : UNSHADED;
        return { phase: 'digit', target, idx: 0, sum: 0 };
      }
      if (state.phase === 'digit') {
        return { ...state, phase: 'shade', pending: value };
      }
      // phase === 'shade'
      const { target, idx, sum, pending } = state;
      if (value === target) {
        // A target-colour cell once every expected run is already closed
        // starts an unlisted extra run: reject immediately rather than
        // growing sum without bound.
        if (idx >= clues.length) return undefined;
        const cap = clues[idx] + 1;
        return { phase: 'digit', target, idx, sum: Math.min(sum + pending, cap) };
      }
      if (sum > 0) {
        if (idx >= clues.length || clues[idx] !== sum) return undefined;
        return { phase: 'digit', target, idx: idx + 1, sum: 0 };
      }
      return { phase: 'digit', target, idx, sum: 0 };
    },
    accept: (state) => {
      if (state.phase !== 'digit') return false;
      if (state.sum > 0) {
        return state.idx < clues.length && clues[state.idx] === state.sum &&
          state.idx + 1 === clues.length;
      }
      return state.idx === clues.length;
    },
    maxDepth: 19,
  }, 9);
  return spec;
}

const interleave = (lineCells) => {
  const shadeCells = shade.at(lineCells);
  return lineCells.flatMap((cell, i) => [cell, shadeCells[i]]);
};

const clueNFAs = CLUED_LINES.map((line, i) => new NFA(
  lineNFA(line.clues), 'outside clue', [flags.cell(i + 1), ...interleave(line.cells)]));

// Global: fewer shaded cells than unshaded, scanned as a running
// shaded-minus-unshaded difference over every shade cell; must finish negative.
const shadedLessThanUnshadedSpec = NFA.encodeSpec({
  startState: 0,
  transition: (diff, value) => value === SHADED ? diff + 1 : diff - 1,
  accept: (diff) => diff < 0,
  maxDepth: 81,
}, 9);
const shadedLessThanUnshaded = new NFA(
  shadedLessThanUnshadedSpec, 'shaded < unshaded', shade.cells());

return [
  new Shape('9x9'),
  shadeVar,
  shadeDomain,
  flags,
  ...flagDomain,
  ...clueNFAs,
  shadedLessThanUnshaded,
];
