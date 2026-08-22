// Title: Killer Multiplications of Nine
// Author: Sajjad Heydari
// Video: https://www.youtube.com/watch?v=LVu2T0HsM8g
// Source: https://app.crackingthecryptic.com/sudoku/3nJD2rJtn3

// Normal sudoku rules apply (default row/column/box all-different; the
// payload's regions match the default 3x3 boxes exactly). Each cage's digits
// are all different and sum to its printed total (Cage's built-in semantics).
// In row i and column i, the two decimal digits of 9*i must appear in that
// order (left-to-right in the row, top-to-bottom in the column). i=1 gives
// 9*1=9, a single digit, so no ordering constraint applies there.

// Each ordering pair is enforced by a 2-state NFA scanning the 9 cells of the
// row/column in geometric order: it tracks only whether `before` has been
// seen yet, and rejects if `after` appears first.
const beforeAfterSpec = (before, after) => NFA.encodeSpec({
  startState: { seen: false },
  transition: ({ seen }, value) => {
    if (value === after && !seen) return undefined; // after seen before before: reject
    if (value === before) return { seen: true };
    return { seen };
  },
  accept: () => true,
}, 9);

// Decimal digits of 9*i for i=2..9, as [before, after] pairs.
const ORDER_PAIRS = {
  2: [1, 8], // 9*2=18
  3: [2, 7], // 9*3=27
  4: [3, 6], // 9*4=36
  5: [4, 5], // 9*5=45
  6: [5, 4], // 9*6=54
  7: [6, 3], // 9*7=63
  8: [7, 2], // 9*8=72
  9: [8, 1], // 9*9=81
};

const rowCells = (r) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => makeCellId(r, c));
const colCells = (c) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => makeCellId(r, c));

const orderingConstraints = Object.entries(ORDER_PAIRS).flatMap(([i, [before, after]]) => {
  const spec = beforeAfterSpec(before, after);
  return [
    new NFA(spec, `Row${i}Order`, ...rowCells(Number(i))),
    new NFA(spec, `Col${i}Order`, ...colCells(Number(i))),
  ];
});

// Cages, transcribed from the payload's cages array (single-cell cages #5 and
// #11 are real clues, not stubs).
const cages = [
  new Cage(15, 'R1C9', 'R2C9', 'R3C9'),
  new Cage(18, 'R3C8', 'R3C7', 'R4C7'),
  new Cage(9, 'R2C7', 'R1C7'),
  new Cage(9, 'R1C6', 'R1C5'),
  new Cage(10, 'R3C5', 'R4C5'),
  new Cage(5, 'R5C9'),
  new Cage(22, 'R8C9', 'R9C9', 'R9C8'),
  new Cage(12, 'R9C7', 'R9C6'),
  new Cage(26, 'R6C6', 'R6C7', 'R7C7', 'R7C6'),
  new Cage(6, 'R8C5', 'R9C5'),
  new Cage(6, 'R7C2', 'R7C1', 'R8C1'),
  new Cage(4, 'R5C1'),
  new Cage(13, 'R4C1', 'R3C1'),
  new Cage(10, 'R1C2', 'R1C1', 'R2C1'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...orderingConstraints,
];
