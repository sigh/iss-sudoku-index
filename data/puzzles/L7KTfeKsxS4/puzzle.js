// Title: Sandwich Sudoku: With A Twist!
// Author: Florian Zellmer
// Video: https://www.youtube.com/watch?v=L7KTfeKsxS4
// Source: https://cracking-the-cryptic.web.app/sudoku/gfn7qnjQrm

// Standard 9x9 sudoku (default box regions) plus two givens, plus a
// directional/wraparound Sandwich clue on every row and every column: the sum
// of the digits strictly after the 1 and strictly before the 9, counted only
// in the stated direction (rightward for a row, downward for a column), with
// the count looping from the far end back to the near end if the 9 has not
// been found yet. Implemented below as one NFA per lane.

// Torus sandwich lane scan. `cells` is the row/column's 9 cells in the
// stated counting direction. The lane is treated as a 9-cell cycle by
// scanning the cell list twice back-to-back, which lets the "before 9"
// search continue past the last cell into the first cell with no
// special-cased wrap-around logic.
//
// States:
//  - {phase: 'before', sum: 0}: still looking for the 1 (any non-1 digit is
//    ignored, including a 9 seen before the 1).
//  - {phase: 'after1', sum}: 1 has been found; sum accumulates every digit
//    seen since (2-8), until the 9 is found. Clamped to clue+1 (a sink: once
//    the running sum overshoots the clue it can only grow, never match) so
//    the compiled state space stays finite -- the compiler explores the
//    transition graph abstractly, not just this constraint's actual 18-cell
//    scan, so an unclamped sum is unbounded.
//  - {phase: 'done', sum}: the 9 has been found; sum is now fixed and every
//    remaining (doubled-scan) cell is ignored.
// Accepted only if scanning ends in 'done' with sum equal to the clue.
function torusSandwich(clue, cells) {
  const spec = NFA.encodeSpec({
    startState: { phase: 'before', sum: 0 },
    transition: ({ phase, sum }, value) => {
      if (phase === 'before') {
        return value === 1 ? { phase: 'after1', sum: 0 } : { phase: 'before', sum: 0 };
      }
      if (phase === 'after1') {
        return value === 9
          ? { phase: 'done', sum }
          : { phase: 'after1', sum: Math.min(sum + value, clue + 1) };
      }
      return { phase: 'done', sum };
    },
    accept: ({ phase, sum }) => phase === 'done' && sum === clue,
  }, 9);
  return new NFA(spec, `torus-sandwich-${clue}-${cells[0]}`, ...cells, ...cells);
}

const rowCells = (row) => Array.from({ length: 9 }, (_, i) => makeCellId(row, i + 1));
const colCells = (col) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, col));

// Left-of-row totals, transcribed from the puzzle's left-margin overlays
// (R1..R9, top to bottom).
const rowTotals = [13, 0, 29, 22, 18, 18, 35, 9, 35];
// Top-of-column totals, transcribed from the puzzle's top-margin overlays
// (C1..C9, left to right).
const colTotals = [21, 26, 25, 21, 9, 17, 4, 3, 9];

const rowSandwiches = rowTotals.map((clue, i) => torusSandwich(clue, rowCells(i + 1)));
const colSandwiches = colTotals.map((clue, i) => torusSandwich(clue, colCells(i + 1)));

// Givens, transcribed from the puzzle's cells array.
const givens = [
  new Given('R2C3', 9),
  new Given('R4C8', 3),
];

return [
  new Shape('9x9'),
  ...givens,
  ...rowSandwiches,
  ...colSandwiches,
];
