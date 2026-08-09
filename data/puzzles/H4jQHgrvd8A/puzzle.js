// Title: Bis Repetita
// Author: Zelbulon
// Video: https://www.youtube.com/watch?v=H4jQHgrvd8A
// Source: https://app.crackingthecryptic.com/sudoku/4hmqJ9MJF2

// Normal sudoku rules (rows, columns, boxes all-different) apply. Each of the
// six orange lines below must have every digit that appears on it repeated
// the same number of times as every other digit that appears on it (a digit
// appearing exactly once, or two different digits on the same line appearing
// different numbers of times, is forbidden).
//
// For a line of length L this is equivalent to: there is some multiplicity m
// (a divisor of L, m >= 2, since a repeated digit appears at least twice)
// such that every digit 1-9 appears on the line either 0 times or exactly m
// times. The valid m values differ per line length and are computed below
// rather than hand-enumerated. For each candidate m, one small counting NFA
// per digit checks that digit's count on the line is 0 or m (the counter is
// clamped at m+1, a sink meaning "already too many for this m"); the nine
// per-digit NFAs for a given m are ANDed together (all nine invariants must
// hold at once), and the valid m choices for a line are ORed together (the
// line's true multiplicity is exactly one of them).

const lines = [
  // Line cell paths transcribed from the drawn orange line polylines
  // (interpolated) for each of the six orange lines.
  ['R1C3', 'R1C4', 'R2C5', 'R3C5', 'R3C6', 'R2C6', 'R1C6', 'R2C7', 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R3C9', 'R4C8', 'R5C8', 'R6C7', 'R7C6', 'R8C6', 'R9C7', 'R8C8', 'R7C7'],
  ['R2C8', 'R3C8', 'R3C7', 'R4C7', 'R5C7', 'R5C6', 'R5C5', 'R6C5', 'R7C4'],
  ['R9C6', 'R9C5', 'R8C5', 'R8C4', 'R9C3', 'R9C2', 'R8C2', 'R7C3', 'R6C2', 'R6C1', 'R5C1', 'R4C1'],
  ['R6C4', 'R5C4', 'R5C3', 'R5C2', 'R4C2', 'R3C2', 'R3C1', 'R2C1'],
  ['R1C1', 'R1C2', 'R2C2', 'R2C3', 'R2C4', 'R3C4', 'R4C4', 'R4C3'],
];

const divisorsAtLeast2 = (n) => {
  const out = [];
  for (let d = 2; d <= n; d++) if (n % d === 0) out.push(d);
  return out;
};

// One digit's "count on this line is 0 or m" NFA.
const countIsZeroOrM = (digit, m) => NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => (
    value === digit ? Math.min(count + 1, m + 1) : count
  ),
  accept: (count) => count === 0 || count === m,
}, 9);

// For one line and one candidate multiplicity m: every digit 1-9 appears 0 or
// m times on the line (nine per-digit NFAs, ANDed).
const multiplicityHolds = (cells, m) => new And(
  Array.from({ length: 9 }, (_, i) => i + 1).map(
    digit => new NFA(countIsZeroOrM(digit, m), `count(${digit}) in {0,${m}}`, ...cells)
  )
);

// A line's rule holds under exactly one m dividing its length (m >= 2); ORing
// over every such m covers every faithful reading without picking one.
const bisRepetitaLine = (cells) => new Or(
  divisorsAtLeast2(cells.length).map(m => multiplicityHolds(cells, m))
);

return [
  new Shape('9x9'),
  new Given('R2C6', 1),
  new Given('R3C7', 6),
  new Given('R4C3', 3),
  new Given('R4C6', 4),
  new Given('R6C1', 4),
  new Given('R6C4', 8),
  new Given('R7C5', 8),
  new Given('R8C9', 5),
  new Given('R9C1', 9),
  new Given('R9C7', 7),
  ...lines.map(bisRepetitaLine),
];
