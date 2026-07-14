// Title: The Only Constant is Change
// Author: Erin Toler
// Video: https://www.youtube.com/watch?v=UFZqd4u7dNg
// Source: https://sudokupad.app/erin-toler/the-only-constant-is-change

// Normal sudoku rules apply.
//
// Echo Lines (indigo): filled with a repeating sequence of one or more
// different digits; the full sequence must appear at least twice along the
// line and must always repeat in its entirety. (The black strokes under the
// indigo/yellow lines are decorative backing at identical coordinates, not a
// second clue.)
//
// Nabner Lines (yellow): no two digits on the line, anywhere on it (not just
// adjacent cells), may be the same or consecutive.
//
// Killer Cages: digits in a cage may not repeat and must sum to the given
// total.

// An Echo line of length n is exactly some period-p sequence of p distinct
// digits (p >= 1), repeated whole n/p >= 2 times ("must always repeat in its
// entirety" rules out a partial trailing copy, so p must divide n). For each
// admissible p, cells at the same position mod p must share a value, and the
// p distinct positions within one period must be pairwise different. When a
// line length has only one admissible p (e.g. length 3 -> only p=1, "all
// cells equal"), that is a structural fact about the line's length, not a
// solution-fitted guess, so it is encoded directly rather than left as an Or.
function echoLine(cells) {
  const n = cells.length;
  const periods = [];
  for (let p = 1; p <= Math.floor(n / 2); p++) {
    if (n % p === 0) periods.push(p);
  }

  const branchConstraints = (p) => {
    const residueGroups = [];
    for (let j = 0; j < p; j++) {
      const group = [];
      for (let i = j; i < n; i += p) group.push(cells[i]);
      residueGroups.push(group);
    }
    const sameValueConstraints = residueGroups
      .filter((g) => g.length > 1)
      .map((g) => new SameValues(g.length, ...g));
    const reps = residueGroups.map((g) => g[0]);
    return [...sameValueConstraints, new AllDifferent(...reps)];
  };

  if (periods.length === 1) {
    // Only one admissible period: no disjunction needed.
    return branchConstraints(periods[0]);
  }
  return [new Or(periods.map((p) => new And(branchConstraints(p))))];
}

const echoLines = [
  ['R8C1', 'R8C2', 'R8C3', 'R7C4', 'R7C5', 'R7C6', 'R6C7', 'R5C7', 'R4C7', 'R3C8', 'R2C8', 'R1C8'],
  ['R2C1', 'R3C1', 'R4C2', 'R4C3', 'R3C4', 'R2C4', 'R1C3', 'R1C2'],
  ['R5C3', 'R4C4', 'R3C5'],
];

const nabnerLines = [
  ['R5C8', 'R6C9'],
  ['R8C5', 'R9C6'],
];

// "Same or consecutive" over every pair on the line (PairX = all-pairs, not
// just line-adjacent cells).
const nabnerKey = PairX.fnToKey((a, b) => a !== b && Math.abs(a - b) !== 1, 9);

const cages = [
  [17, ['R1C2', 'R2C1', 'R2C2']],
  [22, ['R2C5', 'R2C6', 'R3C5', 'R3C6']],
  [21, ['R4C5', 'R5C4', 'R5C5']],
  [15, ['R5C2', 'R5C3', 'R6C2', 'R6C3']],
  [14, ['R7C9', 'R8C9']],
  [15, ['R9C7', 'R9C8']],
];

return [
  new Shape('9x9'),

  ...cages.map(([total, cells]) => new Cage(total, ...cells)),

  ...echoLines.flatMap(echoLine),

  ...nabnerLines.map((cells) => new PairX(nabnerKey, 'Nabner', ...cells)),
];
