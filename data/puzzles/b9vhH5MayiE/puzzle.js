// Title: Fitting In
// Author: CaptZebraCakes
// Video: https://www.youtube.com/watch?v=b9vhH5MayiE
// Source: https://app.crackingthecryptic.com/sudoku/hF2gHhJb4r

// Normal sudoku rules apply.
//
// Each outside clue gives the length of the longest run of consecutive cells,
// along that row/column, whose digits are also consecutive integers appearing
// in sequential order (each cell one more, or one less, than its neighbour,
// consistently in the same direction for the whole run). The rules text does
// not say "increasing" or "decreasing", so both directions count; the clue is
// the longest such run anywhere in the row/column, not anchored to either end.
// Only some rows/columns carry a clue; the rest are unconstrained by this rule.

// Runs a row/column's 9 digits through an NFA tracking, at each cell: the
// previous digit, the direction of the run ending there ('asc'/'desc'/'none'),
// its length, and the longest length seen so far. A step extends the running
// direction's length by one; a step in the other direction (or breaking
// direction entirely) still counts as a fresh length-2 run if it is itself
// consecutive, since the clue is about the largest run anywhere, not a single
// greedy scan. Length and max are clamped at target+1, a reject sink for
// "already too long"; accept requires the final max to equal target exactly.
function longestConsecutiveRunNFA(target) {
  const spec = {
    startState: { val: null, dir: 'none', len: 0, max: 0 },
    transition: ({ val, dir, len, max }, value) => {
      if (val === null) return { val: value, dir: 'none', len: 1, max: 1 };
      const diff = value - val;
      let newLen, newDir;
      if (diff === 1 && dir === 'asc') {
        newLen = len + 1; newDir = 'asc';
      } else if (diff === -1 && dir === 'desc') {
        newLen = len + 1; newDir = 'desc';
      } else if (diff === 1) {
        newLen = 2; newDir = 'asc';
      } else if (diff === -1) {
        newLen = 2; newDir = 'desc';
      } else {
        newLen = 1; newDir = 'none';
      }
      const clampedLen = Math.min(newLen, target + 1);
      const newMax = Math.min(Math.max(max, clampedLen), target + 1);
      return { val: value, dir: newDir, len: clampedLen, max: newMax };
    },
    accept: ({ max }) => max === target,
    maxDepth: 9,
  };
  return NFA.encodeSpec(spec, 9);
}

function rowCells(r) {
  return Array.from({ length: 9 }, (_, c) => makeCellId(r, c + 1));
}
function colCells(c) {
  return Array.from({ length: 9 }, (_, r) => makeCellId(r + 1, c));
}

// Row clues, left side (overlays array).
const rowClues = { 1: 4, 3: 4, 4: 3, 5: 6, 6: 2, 8: 5 };
// Column clues, top side (overlays array).
const colClues = { 1: 1, 3: 5, 6: 5, 7: 6 };

const rowRunConstraints = Object.entries(rowClues).map(
  ([r, target]) => new NFA(longestConsecutiveRunNFA(target), `row${r}run`, ...rowCells(Number(r)))
);
const colRunConstraints = Object.entries(colClues).map(
  ([c, target]) => new NFA(longestConsecutiveRunNFA(target), `col${c}run`, ...colCells(Number(c)))
);

return [
  new Shape('9x9'),
  new Given('R7C3', 3),
  ...rowRunConstraints,
  ...colRunConstraints,
];
