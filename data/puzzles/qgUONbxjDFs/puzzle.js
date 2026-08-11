// Title: X-Digit-Sums
// Author: Christian Scherer
// Video: https://www.youtube.com/watch?v=qgUONbxjDFs
// Source: https://app.crackingthecryptic.com/sudoku/23DT9TQHfF

// Normal sudoku rules apply (Shape enforces rows/cols/boxes all-different).
// Outside clue: let X be the digit in the first cell entered from that
// direction; the clue's printed number is the digit sum of the sum of the
// first X digits (an 11 clue permits a first-X-digit total of 29 or 38,
// since digitSum(29) = digitSum(38) = 11 -- any total with digit sum 11
// qualifies, not only those two).
// Cage: digits must sum to a total whose digit sum is 1, 2, 11, or 12. No
// printed cage totals; both cages are confined to a single box (checked
// against the payload's regions below), so sudoku already forbids repeats
// inside them and no separate AllDifferent is added.

function digitSum(n) {
  return n < 10 ? n : Math.floor(n / 10) + (n % 10);
}

// Outside-clue NFA: the first symbol sets X = its own value and starts the
// running sum; the next (X - 1) symbols add to that sum; everything after is
// passed through unchanged (remaining pinned at 0). Accept iff digitSum(sum)
// equals the printed clue.
const outsideSpecCache = new Map();
function outsideSpec(clueValue) {
  if (!outsideSpecCache.has(clueValue)) {
    outsideSpecCache.set(clueValue, NFA.encodeSpec({
      startState: { remaining: -1, sum: 0 },
      transition: ({ remaining, sum }, value) => {
        if (remaining === -1) return { remaining: value - 1, sum: value };
        if (remaining > 0) return { remaining: remaining - 1, sum: sum + value };
        return { remaining: 0, sum };
      },
      accept: ({ sum }) => digitSum(sum) === clueValue,
    }, 9));
  }
  return outsideSpecCache.get(clueValue);
}

const colCells = (c) => Array.from({ length: 9 }, (_, r) => makeCellId(r + 1, c));
const rowCells = (r) => Array.from({ length: 9 }, (_, c) => makeCellId(r, c + 1));

// Outside clues (overlays #0-#19), each line ordered from the clue's edge
// inward (the direction digits are "entered from").
const outsideClues = [
  // Top (down the column): overlays #0, #1, #12, #19.
  { value: 1, cells: colCells(1) },
  { value: 1, cells: colCells(2) },
  { value: 11, cells: colCells(3) },
  { value: 12, cells: colCells(8) },
  // Bottom (up the column): overlays #4, #5, #6, #18, #14, #10.
  { value: 1, cells: [...colCells(1)].reverse() },
  { value: 1, cells: [...colCells(2)].reverse() },
  { value: 1, cells: [...colCells(4)].reverse() },
  { value: 12, cells: [...colCells(5)].reverse() },
  { value: 11, cells: [...colCells(6)].reverse() },
  { value: 2, cells: [...colCells(7)].reverse() },
  // Left (across the row): overlays #2, #9, #15, #16, #17, #3.
  { value: 1, cells: rowCells(1) },
  { value: 2, cells: rowCells(2) },
  { value: 11, cells: rowCells(3) },
  { value: 12, cells: rowCells(6) },
  { value: 12, cells: rowCells(8) },
  { value: 1, cells: rowCells(9) },
  // Right (across the row): overlays #7, #8, #11, #13.
  { value: 1, cells: [...rowCells(2)].reverse() },
  { value: 1, cells: [...rowCells(4)].reverse() },
  { value: 2, cells: [...rowCells(8)].reverse() },
  { value: 11, cells: [...rowCells(9)].reverse() },
];

// Cage-total NFA: an order-independent running sum (cage cells have no
// intrinsic order); accept iff its digit sum is one of the four rules-text
// values. maxDepth is set to the cage size so the running sum can't be
// explored past the cage's real length (an unbounded running sum blows the
// compiled-state cap).
const cageTargets = new Set([1, 2, 11, 12]);
const cageSpecCache = new Map();
function cageSpec(cellCount) {
  if (!cageSpecCache.has(cellCount)) {
    cageSpecCache.set(cellCount, NFA.encodeSpec({
      startState: 0,
      transition: (sum, value) => sum + value,
      accept: (sum) => cageTargets.has(digitSum(sum)),
      maxDepth: cellCount,
    }, 9));
  }
  return cageSpecCache.get(cellCount);
}

// Cages (raw cages[0], cages[1]); cage 0 lies entirely inside box 5 (regions
// index 4: R4-R6,C4-C6) and cage 1 entirely inside box 2 (regions index 1:
// R4-R6,C1-C3), so sudoku's own box constraint already forbids repeats.
const cages = [
  ['R4C6', 'R4C5', 'R5C5', 'R5C4', 'R6C4', 'R5C6'],
  ['R6C2', 'R5C2', 'R5C3'],
];

return [
  new Shape('9x9'),
  ...outsideClues.map(({ value, cells }, i) =>
    new NFA(outsideSpec(value), `xDigitSum${i}`, ...cells)),
  ...cages.map((cells, i) => new NFA(cageSpec(cells.length), `cage${i}`, ...cells)),
];
