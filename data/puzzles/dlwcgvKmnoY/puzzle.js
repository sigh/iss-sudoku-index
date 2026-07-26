// Title: How Shall We Split This?
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=dlwcgvKmnoY
// Source: https://sudokupad.app/rmac5anfcn

// Normal sudoku rules apply. Ten lines are drawn (each rendered as a white
// outline stroke plus a matching lightsteelblue stroke on top -- one drawn
// line, not two). Each line is divided at unknown 'split points' -- on
// interior cell-to-cell edges of the line -- into segments; every segment on
// a given line sums to the same total (a total that can differ line to
// line), and digits may repeat within a segment wherever sudoku otherwise
// allows it. The sudoku digit placed in the green-circled cell on a line
// gives that line's number of split points; every circled cell is itself one
// of that line's own cells (drawn art).
//
// Encoding: one boolean-valued Var per interior line edge marks whether a
// split falls there (1 = no split, 2 = split). A Sum ties the count of
// splits on a line to its marker cell's digit, and an NFA scanning the line
// interleaved with its edge flags checks that every maximal no-split run
// (i.e. every segment) sums to the same total.

// Each entry: [markerCell, lineCells...], cell order/geometry from the drawn
// wayPoints (direction is arbitrary; only the path and the marker matter).
// The marker cell is always one of lineCells.
const LINES = [
  ['R1C1', ['R3C1', 'R2C1', 'R1C1']],
  ['R1C2', ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9']],
  ['R3C3', ['R3C3', 'R4C3', 'R5C4', 'R5C5']],
  ['R2C4', ['R2C4', 'R3C4', 'R3C5', 'R2C5', 'R2C6', 'R3C6']],
  ['R2C2', ['R2C3', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R6C3', 'R5C3']],
  ['R8C1', ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2']],
  ['R8C2', ['R9C3', 'R8C3', 'R8C2', 'R7C2', 'R7C3', 'R6C4', 'R6C5']],
  ['R6C6', ['R4C4', 'R4C5', 'R4C6', 'R4C7', 'R5C8', 'R4C8', 'R4C9', 'R5C9',
    'R6C9', 'R6C8', 'R5C7', 'R5C6', 'R6C6', 'R6C7']],
  ['R2C9', ['R2C9', 'R3C9', 'R3C8', 'R2C8', 'R2C7', 'R3C7']],
  ['R8C8', ['R8C8', 'R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7',
    'R8C7', 'R9C6', 'R9C5', 'R8C5', 'R9C4', 'R8C4', 'R7C4', 'R7C5', 'R7C6',
    'R8C6']],
];

const NO_SPLIT = 1;
const SPLIT = 2;

const graph = cellGraph('9x9');
const totalEdges = LINES.reduce((n, [, cells]) => n + cells.length - 1, 0);
// The overlay's grid-cell pairing is arbitrary (any 71 of the 81 grid cells) --
// it only supplies the ordering makeReplicate needs to derive VS1..VS71.
const flagsOverlay = graph.makeOverlay('VS', graph.cells().slice(0, totalEdges));
const splitFlags = flagsOverlay.toVar('split flags');
const flagCells = flagsOverlay.cells();

let cursor = 0;
const lineFlags = LINES.map(([, cells]) => {
  const flags = [];
  for (let i = 0; i < cells.length - 1; i++) flags.push(flagCells[cursor++]);
  return flags;
});

// State: {phase, segSum, prevSum}. `phase` alternates cell/flag because the
// scan always interleaves [cell, flag, cell, flag, ..., cell]. `segSum` is
// the running sum since the last split (or line start); `prevSum` is the
// fixed total established by the first completed segment (null until then).
// Once prevSum is set, segSum is pruned as soon as it would exceed it, so
// only the (unsplit) first segment's sum is otherwise unbounded -- it is
// capped at firstSegmentCap(n), the largest sum a length-n line's first
// segment can legitimately reach: at least one split is required (marker
// digits are 1-9), so the first segment spans at most n-1 cells of digits
// 1-9. Building one spec per line (rather than a single shared spec, and
// with maxDepth matched exactly to that line's scan length) keeps the
// compiled state count within the NFA's 4096-state cap for every line up to
// 8 cells; the two longest lines (14 and 18 cells) still exceed it even with
// a tight per-line cap -- see the omission below.
const firstSegmentCap = n => 9 * (n - 1);
function makeEqualSegmentsSpec(n) {
  return NFA.encodeSpec({
    startState: { phase: 'cell', segSum: 0, prevSum: null },
    transition: ({ phase, segSum, prevSum }, value) => {
      if (phase === 'cell') {
        const newSegSum = segSum + value;
        const cap = prevSum !== null ? prevSum : firstSegmentCap(n);
        if (newSegSum > cap) return undefined;
        return { phase: 'flag', segSum: newSegSum, prevSum };
      }
      // phase === 'flag'
      if (value === NO_SPLIT) return { phase: 'cell', segSum, prevSum };
      if (value === SPLIT) {
        if (prevSum === null) return { phase: 'cell', segSum: 0, prevSum: segSum };
        if (segSum !== prevSum) return undefined;
        return { phase: 'cell', segSum: 0, prevSum };
      }
      return undefined; // flags are restricted to {1, 2} by Given below.
    },
    // If no split ever occurred, the whole line is one segment: trivially
    // equal to itself. Otherwise the final (still-open) segment must also
    // match the established total.
    accept: ({ prevSum, segSum }) => prevSum === null || segSum === prevSum,
    // Exact symbol count of this line's interleaved scan (cell, flag, cell,
    // ..., cell). A looser bound reaches more (unneeded) states and burns
    // into the 4096 cap faster; it must not be tighter than 2n-1 or it would
    // silently reject valid grids instead of erroring.
    maxDepth: 2 * n - 1,
  }, 9);
}

function interleave(cells, flags) {
  const out = [cells[0]];
  for (let i = 0; i < flags.length; i++) out.push(flags[i], cells[i + 1]);
  return out;
}

// OMISSION: the equal-segment-sum rule is not enforced on the two longest
// lines (14 and 18 cells, LINES indices 7 and 9) -- even a per-line NFA
// tailored to the tightest sound cap for just that one line exceeds ISS's
// 4096-state NFA compile limit (verified empirically). The split-count-only
// Sum constraint below still applies to every line, including these two.
const SKIP_EQUAL_SUM = new Set([7, 9]);
const equalSegmentConstraints = LINES.flatMap(([, cells], i) => {
  if (SKIP_EQUAL_SUM.has(i)) return [];
  const spec = makeEqualSegmentsSpec(cells.length);
  return [new NFA(spec, 'equal segments', interleave(cells, lineFlags[i]))];
});

// Count of splits on a line (= number of SPLIT(2) flags among its edgeCount
// flags) equals the marker cell's digit: sum(flag - 1 for each flag) =
// marker, i.e. sum(flags) - edgeCount = marker.
const splitCountConstraints = LINES.map(([marker, cells], i) => {
  const flags = lineFlags[i];
  return new Sum(flags.length, ...flags, [marker, -1]);
});

return [
  new Shape('9x9'),
  splitFlags,
  flagsOverlay.makeReplicate(new Given(flagCells[0], NO_SPLIT, SPLIT)),
  ...equalSegmentConstraints,
  ...splitCountConstraints,
];
