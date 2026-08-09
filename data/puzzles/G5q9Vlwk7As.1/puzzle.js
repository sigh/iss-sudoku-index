// Title: Jocular Jaunt
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=G5q9Vlwk7As
// Source: https://tinyurl.com/2zz24c3v

// Standard 9x9 sudoku, given R5C5=5. Shade some cells: the outside clues give
// the sums of the contiguous shaded runs in that row/column, in the line's
// own left-to-right/top-to-bottom order, with at least one unshaded cell
// between runs. No other constraint on the shaded cells (no connectivity or
// shape rule is stated).

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// Build an NFA that scans one row/column's 9 cells (as [digit, shade, digit,
// shade, ...] symbols) and accepts exactly when the maximal shaded runs, in
// scan order, have sums matching `targets` one-to-one (same run count, same
// sums, in order). State:
//   - reqIdx: how many required runs have been matched so far,
//   - inRun: whether the scan is currently inside a shaded run,
//   - sum: that run's running sum, clamped at targets[reqIdx]+1 (a sink
//     value meaning "already too high to match") so the state stays bounded.
function runSumNFA(targets, cells) {
  const m = targets.length;
  const clamp = (idx, sum) => Math.min(sum, targets[idx] + 1);

  const spec = NFA.encodeSpec({
    startState: { stage: 'digit', reqIdx: 0, inRun: false, sum: 0 },
    transition: (state, value) => {
      // Stash the digit; the paired shade symbol (next) does the real work.
      if (state.stage === 'digit') {
        return {
          stage: 'flag', reqIdx: state.reqIdx, inRun: state.inRun,
          sum: state.sum, pendingDigit: value,
        };
      }
      const { reqIdx, inRun, sum, pendingDigit: d } = state;
      const wrap = body => ({ stage: 'digit', sum: 0, ...body });

      if (value === UNSHADED) {
        if (inRun) {
          // A run just ended: it must match the next required sum exactly.
          if (reqIdx >= m || sum !== targets[reqIdx]) return undefined;
          return wrap({ reqIdx: reqIdx + 1, inRun: false });
        }
        return wrap({ reqIdx, inRun: false });
      }

      // value === SHADED: continue or start a run.
      if (inRun) {
        if (reqIdx >= m) return undefined; // more shading than clues allow
        return wrap({ reqIdx, inRun: true, sum: clamp(reqIdx, sum + d) });
      }
      if (reqIdx >= m) return undefined;
      return wrap({ reqIdx, inRun: true, sum: clamp(reqIdx, d) });
    },
    // The scan always ends on a shade symbol (stage 'digit' again), so a run
    // still open at the end must be finalized here the same way.
    accept: (state) => {
      let { reqIdx, inRun, sum } = state;
      if (inRun) {
        if (reqIdx >= m || sum !== targets[reqIdx]) return false;
        reqIdx += 1;
      }
      return reqIdx === m;
    },
  }, 9);

  const interleaved = cells.flatMap(cell => [cell, shade.at(cell)]);
  return new NFA(spec, 'run-sum', ...interleaved);
}

// Outside-clue sums, transcribed from the border text overlays (row clue at
// R{row}C0, column clue at R0C{col}), in each line's own left-to-right /
// top-to-bottom reading order.
const rowTargets = {
  1: [2, 42],
  2: [4, 5, 7],
  3: [6, 30, 5],
  4: [8, 25, 3],
  5: [1, 30, 8],
  6: [3, 22, 6],
  7: [5, 23, 4],
  8: [7, 2],
  9: [45],
};
const colTargets = {
  1: [45],
  2: [4],
  3: [41, 3],
  4: [5, 27, 6],
  5: [4, 35, 2],
  6: [8, 19, 7],
  7: [6, 20, 8],
  8: [3, 5],
  9: [45],
};

const rowLines = Object.entries(rowTargets).map(
  ([r, targets]) => runSumNFA(targets, graph.row(Number(r))));
const colLines = Object.entries(colTargets).map(
  ([c, targets]) => runSumNFA(targets, graph.column(Number(c))));

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  shade.toVar('shade'),
  shadeDomain,
  ...rowLines,
  ...colLines,
];
