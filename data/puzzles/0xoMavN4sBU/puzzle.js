// Title: A Puzzle By A Child Prodigy
// Author: Undar Beyond
// Video: https://www.youtube.com/watch?v=0xoMavN4sBU
// Source: https://cracking-the-cryptic.web.app/sudoku/7pMjHf3n34

// Normal sudoku rules apply (standard rows/cols/3x3 boxes; no givens).
// Each cage's digits are all different, and its printed total is the sum of
// the digits that sit, along the drawn path, strictly between the cell
// holding the cage's smallest digit and the cell holding its largest digit
// -- a positional reading, not a value one: the rules explicitly note the
// smallest and largest digits need not be at the ends of the cage, which
// only makes sense if "between" tracks the path, since every non-extreme
// cage digit is trivially value-between the extremes by definition. (A
// value-only reading is also arithmetically impossible here: the second
// cage, five cells, prints total 7, but five distinct digits' three
// non-extreme values sum to at least 2+3+4=9.) Three cages print a total of
// 0 -- a genuine zero, not "no total": in this payload's cage geometry a
// no-total cage's value is an empty string, not the number 0.

// Cage cell lists, transcribed from the puzzle's cage geometry, in the order
// each path was drawn (this order is load-bearing for the rule above). One
// cage's raw cell list is not itself in path order -- its last two entries
// are swapped relative to grid adjacency (R4C7 borders R4C6, the first
// entry, not R6C5, the entry before it) -- so it is reordered here to the
// connected path R4C7-R4C6-R5C6-R5C5-R6C5 that the listed cells actually
// form; which direction a path is walked does not affect the rule, since it
// only changes which position along it is called "first".
const cages = [
  { cells: ['R1C4', 'R2C4', 'R3C4', 'R3C3'], total: 5 },
  { cells: ['R1C7', 'R1C6', 'R2C6', 'R3C6', 'R3C7'], total: 7 },
  { cells: ['R1C8', 'R1C9', 'R2C9', 'R3C9'], total: 0 },
  { cells: ['R2C1', 'R3C1', 'R4C1', 'R4C2', 'R5C2'], total: 0 },
  { cells: ['R8C1', 'R7C1', 'R6C1', 'R6C2', 'R6C3', 'R5C3'], total: 21 },
  { cells: ['R4C5', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R7C5', 'R7C6', 'R8C6', 'R8C7'], total: 27 },
  { cells: ['R4C7', 'R4C6', 'R5C6', 'R5C5', 'R6C5'], total: 20 },
  { cells: ['R4C8', 'R5C8', 'R5C9', 'R6C9'], total: 12 },
  { cells: ['R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8'], total: 0 },
  { cells: ['R8C2', 'R8C3', 'R8C4', 'R9C4', 'R9C5', 'R9C6'], total: 16 },
];

// Nondeterministically guesses which two digit VALUES {a, b} (a < b) are the
// cage's extremes, then scans the path once to check that guess and the
// total in a single pass. State: {a, b, phase, sum}.
//   phase 'seek'   -- before either extreme has been read; every cell must
//                      equal a, equal b, or lie strictly in (a, b) (else this
//                      (a, b) guess is not really the extreme pair -- dead).
//   phase 'waitA'  -- b was read first; accumulating cells strictly in
//                      (a, b) into `sum` until a is read.
//   phase 'waitB'  -- symmetric, waiting for b.
//   phase 'done'   -- both extremes read, in path order; remaining cells
//                      must still lie in (a, b) (they are still cage digits,
//                      just outside the two extremes' span) but no longer
//                      count toward the sum.
// The a/b-to-a/b transition requires `sum === target` at the exact moment
// the second extreme is read, so a wrong guess or a wrong total dies before
// the end rather than needing a separate flag carried to `accept`.
function betweenExtremesSumSpec(target) {
  const starts = [];
  for (let a = 1; a <= 9; a++) {
    for (let b = a + 1; b <= 9; b++) {
      starts.push({ a, b, phase: 'seek', sum: 0 });
    }
  }
  return NFA.encodeSpec({
    startState: starts,
    transition: (state, value) => {
      const { a, b, phase, sum } = state;
      const inSpan = value > a && value < b;
      if (phase === 'seek') {
        if (value === a) return { a, b, phase: 'waitB', sum: 0 };
        if (value === b) return { a, b, phase: 'waitA', sum: 0 };
        return inSpan ? { a, b, phase: 'seek', sum: 0 } : undefined;
      }
      if (phase === 'waitA' || phase === 'waitB') {
        const waitingFor = phase === 'waitA' ? a : b;
        if (value === waitingFor) {
          return sum === target ? { a, b, phase: 'done', sum: 0 } : undefined;
        }
        if (!inSpan) return undefined;
        const nextSum = sum + value;
        return nextSum > target ? undefined : { a, b, phase, sum: nextSum };
      }
      // phase === 'done'
      return inSpan ? { a, b, phase: 'done', sum: 0 } : undefined;
    },
    accept: (state) => state.phase === 'done',
  }, 9);
}

function cageConstraints({ cells, total }) {
  return [
    new AllDifferent(...cells),
    new NFA(betweenExtremesSumSpec(total), 'between-extremes sum', ...cells),
  ];
}

return [
  new Shape('9x9'),
  ...cages.flatMap(cageConstraints),
];
