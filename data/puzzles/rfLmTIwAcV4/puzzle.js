// Title: Japanese Sums
// Author: Maho Yokota
// Video: https://www.youtube.com/watch?v=rfLmTIwAcV4
// Source: https://cracking-the-cryptic.web.app/sudoku/mtbqn9TP4F

// 12x12 grid, no boxes. Every cell is either black or holds a digit 1-9, and
// digits do not repeat within a row or column. Encoded on a Raw shape with
// value range 0-9: 0 stands for "black", 1-9 for the digit, and nothing else
// restricts a cell, matching "must be black or contain a digit" directly.
//
// Each row/column's black cells cut it into maximal runs of digit cells
// ("strings"). The clues stacked outside that row/column give one sum per
// string, read grid-outward, in the same order the strings occur along the
// lane starting from the border next to the clue stack ("summed in the
// clues outside the grid in order"). '?' marks a string whose sum is not
// given: the string must still exist there, just with no sum to check. The
// clue count fixes how many strings (and so how many black-cell gaps, each
// >= 1 cell wide) the lane has, not their width or position.
//
// Clue text transcribed from the payload's outside overlays (all read "17"
// or "?"), grouped by lane and ordered nearest-the-grid-first; row/column
// indices below are this script's own 1-12 (payload R6-R17/C6-C17).

const shape = new Shape('12x12', '0-9', 'Raw');
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const rows = graph.rows();       // rows[i]: R(i+1)C1 .. R(i+1)C12, left to right
const columns = graph.columns(); // columns[j]: R1C(j+1) .. R12C(j+1), top to bottom

const BLACK = 0;

const ROW_CLUES = [
  [17, '?', 17, '?'],
  [17, 17, '?', '?'],
  ['?', '?', 17, 17],
  [17, '?', '?', '?'],
  [17, '?', 17, '?', '?'],
  [17, 17],
  ['?', '?', '?'],
  [17, '?', 17, '?'],
  ['?', 17, '?'],
  [17, 17, '?', '?'],
  [17, 17, '?'],
  ['?', '?', 17, '?'],
];

const COL_CLUES = [
  [17, 17],
  ['?', 17, 17],
  [17, 17],
  ['?', 17, '?', '?'],
  ['?', 17, 17],
  [17, '?', '?', 17, '?'],
  [17, 17],
  [17, '?', '?'],
  ['?', '?', 17],
  ['?', '?', 17],
  ['?', '?', '?', '?'],
  [17, 17],
];

// ---- Digit uniqueness among non-black cells ----
// One reusable NFA per lane: 0 (black) never touches the seen-digit bitmask,
// so any number of black cells may share a row/column; two equal digits
// still reject. Kept separate from the run/sum machine below so the bitmask
// (512 states) does not multiply against that machine's own state.
const uniqueSpec = NFA.encodeSpec({
  startState: { seen: 0 },
  transition: ({ seen }, value) => {
    if (value === BLACK) return { seen };
    const bit = 1 << (value - 1);
    if (seen & bit) return undefined;
    return { seen: seen | bit };
  },
  accept: () => true,
}, geometry);
const uniqueRules = [
  ...rows.map((cells, i) => new NFA(uniqueSpec, `row-${i + 1}-unique`, ...cells)),
  ...columns.map((cells, i) => new NFA(uniqueSpec, `col-${i + 1}-unique`, ...cells)),
];

// ---- Run structure and sums, in clue order ----
// State alternates 'gap' (on/before/after a black run, not yet at the next
// clued string) and 'run' (inside string number `idx`, `sum` its running
// total). A '?' string tracks no sum (canonicalised to 0 throughout) so it
// contributes only one state per position, keeping the machine small even
// though every numeric clue here is 17.
function laneSumSpec(clues) {
  const k = clues.length;
  return NFA.encodeSpec({
    startState: { phase: 'gap', idx: 0, sum: 0 },
    transition: (state, value) => {
      const { phase, idx } = state;
      if (phase === 'gap') {
        if (value === BLACK) return { phase: 'gap', idx, sum: 0 };
        if (idx >= k) return undefined; // more strings than clues
        const clue = clues[idx];
        if (clue === '?') return { phase: 'run', idx, sum: 0 };
        if (value > clue) return undefined;
        return { phase: 'run', idx, sum: value };
      }
      // phase === 'run'
      const clue = clues[idx];
      if (value === BLACK) {
        if (clue !== '?' && state.sum !== clue) return undefined;
        return { phase: 'gap', idx: idx + 1, sum: 0 };
      }
      if (clue === '?') return { phase: 'run', idx, sum: 0 };
      const sum = state.sum + value;
      if (sum > clue) return undefined;
      return { phase: 'run', idx, sum };
    },
    accept: (state) => {
      if (state.phase === 'gap') return state.idx === k; // every string closed
      if (state.idx !== k - 1) return false; // mid-string, but not the last one
      const clue = clues[state.idx];
      return clue === '?' || state.sum === clue;
    },
  }, geometry);
}

const rowSumRules = rows.map((cells, i) =>
  new NFA(laneSumSpec(ROW_CLUES[i]), `row-${i + 1}-sums`, ...cells));
const colSumRules = columns.map((cells, i) =>
  new NFA(laneSumSpec(COL_CLUES[i]), `col-${i + 1}-sums`, ...cells));

return [
  shape,
  ...uniqueRules,
  ...rowSumRules,
  ...colSumRules,
];
