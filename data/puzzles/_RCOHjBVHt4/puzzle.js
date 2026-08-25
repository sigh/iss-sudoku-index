// Title: The Even More Oddly Satisfying Showdoku
// Author: Trevor Tao
// Video: https://www.youtube.com/watch?v=_RCOHjBVHt4
// Source: https://app.crackingthecryptic.com/sudoku/mmmDpTPHhp

// Normal sudoku rules apply. Each sandwich clue below independently indicates
// EITHER the sum of the odd digits strictly between the 2 and the 8 in that
// row/column, OR the sum of the even digits strictly between the 1 and the 9
// in that row/column -- the rules do not say which, so each clue is encoded
// as an Or over both readings (never resolved by which yields uniqueness).
// A row/column's two printed clues (top/bottom or left/right) name the same
// 9 cells and are each independently either reading; nothing forces one of
// each per row/column.
//
// Each reading is a bookend-sandwich sum: scan the row/column, ignore digits
// before the first bookend (lo or hi, in either order) and after the second,
// and sum only the cells between them whose parity matches the reading. The
// two bookend values are excluded from the sum themselves. Digits 1-9 are
// each guaranteed present exactly once per row/column by normal sudoku, so
// both bookends are always found.

// Reading A: lo=2, hi=8, sum the odd digits between them.
// Reading B: lo=1, hi=9, sum the even digits between them.
const READINGS = [
  { lo: 2, hi: 8, parity: 'odd' },
  { lo: 1, hi: 9, parity: 'even' },
];

// One compiled spec per (reading, target) pair, memoized since several clues
// share the same printed value.
const specCache = new Map();
function sandwichSpec(lo, hi, parity, target) {
  const key = `${lo}-${hi}-${parity}-${target}`;
  if (specCache.has(key)) return specCache.get(key);
  const spec = NFA.encodeSpec({
    startState: { phase: 'before', sum: 0 },
    transition: ({ phase, sum }, value) => {
      if (phase === 'before') {
        return (value === lo || value === hi)
          ? { phase: 'between', sum: 0 }
          : { phase: 'before', sum: 0 };
      }
      if (phase === 'between') {
        if (value === lo || value === hi) return { phase: 'after', sum };
        const matches = parity === 'odd' ? value % 2 === 1 : value % 2 === 0;
        // Clamp at target+1: a sink past the point the clue can still match.
        const nextSum = matches ? Math.min(sum + value, target + 1) : sum;
        return { phase: 'between', sum: nextSum };
      }
      return { phase: 'after', sum }; // phase === 'after': ignore the rest.
    },
    accept: ({ phase, sum }) => phase === 'after' && sum === target,
  }, 9);
  specCache.set(key, spec);
  return spec;
}

// Or over both readings for one clue's cells and printed target.
function sandwichClue(name, target, cells) {
  return new Or(READINGS.map(({ lo, hi, parity }) =>
    new NFA(sandwichSpec(lo, hi, parity, target), `${name}-${parity}`, ...cells)));
}

const rowCells = r => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const colCells = c => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

// Column clues (top, bottom), transcribed from the printed ring clues.
const columnClues = [
  { col: 1, top: 6, bottom: 14 },
  { col: 2, top: 0, bottom: 18 },
  { col: 4, top: 15, bottom: 20 },
  { col: 6, top: 15, bottom: 20 },
  { col: 8, top: 2, bottom: 14 },
  { col: 9, top: 1, bottom: 14 },
];

// Row clues (left, right), transcribed from the printed ring clues.
const rowClues = [
  { row: 1, left: 4, right: 10 },
  { row: 2, left: 7, right: 20 },
  { row: 3, left: 10, right: 25 },
  { row: 7, left: 10, right: 25 },
  { row: 8, left: 1, right: 12 },
  { row: 9, left: 4, right: 8 },
];

const clues = [
  ...columnClues.flatMap(({ col, top, bottom }) => [
    sandwichClue(`col${col}-top`, top, colCells(col)),
    sandwichClue(`col${col}-bottom`, bottom, colCells(col)),
  ]),
  ...rowClues.flatMap(({ row, left, right }) => [
    sandwichClue(`row${row}-left`, left, rowCells(row)),
    sandwichClue(`row${row}-right`, right, rowCells(row)),
  ]),
];

return [
  new Shape('9x9'),
  ...clues,
];
