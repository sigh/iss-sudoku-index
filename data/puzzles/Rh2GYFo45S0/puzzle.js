// Title: Untitled
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=Rh2GYFo45S0
// Source: https://cracking-the-cryptic.web.app/sudoku/Bqpmrr229Q

// Normal sudoku rules apply (standard 3x3 boxes, default row/col/box
// all-different). Cages sum to their printed corner total with distinct
// digits inside; a cage with no printed total still forbids repeats. A
// number outside the grid counts how many times, reading along the whole
// corresponding row (left-side clues) or column (top-side clues), the
// digit's parity switches between consecutive cells.

// Cage totals and cells, transcribed from the drawn cage geometry; the
// no-total cage (R1C3,R1C4,R2C4) enforces only AllDifferent.
const CAGES = [
  [9, 'R2C1', 'R2C2'],
  [22, 'R3C4', 'R4C4', 'R3C5'],
  [19, 'R1C7', 'R2C7', 'R3C7'],
  [7, 'R1C9', 'R2C9'],
  [14, 'R4C8', 'R5C8'],
  [18, 'R6C8', 'R7C8', 'R7C7'],
  [17, 'R8C9', 'R9C9', 'R9C8'],
  [12, 'R6C6', 'R6C5'],
  [15, 'R7C4', 'R8C4', 'R9C4'],
  [19, 'R8C1', 'R9C1', 'R9C2'],
  [20, 'R5C1', 'R5C2', 'R5C3'],
];
const NO_TOTAL_CAGE = ['R1C3', 'R1C4', 'R2C4'];

// Outside odd/even-switch clues, transcribed from the drawn overlays: a
// left-side clue names its row, a top-side clue names its column. Only
// these 4 rows and 3 columns carry a clue.
const ROW_SWITCH_CLUES = { 4: 5, 5: 3, 6: 1, 7: 3 };
const COL_SWITCH_CLUES = { 3: 6, 5: 3, 8: 2 };

// NFA: counts parity switches between consecutive cells along a line and
// accepts iff the total equals `target`. State carries the previous digit
// (to compare parity) and the running switch count, clamped at target+1
// once the line can only fail.
function switchCountNFA(target) {
  const spec = NFA.encodeSpec({
    startState: { prev: null, count: 0 },
    transition: ({ prev, count }, value) => {
      if (prev === null) return { prev: value, count: 0 };
      const switched = (value % 2) !== (prev % 2) ? 1 : 0;
      return { prev: value, count: Math.min(count + switched, target + 1) };
    },
    accept: ({ prev, count }) => prev !== null && count === target,
  }, 9);
  return spec;
}

// One compiled NFA per distinct clue value, reused across lanes that share
// a target.
const nfaByTarget = new Map();
function nfaFor(target) {
  if (!nfaByTarget.has(target)) nfaByTarget.set(target, switchCountNFA(target));
  return nfaByTarget.get(target);
}

const rowClues = Object.entries(ROW_SWITCH_CLUES).map(([row, target]) => {
  const cells = Array.from({ length: 9 }, (_, i) => makeCellId(Number(row), i + 1));
  return new NFA(nfaFor(target), `RowSwitch${row}`, ...cells);
});

const colClues = Object.entries(COL_SWITCH_CLUES).map(([col, target]) => {
  const cells = Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, Number(col)));
  return new NFA(nfaFor(target), `ColSwitch${col}`, ...cells);
});

return [
  new Shape('9x9'),
  ...CAGES.map(([total, ...cells]) => new Cage(total, ...cells)),
  new AllDifferent(...NO_TOTAL_CAGE),
  ...rowClues,
  ...colClues,
];
