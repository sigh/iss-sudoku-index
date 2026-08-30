// Title: An Awesome Sudoku Puzzle
// Author: Unknown
// Video: https://www.youtube.com/watch?v=SnwRz5JE0ho
// Source: https://cracking-the-cryptic.web.app/sudoku/hf3jLFrRL6

// Standard 9x9 sudoku (default box regions, no givens) plus two rule types:
//
// Toroid Sandwich (outside clues): the sum of the digits strictly after the 1
// and strictly before the 9 in that row/column, reading in the row/column's
// normal direction, wrapping past the far end back to the near end if the 9
// has not been reached yet. Implemented below as one NFA per clued lane.
//
// Thermometer: strictly increasing away from the bulb. Three of the four
// lines have their bulb drawn mid-path (a grey circle underlay, not at
// either end), so those are encoded as two Thermo constraints sharing the
// bulb cell -- one per arm.

// Toroid Sandwich lane scan. `cells` is the row/column's 9 cells in reading
// order. The lane is treated as a 9-cell cycle by scanning the cell list
// twice back-to-back, which lets the "before 9" search continue past the
// last cell into the first cell without any special wrap-around logic.
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
function toroidSandwich(clue, cells) {
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
  return new NFA(spec, `toroid-sandwich-${clue}`, ...cells, ...cells);
}

const rowCells = (row) => Array.from({ length: 9 }, (_, i) => makeCellId(row, i + 1));
const colCells = (col) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, col));

// Outside clue totals transcribed from the puzzle's margin text (top of
// C2/C5/C8, left of R4/R6).
const toroidSandwiches = [
  toroidSandwich(7, colCells(2)),
  toroidSandwich(27, colCells(5)),
  toroidSandwich(26, colCells(8)),
  toroidSandwich(14, rowCells(4)),
  toroidSandwich(17, rowCells(6)),
];

// Thermometer cell paths transcribed from the puzzle's drawn grey lines;
// each bulb cell taken from the matching grey circle drawn on that line.
const thermos = [
  // T0: bulb R3C5 is mid-path -> two arms.
  new Thermo('R3C5', 'R3C4', 'R3C3', 'R4C2'),
  new Thermo('R3C5', 'R3C6', 'R3C7', 'R4C8', 'R5C9'),
  // T1: bulb R5C4 is the path's own start -> one thermo.
  new Thermo('R5C4', 'R5C5', 'R5C6'),
  // T2: bulb R6C6 is mid-path -> two arms.
  new Thermo('R6C6', 'R6C5', 'R6C4', 'R5C3'),
  new Thermo('R6C6', 'R5C7'),
  // T3: bulb R7C8 is mid-path -> two arms.
  new Thermo('R7C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R7C2', 'R6C1', 'R5C1'),
  new Thermo('R7C8', 'R6C9'),
];

return [
  new Shape('9x9'),
  ...toroidSandwiches,
  ...thermos,
];
