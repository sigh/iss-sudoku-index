// Title: Self Sandwiches Sudoku
// Author: Lucy Audrin
// Video: https://www.youtube.com/watch?v=9KT0UcVvguA
// Source: https://cracking-the-cryptic.web.app/sudoku/GBB6Mb84r7

// Normal sudoku on a plain 9x9 grid (default rows/columns/boxes).
//
// Nine outside two-digit clues (5 above columns, 4 left of rows). Each clue is
// self-referential: its own two printed digits (tens digit, units digit) name
// the two "crust" digits for that row/column, and the clue's numeric value is
// the sum of the digits strictly between wherever those two crust digits sit
// in the line. This is not the classic 1-and-9 Sandwich reading: two clues
// read 36, which exceeds the classic sandwich's maximum possible sum of 35
// (2+3+...+8), so that reading is arithmetically impossible. The
// self-named-crust reading is consistent with every clue -- the two 36s sit
// exactly at the theoretical maximum for crust digits 3 and 6 (45 - 3 - 6 =
// 36), reachable only when the two crust cells occupy both ends of their
// line.

const colCells = c => Array.from({ length: 9 }, (_, r) => makeCellId(r + 1, c));
const rowCells = r => Array.from({ length: 9 }, (_, c) => makeCellId(r, c + 1));

// Scans a 9-cell line: phase 0 is before any crust digit, phase 1 is between
// the two crust digits (accumulating sum), phase 2 is after the second crust
// digit. A crust digit is any cell holding value a or b. Accepts iff the
// accumulated between-sum equals target. The sum branch dies the moment it
// would exceed target, keeping the compiled state count small.
function selfSandwichSpec(a, b, target) {
  return NFA.encodeSpec({
    startState: { phase: 0, sum: 0 },
    transition: ({ phase, sum }, value) => {
      const isCrust = value === a || value === b;
      if (phase === 0) return isCrust ? { phase: 1, sum: 0 } : { phase, sum };
      if (phase === 1) {
        if (isCrust) return { phase: 2, sum };
        const nextSum = sum + value;
        if (nextSum > target) return undefined;
        return { phase, sum: nextSum };
      }
      return { phase, sum };
    },
    accept: ({ phase, sum }) => phase === 2 && sum === target,
  }, 9);
}

// Outside clues, transcribed from the overlay text and lane (raw payload
// overlay `center` coordinates: [-0.5, col-0.5] is above that column,
// [row-0.5, -0.5] is left of that row). Each clue's tens digit and units
// digit are that line's two crust digits.
const OUTSIDE_CLUES = [
  ['top C1', colCells(1), 3, 6, 36],
  ['top C2', colCells(2), 1, 2, 12],
  ['top C5', colCells(5), 1, 3, 13],
  ['top C8', colCells(8), 1, 8, 18],
  ['top C9', colCells(9), 3, 6, 36],
  ['left R2', rowCells(2), 2, 3, 23],
  ['left R4', rowCells(4), 2, 9, 29],
  ['left R5', rowCells(5), 1, 2, 12],
  ['left R8', rowCells(8), 2, 4, 24],
];

const sandwiches = OUTSIDE_CLUES.map(([name, cells, a, b, target]) =>
  new NFA(selfSandwichSpec(a, b, target), name, ...cells));

return [
  new Shape('9x9'),
  new Given('R1C4', 7),
  new Given('R3C1', 5),
  new Given('R3C9', 1),
  new Given('R4C7', 3),
  new Given('R5C2', 9),
  new Given('R5C5', 1),
  new Given('R5C9', 5),
  new Given('R6C4', 2),
  new Given('R6C6', 9),
  new Given('R8C5', 4),
  ...sandwiches,
];
