// Title: The Vampire
// Author: Pazaaz
// Video: https://www.youtube.com/watch?v=_rdj5HnuYNU
// Source: https://app.crackingthecryptic.com/sudoku/B33RhrGt9n

// Normal sudoku on the default 9x9 shape: rows, columns, and boxes.
// One line: a Palindrome (mirrored cells hold equal digits).

// A Parity Party clue's inclusive prefix sum runs from the edge until the
// first digit whose parity differs from the run of same-parity digits before
// it: at least one digit must set that run before a differing digit can end
// it, so a stop can never land on the very first cell. `stopParity` names the
// parity of the digit that ends the sum; trying both (Or) covers either
// starting parity.
const partyNFA = (target, stopParity) => NFA.encodeSpec({
  startState: { sum: 0, sawRun: false, done: false },
  transition: ({ sum, sawRun, done }, value) => {
    if (done) return { sum, sawRun, done: true };
    const next = sum + value;
    if (next > target) return undefined;
    if (value % 2 === stopParity) {
      if (!sawRun) return undefined;
      return next === target ? { sum: next, sawRun, done: true } : undefined;
    }
    return { sum: next, sawRun: true, done: false };
  },
  accept: ({ done }) => done,
}, 9);
const party = (target, line) => new Or([0, 1].map(stopParity =>
  new NFA(partyNFA(target, stopParity), `Parity Party ${target}`, ...line)));

// Each entry is [clue total, [first cell, second cell]]; first-to-second gives
// the reading direction, extended to the full 9-cell row/column. Transcribed
// from the drawn outside-ring clues, one per lane.
const g = (r, c) => makeCellId(r, c);
const OUTSIDE_DATA = [
  [7, [[1, 2], [2, 2]]],
  [17, [[1, 6], [2, 6]]],
  [5, [[1, 8], [2, 8]]],
  [3, [[1, 1], [1, 2]]],
  [15, [[4, 1], [4, 2]]],
  [27, [[8, 1], [8, 2]]],
  [7, [[2, 9], [2, 8]]],
  [27, [[4, 9], [4, 8]]],
  [21, [[8, 9], [8, 8]]],
  [13, [[9, 9], [9, 8]]],
  [20, [[9, 2], [8, 2]]],
  [29, [[9, 4], [8, 4]]],
];
const outsideClues = OUTSIDE_DATA.map(([total, [[r, c], [r2, c2]]]) => {
  const dr = r2 - r;
  const dc = c2 - c;
  const line = Array.from({ length: 9 }, (_, i) => g(r + dr * i, c + dc * i));
  return party(total, line);
});

// The line's cell path, transcribed from the drawn stroke (which crosses some
// cells diagonally, corner to corner, rather than edge to edge).
const PALINDROME_CELLS = [
  [6, 7], [5, 8], [4, 9], [4, 8], [4, 7], [3, 6], [2, 6], [3, 5], [2, 4],
  [3, 4], [4, 3], [4, 2], [4, 1], [5, 2], [6, 3], [7, 4], [8, 4], [7, 5], [8, 6],
];

return [
  new Shape('9x9'),
  ...outsideClues,
  new Palindrome(...PALINDROME_CELLS.map(([r, c]) => g(r, c))),
];
