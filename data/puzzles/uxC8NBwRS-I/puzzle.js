// Title: Sandwich Counts
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=uxC8NBwRS-I
// Source: https://app.crackingthecryptic.com/sudoku/RP7HfFgQdt

// Normal sudoku rules apply (rows, columns and boxes all-different, from
// Shape('9x9')). Column outside clues give the sum of the digits strictly
// between the 1 and the 9 in that column (provenance: the drawn outside-clue
// overlays 15/21/30 above C1/C5/C9). No row-sandwich sums are given -- the
// rule text names only columns for the sum clue.
//
// Every drawn circle is unlabeled -- none carries a printed number. Per "A
// number in a circled cell indicates the total number of cells sandwiched
// between the 1's and the 9's in the row and column containing the circle",
// the number meant is the cell's own solved digit: it must equal the count
// of cells sandwiched between the 1 and 9 of its row plus the count
// sandwiched between the 1 and 9 of its column, with the circle's own cell
// (the only cell a row-sandwich and a column-sandwich can share) counted
// once rather than twice when it falls inside both spans.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Column sandwich sums (top-of-grid outside clues; provenance: the drawn
// overlay values 15/21/30 above C1/C5/C9).
const columnSandwiches = [
  Sandwich.fromCells(15, graph.column('R1C1'), geometry),
  Sandwich.fromCells(21, graph.column('R1C5'), geometry),
  Sandwich.fromCells(30, graph.column('R1C9'), geometry),
];

// Circled cells (provenance: the drawn, unlabeled circle overlays).
const circledCells = [
  'R1C5', 'R1C7', 'R1C9', 'R2C1', 'R2C3', 'R4C6',
  'R5C2', 'R6C5', 'R7C3', 'R8C6', 'R9C3', 'R9C5',
];

// Two-segment NFA per circled cell: segment 1 walks its row, segment 2 walks
// its column (both start-to-end in grid order, so i0/j0 below is the
// circled cell's own 1-based column/row index within each segment).
//
// Rather than track the raw positions of 1 and 9 (which blows the compiled
// state count past the 4096-state cap once carried across both segments),
// each segment is scanned with a 3-state marker phase `m`: 'NONE' (neither
// 1 nor 9 seen yet), 'ONE' (exactly one seen -- cells seen while in this
// phase are "between"), 'BOTH' (both seen, phase over). A cell counts as
// between its axis's 1 and 9 exactly when it is read while `m === 'ONE'`
// and is not itself a 1 or a 9; that also gives row/colContains directly at
// the circled cell's own position, with no need to compare positions after
// the fact.
//
// `acc` starts at the circled cell's own digit, captured when the row scan
// reaches position i0 (minus the row-prefix between-count already seen);
// every further between-cell -- row suffix, then the whole column axis --
// decrements it by one, so by the end `acc` equals digit - rowBetween -
// colBetween. The rule wants digit == rowBetween + colBetween - overlap, so
// acceptance is `acc === -overlap`. Folding the running total into one
// number instead of carrying the digit and each between-count separately is
// what keeps the compiled state small; `acc` is clamped once it drops below
// -1, since only further decrements are possible after (matching "clamp the
// counter at the target" from bounded-counting NFA practice).
const makeSandwichCircleNFA = (i0, j0) => {
  const spec = {
    startState: {
      phase: 'row', pos: 0, m: 'NONE', between: 0,
      acc: null, rowContains: null, colContains: null,
    },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        // The row axis must have found both markers and captured the
        // target digit before the column axis can start.
        if (state.m !== 'BOTH' || state.acc === null) return undefined;
        return {
          phase: 'col', pos: 0, m: 'NONE', between: 0,
          acc: state.acc, rowContains: state.rowContains, colContains: null,
        };
      }
      // Each segment is exactly 9 cells (a grid row or column); reject any
      // continuation past that so the compiler can't explore hypothetical
      // longer segments.
      if (state.pos >= 9) return undefined;

      const pos = state.pos + 1;
      const isMarker = value === 1 || value === 9;
      const targetPos = state.phase === 'row' ? i0 : j0;
      const wasBetweenPhase = state.m === 'ONE';

      let { acc, between, rowContains, colContains } = state;
      if (state.acc === null) {
        // Row axis, still before the circled cell: accumulate the prefix
        // between-count, or capture the target digit at i0.
        if (pos === targetPos) {
          rowContains = (wasBetweenPhase && !isMarker) ? 1 : 0;
          // The circled cell itself counts toward the row's own
          // between-total when it falls inside the row's span, same as any
          // other cell there.
          acc = value - between - rowContains;
          between = 0;
        } else if (wasBetweenPhase && !isMarker) {
          between = Math.min(between + 1, 8);
        }
      } else if (state.phase === 'col' && pos === targetPos) {
        // Column axis, at the circled cell itself: same containment check,
        // and the same self-contribution to the column's between-total.
        colContains = (wasBetweenPhase && !isMarker) ? 1 : 0;
        acc = acc - colContains;
        between = 0;
      } else if (wasBetweenPhase && !isMarker) {
        // Row suffix or column axis away from the circled cell: every
        // between-cell lowers the running total.
        acc = Math.max(acc - 1, -2);
      }

      const m = state.m === 'NONE' ? (isMarker ? 'ONE' : 'NONE')
        : state.m === 'ONE' ? (isMarker ? 'BOTH' : 'ONE')
          : 'BOTH';

      return { phase: state.phase, pos, m, between, acc, rowContains, colContains };
    },
    accept: (state) => {
      if (state.m !== 'BOTH' || state.acc === null) return false;
      const overlap = (state.rowContains && state.colContains) ? 1 : 0;
      return state.acc === -overlap;
    },
    // 9 row cells + 1 segment break + 9 column cells.
    maxDepth: 19,
  };
  return NFA.encodeSpec(spec, 9, { multiSegment: true });
};

const sandwichCircles = circledCells.map(cellId => {
  const { row, col } = parseCellId(cellId);
  return new NFA(
    makeSandwichCircleNFA(col, row),
    'SandwichCircle',
    graph.row(cellId),
    graph.column(cellId),
  );
});

return [
  new Shape('9x9'),
  ...columnSandwiches,
  ...sandwichCircles,
];
