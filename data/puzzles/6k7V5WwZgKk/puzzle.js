// Title: Divison Cell
// Author: billybobo et al.
// Video: https://www.youtube.com/watch?v=6k7V5WwZgKk
// Source: https://app.crackingthecryptic.com/sudoku/r3LL9t2PLB

// Normal sudoku rules apply (default 9x9 boxes -- the puzzle's regions are
// exactly the nine default boxes). Each cage's top-left number is a
// divisor: the digits in that cage must sum to a multiple of it. A cage's
// digits are also read as distinct within the cage -- the standard "cage"
// convention (killer-style: distinct + sum), not stated separately in this
// puzzle's rules text. No two of the 22 cages below, of any size, may add
// up to the same actual total ("cage sums cannot be repeated"); there is no
// built-in for this, so it is built below from every pair of cages whose
// possible totals can coincide.

// Cages: [cells, divisor]. Cell lists transcribed from the puzzle's cage
// clues (drawn cells plus the top-left divisor number).
const CAGES = [
  { cells: ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1'], divisor: 7 },
  { cells: ['R3C2', 'R3C3'], divisor: 1 },
  { cells: ['R1C5', 'R2C5', 'R3C5'], divisor: 6 },
  { cells: ['R1C6'], divisor: 3 },
  { cells: ['R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C9'], divisor: 7 },
  { cells: ['R3C7', 'R3C8'], divisor: 1 },
  { cells: ['R5C1', 'R5C2', 'R5C3'], divisor: 6 },
  { cells: ['R4C4', 'R4C5', 'R5C4', 'R6C4'], divisor: 10 },
  { cells: ['R4C6', 'R5C6', 'R6C5', 'R6C6'], divisor: 10 },
  { cells: ['R5C5'], divisor: 1 },
  { cells: ['R4C7', 'R4C8', 'R4C9'], divisor: 7 },
  { cells: ['R5C7', 'R5C8', 'R5C9'], divisor: 6 },
  { cells: ['R7C1', 'R8C1', 'R9C1'], divisor: 2 },
  { cells: ['R7C2', 'R8C2', 'R9C2'], divisor: 2 },
  { cells: ['R8C3', 'R9C3'], divisor: 2 },
  { cells: ['R7C3'], divisor: 1 },
  { cells: ['R9C4'], divisor: 1 },
  { cells: ['R7C5', 'R8C5', 'R9C5'], divisor: 6 },
  { cells: ['R7C6', 'R8C6'], divisor: 1 },
  { cells: ['R7C7'], divisor: 1 },
  { cells: ['R8C7', 'R8C8'], divisor: 2 },
  { cells: ['R7C8', 'R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9'], divisor: 2 },
];

// Every sum of `size` distinct digits from 1-9 that is a multiple of
// `divisor` -- bounds the Or(Sum...) below to exactly the cage's feasible
// totals instead of hand-picking them.
function achievableSums(size, divisor) {
  const results = new Set();
  const combo = [];
  (function pick(start) {
    if (combo.length === size) {
      const total = combo.reduce((a, b) => a + b, 0);
      if (total % divisor === 0) results.add(total);
      return;
    }
    for (let v = start; v <= 9; v++) {
      combo.push(v);
      pick(v + 1);
      combo.pop();
    }
  })(1);
  return [...results].sort((a, b) => a - b);
}

const cageConstraints = CAGES.flatMap(({ cells, divisor }) => {
  const parts = [];
  if (cells.length > 1) parts.push(new AllDifferent(...cells));
  if (divisor > 1) {
    const targets = achievableSums(cells.length, divisor);
    parts.push(new Or(targets.map(v => new Sum(v, ...cells))));
  }
  return parts;
});

// "Cage sums cannot be repeated": no two cages' realized totals may match.
// A single-cell cage's total is just its digit, so one AllDifferent already
// covers every pair among them. For every other pair, forbid the two totals
// from coinciding by requiring their (signed) difference to be one of the
// nonzero values that difference can actually take -- i.e. never 0 -- built
// from each cage's own feasible-totals set above, not hand-enumerated.
const cageSumSets = CAGES.map(({ cells, divisor }) => achievableSums(cells.length, divisor));

const singleCellCages = CAGES.filter(c => c.cells.length === 1).map(c => c.cells[0]);
const singleCellDistinct = singleCellCages.length > 1
  ? [new AllDifferent(...singleCellCages)]
  : [];

const distinctCageSumConstraints = [];
for (let i = 0; i < CAGES.length; i++) {
  for (let j = i + 1; j < CAGES.length; j++) {
    const a = CAGES[i], b = CAGES[j];
    if (a.cells.length === 1 && b.cells.length === 1) continue; // covered above
    const setA = cageSumSets[i], setB = cageSumSets[j];
    if (!setA.some(x => setB.includes(x))) continue; // totals can't coincide anyway
    const diffs = new Set();
    for (const x of setA) {
      for (const y of setB) {
        if (x !== y) diffs.add(x - y);
      }
    }
    distinctCageSumConstraints.push(new Or([...diffs].map(d => new Sum(
      d, ...a.cells.map(c => [c, 1]), ...b.cells.map(c => [c, -1])))));
  }
}

return [
  new Shape('9x9'),
  new Given('R1C7', 7),
  new Given('R5C2', 6),
  new Given('R6C9', 5),
  ...cageConstraints,
  ...singleCellDistinct,
  ...distinctCageSumConstraints,
];
