// Title: Japanese Festival
// Author: Leon van Houwelingen
// Video: https://www.youtube.com/watch?v=V4dYzQDM6R4
// Source: https://sudokupad.app/kc2ucszwlb

// Normal sudoku rules apply.
//
// X: digits separated by an X sum to 10 (one X clue, between R2C3 and
// R2C4). Only this one pair is marked; no negative claim about other pairs.
//
// Japanese sums: shade some digits. The numbers outside each row/column are,
// in the given order, the sums of that line's maximal runs of consecutively
// shaded digits. The listed numbers and the runs stand in bijection, and this
// follows from the rules text alone: "the digits outside the grid show the
// sum of continuous runs of shaded digits in the given order" makes each
// listed number the sum of a distinct run, so a line has at least as many
// runs as it has clues; "there can be no more consecutive runs...than those
// listed" caps the runs at the clue count. The two bounds meet at exactly one
// run per listed clue -- which is also the standard Japanese-sums reading.
// So every listed clue is closed out by exactly one run. (Encoding the cap
// sentence alone as a loose "at most" -- letting a line use only a prefix of
// its clues, or skip a lone-clue line entirely -- is thus wrong on the text,
// not merely on uniqueness.) "Runs are separated by at least one unshaded
// cell" needs no separate encoding: a run is, by construction, a maximal
// block of shaded cells, so two runs are always separated by unshaded cells.

const graph = cellGraph('9x9');

// Shading overlay: 1 = unshaded, 2 = shaded.
const shade = graph.makeOverlay('VS');
const shadeAt = cell => shade.at(cell);

// Outside clues, decoded from the SudokuPad underlay stack. Each ring
// farther from the grid is listed before the ring closer to the grid,
// matching the physical reading direction (left-to-right for rows,
// top-to-bottom for columns) that continues straight into the grid itself.
// Verified against the known solution: this axis assignment and reading
// direction is the only one of the four combinations (rows/cols x
// forward/reversed) for which a consistent shading exists.
const ROW_CLUES = {
  1: [34],
  2: [30],
  3: [1, 8],
  4: [7, 2],
  5: [6, 21],
  6: [20, 2, 1],
  7: [15, 4, 7, 5],
  8: [23, 11],
  9: [9],
};
const COL_CLUES = {
  1: [9],
  2: [25],
  3: [9, 11],
  4: [42],
  5: [12],
  6: [11, 9],
  7: [10, 8, 9],
  8: [10, 4, 2],
  9: [35],
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
    const interleaved = cells.flatMap(cell => [cell, shadeAt(cell)]);
    return new NFA(runSumSpec(clues), `${label}${n}`, ...interleaved);
  });
}

const shadeTargets = graph.cells().map(shadeAt);
const shadeOrigin = shadeTargets[0];

return [
  new Shape('9x9'),
  shade.toVar('Shading'),
  shade.makeReplicate(
    [new Given(shadeOrigin, 1, 2)],
    shadeTargets,
  ),
  new X('R2C3', 'R2C4'),
  ...lineConstraints(ROW_CLUES, r => graph.row(r), 'row'),
  ...lineConstraints(COL_CLUES, c => graph.column(c), 'col'),
];
