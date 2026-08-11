// Title: 10 Lines
// Author: zetamath
// Video: https://www.youtube.com/watch?v=6noZ-Aq-nO4
// Source: https://app.crackingthecryptic.com/sudoku/DMp47hdP2D

// Normal sudoku on the 9x9 grid (standard boxes, no givens).
//
// Each grey line splits into one or more contiguous, non-overlapping groups
// of cells, each summing to exactly 10; digits may repeat on a line and
// within a group. Given a fixed reading order of a line's cells, this
// partition is forced: a group's running sum only ever increases (digits are
// >= 1), so it must close exactly when the running sum hits 10 -- there is no
// point where the solver could choose to end a group early or read past a
// sum of 10. So the whole rule reduces to a deterministic scan: track the
// current group's running sum, reset it to 0 whenever it hits exactly 10,
// reject if it ever exceeds 10, and require the scan to end back at 0 (no
// leftover partial group). `sumTo10Spec` below is exactly that scan, shared
// by every line.
const sumTo10Spec = NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => {
    const total = sum + value;
    if (total === 10) return 0;   // group closes; next cell starts a new one
    if (total < 10) return total; // still accumulating this group
    return undefined;             // total > 10: no valid partition here
  },
  accept: (sum) => sum === 0,
}, 9);

// Open lines, transcribed from the drawn grey-line paths (in the order they
// are drawn; the closed loop is handled separately below).
const openLines = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R3C4', 'R3C3', 'R3C2', 'R2C2', 'R2C3', 'R1C4'],
  ['R1C5', 'R1C6', 'R2C6', 'R3C6'],
  ['R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9'],
  ['R4C4', 'R3C5', 'R4C6', 'R5C7'],
  ['R6C3', 'R6C2', 'R6C1', 'R7C1'],
  ['R8C2', 'R7C2', 'R7C3', 'R7C4'],
  ['R9C3', 'R8C4', 'R7C5', 'R6C6'],
  ['R9C5', 'R9C6', 'R8C6', 'R7C6'],
  ['R8C7', 'R7C8', 'R7C9', 'R6C8', 'R6C7'],
];
const openLineConstraints = openLines.map(
  (cells, i) => new NFA(sumTo10Spec, `line${i}`, cells));

// Closed loop (payload line #5): R4C5-R5C4-R6C5-R5C6-R4C5, a genuine 4-cell
// cycle (the repeated R4C5 is the wraparound, not a 5th cell). A line with no
// endpoints has no fixed start, so the grouping must work for *some* starting
// point around the ring, not necessarily the payload's own listed order.
// (Reading direction doesn't add cases: reversing a valid grouping of a
// sequence -- open or, by the same mirrored-cut-points argument, cyclic --
// yields another valid grouping of the reverse, since reversing a group
// doesn't change its sum.) So this is an Or over the 4 rotations of the
// cycle, each checked with the same deterministic scan.
const loopCells = ['R4C5', 'R5C4', 'R6C5', 'R5C6'];
const loopRotations = loopCells.map(
  (_, i) => [...loopCells.slice(i), ...loopCells.slice(0, i)]);
const loopConstraint = new Or(loopRotations.map(
  (cells, i) => new NFA(sumTo10Spec, `loop-rot${i}`, cells)));

return [
  new Shape('9x9'),
  ...openLineConstraints,
  loopConstraint,
];
