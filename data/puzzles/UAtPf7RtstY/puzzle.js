// Title: Parity Party XII - Herbst (Autumn)
// Author: Philipp Blume
// Video: https://www.youtube.com/watch?v=UAtPf7RtstY
// Source: https://app.crackingthecryptic.com/webapp/7Jrg7g4FMF

// Normal sudoku on the default 9x9 shape: rows, columns, and boxes.
// Two lines: each a Palindrome (mirrored cells hold equal digits).

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
  [22, [[1, 5], [2, 5]]],
  [17, [[1, 9], [2, 9]]],
  [21, [[3, 9], [3, 8]]],
  [16, [[6, 9], [6, 8]]],
  [11, [[8, 9], [8, 8]]],
  [11, [[3, 1], [3, 2]]],
  [11, [[9, 9], [8, 9]]],
  [13, [[9, 2], [8, 2]]],
  [21, [[5, 1], [5, 2]]],
];
const outsideClues = OUTSIDE_DATA.map(([total, [[r, c], [r2, c2]]]) => {
  const dr = r2 - r;
  const dc = c2 - c;
  const line = Array.from({ length: 9 }, (_, i) => g(r + dr * i, c + dc * i));
  return party(total, line);
});

// The two lines' cell paths, transcribed from the drawn strokes (which cross
// some cells diagonally, corner to corner, rather than edge to edge).
const PALINDROME_A = [
  [6, 6], [5, 5], [4, 4], [3, 3], [2, 2], [3, 1], [4, 1],
];
const PALINDROME_B = [
  [4, 3], [5, 3], [6, 3], [7, 4], [8, 5], [7, 5], [7, 6], [6, 7], [5, 7],
  [4, 7], [3, 8], [3, 7], [3, 6], [3, 5], [3, 4],
];

return [
  new Shape('9x9'),
  new Given('R4C5', 3),
  new Given('R5C4', 2),
  ...outsideClues,
  new Palindrome(...PALINDROME_A.map(([r, c]) => g(r, c))),
  new Palindrome(...PALINDROME_B.map(([r, c]) => g(r, c))),
];
