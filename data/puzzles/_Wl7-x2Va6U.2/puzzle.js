// Title: X is Still Alive (Harder Version)
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=_Wl7-x2Va6U
// Source: https://cracking-the-cryptic.web.app/sudoku/6RQL2prMqn
//
// Normal sudoku rules apply. Digits may not repeat within a cage
// (AllDifferent, no printed total). The sums of digits in all cages end
// with the same digit X; X itself is unknown and part of the puzzle.
//
// The shared last digit is encoded with one multiSegment NFA scanned over
// every cage in turn. Each of the 10 branches in the start state commits to
// one candidate X and carries the running sum, mod 10, of the cage
// currently being read (mod 10 rather than the raw sum, so the state stays
// bounded no matter how many cells a segment has); at every SEGMENT_BREAK
// (and again at the end, via `accept`) the branch is killed unless that
// cage's running total mod 10 equals its committed X, so the digit the
// solver settles on for X is exactly the surviving branch.

const givens = [
  ['R1C1', 3], ['R1C4', 6], ['R1C8', 5],
  ['R2C1', 4], ['R2C5', 8],
  ['R5C4', 1], ['R5C6', 9],
  ['R8C5', 4], ['R8C9', 6],
  ['R9C2', 1], ['R9C6', 6], ['R9C9', 3],
];

// Cages: no printed total, all-different only. Cell lists transcribed from
// the puzzle's drawn cage outlines.
const cages = [
  ['R3C1', 'R4C1'],
  ['R5C1', 'R6C2', 'R7C1', 'R6C1'],
  ['R9C1', 'R8C1', 'R8C2', 'R7C2'],
  ['R8C4', 'R8C3', 'R9C3'],
  ['R7C4', 'R7C3', 'R6C3'],
  ['R9C4', 'R9C5'],
  ['R4C4', 'R5C4', 'R6C4', 'R6C5'],
  ['R3C4', 'R3C5'],
  ['R1C5', 'R1C6'],
  ['R1C7', 'R2C7', 'R2C6'],
  ['R3C6', 'R3C7', 'R4C7'],
  ['R1C9', 'R2C9', 'R2C8', 'R3C8'],
  ['R3C9', 'R4C9', 'R4C8', 'R5C9'],
  ['R6C9', 'R7C9'],
  ['R7C5', 'R7C6'],
  ['R4C5', 'R4C6', 'R5C6', 'R6C6'],
];

const lastDigitSpec = NFA.encodeSpec({
  startState: Array.from({ length: 10 }, (_, x) => ({ x, modSum: 0 })),
  transition: ({ x, modSum }, value) => {
    if (value === SEGMENT_BREAK) {
      // The cage just finished: check it, then reset for the next one.
      return (modSum === x) ? { x, modSum: 0 } : undefined;
    }
    return { x, modSum: (modSum + value) % 10 };
  },
  // No SEGMENT_BREAK follows the last cage, so its check happens here.
  accept: ({ x, modSum }) => modSum === x,
}, 9, { multiSegment: true });

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...cages.map(cells => new Cage('', ...cells)),
  new NFA(lastDigitSpec, 'cage-last-digit', ...cages),
];
