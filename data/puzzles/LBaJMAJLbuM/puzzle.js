// Title: Easter Egg
// Author: Panthera
// Video: https://www.youtube.com/watch?v=LBaJMAJLbuM
// Source: https://app.crackingthecryptic.com/sudoku/NFBfNpmhFQ

// Standard 9x9 sudoku (default rows/cols/3x3 boxes; the payload's 9
// hand-listed regions are each a plain 3x3 box). White dots: consecutive
// digits.
//
// Outside Japanese sums: shade some digits (a single grid-wide shading
// layer -- every row's and every column's block reading comes from the same
// per-cell shaded/unshaded state, so a shared overlay Var is required, not
// independent per-line placement choices). The clues outside a row/column
// are, in order, the sums of that line's maximal runs of consecutively
// shaded digits; "Blocks must be separated by at least one unshaded cell"
// is automatic once a run is read as a *maximal* shaded block. Each listed
// clue is closed out by exactly one run (the standard Japanese-sums
// bijection between listed clues and actual runs, matching how this
// puzzle family's other rows encode it, e.g. V4dYzQDM6R4).
//
// Clue order is farthest-from-grid first (the physical reading direction
// that continues straight into the grid; the convention verified against
// known solutions elsewhere in this family, e.g. V4dYzQDM6R4, jxwYtstfA8o,
// zz3Bh-R1xP8). A single-block line's one clue is stored in the source's
// near-to-grid slot; transcribed as that line's sole entry either way.

const graph = cellGraph('9x9');

// Shading overlay: 1 = unshaded, 2 = shaded.
const shade = graph.makeOverlay('VS');

// Outside clues, farthest-from-grid first, transcribed from the source's
// outside-clue band (rows 1-2 / cols 1-2 of the canvas).
const ROW_CLUES = {
  1: [4],
  2: [5, 4],
  3: [26],
  4: [14, 7],
  5: [10, 18],
  6: [38, 4],
  7: [14, 14],
  8: [37],
  9: [25],
};
const COL_CLUES = {
  1: [8],
  2: [14, 7],
  3: [4, 37],
  4: [20, 22],
  5: [26],
  6: [10, 3],
  7: [13, 16],
  8: [1, 13],
  9: [26],
};

// Scans an interleaved [digit, shade, digit, shade, ...] line. State tracks
// which clue (clueIndex) the current/next run must match, whether a run is
// currently open, and its running sum. A run closes (and must match
// clues[clueIndex] exactly) the moment an unshaded cell is seen; opening a
// new run is refused once every clue has already been used.
function runSumSpec(clues) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', clueIndex: 0, inRun: false, runSum: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        return { ...state, phase: 'shade', digit: value };
      }
      const { digit, clueIndex, inRun, runSum } = state;
      if (value === 2) {
        // Shaded: extend the open run, or open a new one.
        if (!inRun && clueIndex >= clues.length) return undefined;
        const nextSum = (inRun ? runSum : 0) + digit;
        if (nextSum > clues[clueIndex]) return undefined;
        return { phase: 'digit', clueIndex, inRun: true, runSum: nextSum };
      }
      // Unshaded: close any open run, requiring an exact clue match.
      if (inRun) {
        if (runSum !== clues[clueIndex]) return undefined;
        return { phase: 'digit', clueIndex: clueIndex + 1, inRun: false, runSum: 0 };
      }
      return { phase: 'digit', clueIndex, inRun: false, runSum: 0 };
    },
    accept: (state) => {
      // Every clue must be used: either all clues are already closed out, or
      // the line's last cell is mid-run and that run is the final clue.
      if (state.inRun) {
        return state.clueIndex + 1 === clues.length &&
          state.runSum === clues[state.clueIndex];
      }
      return state.clueIndex === clues.length;
    },
  }, 9);
}

function lineConstraints(clueMap, cellsFn, label) {
  return Object.entries(clueMap).map(([n, clues]) => {
    const cells = cellsFn(Number(n));
    const interleaved = cells.flatMap(cell => [cell, shade.at(cell)]);
    return new NFA(runSumSpec(clues), `${label}${n}`, ...interleaved);
  });
}

const shadeTargets = shade.at(graph.cells());
const shadeOrigin = shadeTargets[0];

const whiteDots = [
  ['R2C7', 'R2C8'],
  ['R8C4', 'R8C5'],
].map(([a, b]) => new WhiteDot(a, b));

return [
  new Shape('9x9'),
  shade.toVar('Shading'),
  shade.makeReplicate(
    [new Given(shadeOrigin, 1, 2)],
    shadeTargets,
  ),
  ...whiteDots,
  ...lineConstraints(ROW_CLUES, r => graph.row(r), 'row'),
  ...lineConstraints(COL_CLUES, c => graph.column(c), 'col'),
];
