// Title: Cross The Sums
// Author: abed hawila
// Video: https://www.youtube.com/watch?v=r3killZw18w
// Source: https://app.crackingthecryptic.com/sudoku/hf4GBqrgDJ

// Standard 9x9 sudoku, no givens. Shade some cells: the shaded cells form a
// single orthogonally connected group, and no 2x2 area is totally shaded.
// Outside clues (one per row/column, up to 3 stacked slots) give the sums of
// that row/column's contiguous shaded blocks in the row/column's own
// left-to-right / top-to-bottom order: a number is an exact block sum, "?" a
// single-digit block sum, "??" a double-digit block sum, and "*" any number
// of blocks (including zero) with unconstrained sum inserted at that point
// in the sequence.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every shade Var is either shaded or unshaded.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, SHADED, UNSHADED));

// "No 2x2 area within the grid can be totally shaded": at least one cell of
// every 2x2 window is unshaded. Replicated across every 2x2 origin
// (graph.block returns null past the grid edge, so blockOrigins is exactly
// the 8x8 overlapping windows).
const not4Shaded = new Or(
  shade.at(graph.block(gridCells[0], 2, 2)).map(cell => new Given(cell, UNSHADED)));
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noFullyShaded2x2 = shade.makeReplicate(not4Shaded, shade.at(blockOrigins));

// Build an NFA that scans one row or column's 9 cells (as [digit, shade,
// digit, shade, ...] symbols) against its outside-clue token sequence.
//
// `tokens` holds the clue slots nearest-to-grid last, each '*' (wildcard),
// '?' (single-digit block), '??' (double-digit block), or a number (exact
// block sum). A '*' does not itself consume a block: it marks that zero or
// more unconstrained-sum blocks may occur at that point before the next
// required (non-'*') block. The state machine tracks:
//   - reqIdx: index of the next required block clue still to be satisfied,
//   - phase: 'idle' (not currently inside a shaded run), 'committed'
//     (inside a run being matched against required[reqIdx]), or 'free'
//     (inside a run permitted by a '*' and whose sum is unconstrained),
//   - sum: running sum of the current 'committed' run, clamped once it can
//     only pass or only fail (so the compiled state stays small),
//   - a digit/flag stage pair, since the scan alternates digit then shade
//     symbols and a run's sum needs both together.
// On an idle shaded cell where a '*' precedes the pending required block,
// the machine branches (NFA disjunction) into both "this run is the next
// required block" and "this run is an extra free block" -- exactly one
// branch survives to the far end for a valid grid.
function blockPatternNFA(tokens, cells) {
  const required = [];
  const starBeforeReq = [];
  let pendingStar = false;
  for (const tok of tokens) {
    if (tok === '*') { pendingStar = true; continue; }
    const spec = tok === '?' ? { type: 'low' }
      : tok === '??' ? { type: 'high' }
        : { type: 'exact', n: tok };
    required.push(spec);
    starBeforeReq.push(pendingStar);
    pendingStar = false;
  }
  const starAfter = pendingStar;
  const m = required.length;

  // Clamp a running sum to the smallest value that still distinguishes
  // pass/fail for required[idx]: past the exact target (or past 9, for a
  // single-digit block) it can only fail, so collapse to one sink value.
  const clamp = (idx, sum) => {
    const spec = required[idx];
    return spec.type === 'exact' ? Math.min(sum, spec.n + 1) : Math.min(sum, 10);
  };
  const finalizeOk = (idx, sum) => {
    const spec = required[idx];
    if (spec.type === 'exact') return sum === spec.n;
    if (spec.type === 'low') return sum >= 1 && sum <= 9;
    return sum >= 10;
  };

  const spec = NFA.encodeSpec({
    startState: { stage: 'digit', reqIdx: 0, phase: 'idle', sum: 0 },
    transition: (state, value) => {
      // Stash the digit; the paired shade symbol (next) does the real work.
      if (state.stage === 'digit') {
        return {
          stage: 'flag', reqIdx: state.reqIdx, phase: state.phase,
          sum: state.sum, pendingDigit: value,
        };
      }
      const { reqIdx, phase, sum, pendingDigit: d } = state;
      const wrap = body => ({ stage: 'digit', sum: 0, ...body });

      if (value === UNSHADED) {
        if (phase === 'committed') {
          // A run just ended: it must be exactly required[reqIdx].
          if (!finalizeOk(reqIdx, sum)) return undefined;
          return wrap({ reqIdx: reqIdx + 1, phase: 'idle' });
        }
        // 'free' run ended (unconstrained) or already idle: no check.
        return wrap({ reqIdx, phase: 'idle' });
      }

      // value === SHADED: continue or start a run.
      if (phase === 'committed') {
        return wrap({ reqIdx, phase: 'committed', sum: clamp(reqIdx, sum + d) });
      }
      if (phase === 'free') {
        return wrap({ reqIdx, phase: 'free' });
      }
      // phase === 'idle': a new run starts here.
      if (reqIdx < m) {
        if (starBeforeReq[reqIdx]) {
          // Branch: this run is the required block, or an extra free one.
          return [
            wrap({ reqIdx, phase: 'committed', sum: clamp(reqIdx, d) }),
            wrap({ reqIdx, phase: 'free' }),
          ];
        }
        return wrap({ reqIdx, phase: 'committed', sum: clamp(reqIdx, d) });
      }
      // All required blocks already matched: only valid if a trailing '*'
      // permits more (free) blocks.
      return starAfter ? wrap({ reqIdx, phase: 'free' }) : undefined;
    },
    // The scan always ends on a shade symbol (stage 'digit' again), so a
    // run still open at the end must be finalized here the same way.
    accept: (state) => {
      let { reqIdx, phase, sum } = state;
      if (phase === 'committed') {
        if (!finalizeOk(reqIdx, sum)) return false;
        reqIdx += 1;
      }
      return reqIdx === m;
    },
  }, 9);

  const interleaved = cells.flatMap(cell => [cell, shade.at(cell)]);
  return new NFA(spec, 'block-pattern', ...interleaved);
}

// Outside-clue tokens, transcribed from the drawn overlay text ("*", "?",
// "??") and the small numeric outside-clue givens, in nearest-to-grid-last
// order, for this puzzle's own R1-R9/C1-C9 (the source canvas offsets the
// board and pads extra border rows/columns to hold these clues).
const rowTokens = {
  1: ['??', '?', '*'],
  2: [13, '?', '*'],
  3: ['??', '?', '*'],
  4: ['*', 3],
  5: ['?', '?', '*'],
  6: ['*', 11, '*'],
  7: [17, '*'],
  8: ['*', '??', '?'],
  9: ['??', 14, '??'],
};
const colTokens = {
  1: ['*', '?'],
  2: ['*', 8, '*'],
  3: ['*', 12, '*'],
  4: ['??', 15, '??'],
  5: ['*', '??'],
  6: ['?', '*'],
  7: ['?', '??', '??'],
  8: ['*', 10, '*'],
  9: ['??', 3, '??'],
};

const rowLines = Object.entries(rowTokens).map(
  ([r, tokens]) => blockPatternNFA(tokens, graph.row(Number(r))));
const colLines = Object.entries(colTokens).map(
  ([c, tokens]) => blockPatternNFA(tokens, graph.column(Number(c))));

return [
  new Shape('9x9'),
  shade.toVar('shade'),
  shadeDomain,
  // "The shaded cells form a single orthogonally connected group."
  new ConnectedValues('VS', SHADED),
  noFullyShaded2x2,
  ...rowLines,
  ...colLines,
];
