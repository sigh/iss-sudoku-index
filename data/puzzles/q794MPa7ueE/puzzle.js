// Title: Odd Creek
// Author: Arabus
// Video: https://www.youtube.com/watch?v=q794MPa7ueE
// Source: https://app.crackingthecryptic.com/sudoku/rPTbfNrPRH

// Normal sudoku rules apply (default row/column/box all-different).
// Dots/X's are not exhaustively marked ("Not all dots and X's are given"),
// so only the drawn pairs constrain their two cells; every other adjacent
// pair is unconstrained.
// Each white circle gives the count of even digits among its four 2x2
// cells; each is encoded with a small NFA whose state is a running count of
// even digits seen, capped at the circle's own target.
// All odd digits (1,3,5,7,9) must end connected as one orthogonal region.

const givens = [
  new Given('R2C1', 3),
  new Given('R6C3', 8),
];

// Cages: cell sets and totals transcribed from the drawn cage outlines.
const cages = [
  { total: 8, cells: ['R1C4', 'R2C4', 'R3C4'] },
  { total: 14, cells: ['R1C6', 'R1C7'] },
  { total: 15, cells: ['R4C9', 'R5C9', 'R5C8', 'R6C9'] },
  { total: 9, cells: ['R3C6', 'R3C7', 'R3C8'] },
  { total: 7, cells: ['R4C1', 'R4C2', 'R4C3'] },
];
const cageConstraints = cages.map(({ total, cells }) => new Cage(total, ...cells));

// White dots (consecutive digits), transcribed from the white rounded
// edge-marks in the overlay list.
const whiteDots = [
  ['R9C1', 'R9C2'],
  ['R9C2', 'R9C3'],
  ['R6C5', 'R6C6'],
];
const whiteDotConstraints = whiteDots.map(([a, b]) => new WhiteDot(a, b));

// Black dot (ratio 1:2), transcribed from the one black rounded edge-mark.
const blackDotConstraints = [new BlackDot('R2C4', 'R2C5')];

// X marks (sum to 10), transcribed from the "X" text edge-marks.
const xMarks = [
  ['R7C7', 'R8C7'],
  ['R4C9', 'R5C9'],
  ['R1C3', 'R2C3'],
  ['R4C6', 'R4C7'],
  ['R7C6', 'R7C7'],
];
const xConstraints = xMarks.map(([a, b]) => new X(a, b));

// Even-counting circles: 2x2 corner cell groups with a printed target count
// of even digits, transcribed from the circle overlays' corner() cell sets.
const evenCircles = [
  { target: 3, cells: ['R3C1', 'R3C2', 'R4C1', 'R4C2'] },
  { target: 3, cells: ['R5C7', 'R5C8', 'R6C7', 'R6C8'] },
  { target: 3, cells: ['R4C7', 'R4C8', 'R5C7', 'R5C8'] },
  { target: 3, cells: ['R4C4', 'R4C5', 'R5C4', 'R5C5'] },
  { target: 2, cells: ['R3C3', 'R3C4', 'R4C3', 'R4C4'] },
  { target: 2, cells: ['R6C6', 'R6C7', 'R7C6', 'R7C7'] },
  { target: 2, cells: ['R7C7', 'R7C8', 'R8C7', 'R8C8'] },
  { target: 1, cells: ['R3C4', 'R3C5', 'R4C4', 'R4C5'] },
  { target: 1, cells: ['R6C1', 'R6C2', 'R7C1', 'R7C2'] },
];

// NFA state is the running count of even digits seen so far, clamped once it
// can only fail; accept iff the final count equals the circle's own target.
// One compiled machine per distinct target value (1, 2, 3), reused across
// circles sharing that target.
const evenCountSpecCache = new Map();
const evenCountSpec = (target) => {
  if (!evenCountSpecCache.has(target)) {
    evenCountSpecCache.set(target, NFA.encodeSpec({
      startState: 0,
      transition(count, value) {
        const next = count + (value % 2 === 0 ? 1 : 0);
        return next > target ? undefined : next;
      },
      accept: (count) => count === target,
    }, 9));
  }
  return evenCountSpecCache.get(target);
};
const evenCircleConstraints = evenCircles.map(
  ({ target, cells }) => new NFA(evenCountSpec(target), `EvenCount${target}`, ...cells)
);

return [
  new Shape('9x9'),
  ...givens,
  ...cageConstraints,
  ...whiteDotConstraints,
  ...blackDotConstraints,
  ...xConstraints,
  ...evenCircleConstraints,
  new ConnectedValues('', [1, 3, 5, 7, 9]),
];
