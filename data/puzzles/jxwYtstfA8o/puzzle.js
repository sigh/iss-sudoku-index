// Title: Happy Holiday Season
// Author: Panthera
// Video: https://www.youtube.com/watch?v=jxwYtstfA8o
// Source: https://sudokupad.app/q6rcz0d0og

// Normal sudoku. Antiknight: digits a knight's move apart cannot repeat.
//
// Knapp Daneben Japanese sums: every cell is either unshaded (red) or shaded
// white or blue. Read in physical order out from the grid (the ring nearest
// the grid last, continuing straight into the line), the squares outside
// each row/column give that line's maximal shaded runs in order: each run's
// colour must match its clue square's colour, and the listed clues are in
// bijection with the line's actual runs -- exactly one run per listed clue,
// no extra runs. "Knapp Daneben" ("just missed"): the printed number is
// never the run's true digit sum, only one more or one less than it, chosen
// independently for each run. A same-colour run may not directly follow
// another same-colour run without an unshaded cell between them, but two
// different-coloured runs may sit directly adjacent with no gap; both
// requirements fall out automatically from "run" meaning a *maximal*
// contiguous same-colour block, so neither needs its own encoding.
//
// Clue order verified against the known solution: of the four combinations
// (rows/columns x farthest-ring-first/nearest-ring-first), only
// farthest-ring-first for both rows and columns admits any consistent
// shading at all -- the other three leave some row or column with zero
// valid colourings.

const graph = cellGraph('9x9');

const UNSHADED = 1, WHITE = 2, BLUE = 3;
const shade = graph.makeOverlay('VS');
const shadeAt = cell => shade.at(cell);

// Off-by-one candidate sums for a printed clue number (a run's true sum must
// be positive, so 0's only reachable candidate is +1).
function candidates(n) {
  const out = [];
  if (n - 1 > 0) out.push(n - 1);
  if (n + 1 > 0) out.push(n + 1);
  return out;
}

// Row/column clue lists, farthest-ring-first (see header comment). Each
// entry is [colour, printed number].
const ROW_CLUES = {
  1: [['b', 7], ['b', 20]],
  2: [['b', 10], ['b', 1]],
  3: [['b', 10]],
  4: [['b', 2]],
  5: [['w', 7], ['b', 8], ['w', 5]],
  6: [['w', 9], ['b', 18]],
  7: [['b', 6], ['w', 12], ['b', 7]],
  8: [['b', 8], ['w', 14], ['b', 2]],
  9: [['b', 13], ['w', 26], ['b', 5]],
};
const COL_CLUES = {
  1: [['b', 18], ['w', 10], ['b', 13]],
  2: [['b', 3], ['w', 8], ['b', 14]],
  3: [['b', 6], ['w', 16], ['b', 2]],
  4: [['w', 3], ['b', 1]],
  5: [['w', 14]],
  6: [['w', 10]],
  7: [['b', 7], ['w', 6]],
  8: [['b', 3], ['b', 19], ['w', 0]],
  9: [['b', 8], ['w', 3], ['b', 27]],
};

const COLOR_CODE = { w: WHITE, b: BLUE };

// Builds an NFA over one line's interleaved (shade, digit, shade, digit...)
// values. `clues` is that line's ordered [colour, number] list. State
// tracks which clue is next/currently open (runIndex), whether a run is
// open, its colour, and its running digit sum.
function runSumSpec(clues) {
  const targets = clues.map(([c, n]) => ({ color: COLOR_CODE[c], cands: candidates(n) }));
  const sumOk = (idx, sum) => targets[idx].cands.includes(sum);
  return NFA.encodeSpec({
    startState: { stage: 'C', runIndex: 0, inRun: false, runColor: 0, runSum: 0 },
    transition: (state, value) => {
      if (state.stage === 'D') {
        // Digit cell: add to the currently open run's sum; irrelevant if
        // this cell turned out unshaded. Clamp at the open run's own
        // highest candidate + 1: a sink meaning "already too many to ever
        // match", which keeps the compiled state count bounded (the sum
        // would otherwise grow without limit across a long same-colour
        // run) without changing whether it can still close successfully.
        if (!state.inRun) return { ...state, stage: 'C' };
        const maxCand = Math.max(...targets[state.runIndex].cands);
        return { ...state, stage: 'C', runSum: Math.min(state.runSum + value, maxCand + 1) };
      }
      // stage === 'C': a shading value (UNSHADED/WHITE/BLUE).
      const { runIndex, inRun, runColor, runSum } = state;
      if (inRun) {
        if (value === runColor) {
          // Same run continues.
          return { stage: 'D', runIndex, inRun: true, runColor, runSum };
        }
        // The open run ends here -- its sum must match its own clue.
        if (!sumOk(runIndex, runSum)) return undefined;
        if (value === UNSHADED) {
          return { stage: 'D', runIndex: runIndex + 1, inRun: false, runColor: 0, runSum: 0 };
        }
        // A differently-coloured run starts immediately: no gap is required
        // between runs of different colours.
        const nextIndex = runIndex + 1;
        if (nextIndex >= targets.length) return undefined;
        if (targets[nextIndex].color !== value) return undefined;
        return { stage: 'D', runIndex: nextIndex, inRun: true, runColor: value, runSum: 0 };
      }
      // No run currently open.
      if (value === UNSHADED) {
        return { stage: 'D', runIndex, inRun: false, runColor: 0, runSum: 0 };
      }
      if (runIndex >= targets.length) return undefined;
      if (targets[runIndex].color !== value) return undefined;
      return { stage: 'D', runIndex, inRun: true, runColor: value, runSum: 0 };
    },
    accept: (state) => {
      if (state.inRun) {
        return state.runIndex === targets.length - 1 && sumOk(state.runIndex, state.runSum);
      }
      return state.runIndex === targets.length;
    },
  }, 9);
}

function lineConstraints(clueMap, cellsFn, label) {
  return Object.entries(clueMap).map(([n, clues]) => {
    const cells = cellsFn(Number(n));
    const interleaved = cells.flatMap(cell => [shadeAt(cell), cell]);
    return new NFA(runSumSpec(clues), `${label}${n}`, ...interleaved);
  });
}

// Every shading cell has the same 3-value domain; Replicate stamps the one
// template Given onto all 81 cells instead of 81 near-identical Givens.
const shadeTargets = graph.cells().map(shadeAt);
const shadeOrigin = shadeTargets[0];

return [
  new Shape('9x9'),
  new AntiKnight(),
  shade.toVar('Shading'),
  shade.makeReplicate(new Given(shadeOrigin, UNSHADED, WHITE, BLUE)),
  ...lineConstraints(ROW_CLUES, r => graph.row(r), 'row'),
  ...lineConstraints(COL_CLUES, c => graph.column(c), 'col'),
];
