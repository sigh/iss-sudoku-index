// Title: Quick-Thinking Liar
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=S-55FmZyUA4
// Source: https://app.crackingthecryptic.com/sudoku/bGqRMb8hhp

// Normal sudoku rules apply (default 3x3 boxes; the drawn regions are all
// standard boxes).
//
// 13 killer cages are drawn with a total, no-repeat by default, but the rules
// state exactly one cage's condition is broken -- either its sum is wrong,
// a digit repeats in it, or both. Each cage gets a flag Var in {1, 2}: 1 means
// the cage holds (Cage: all-different + sum), 2 means it is the liar, so its
// negation holds instead (a repeated digit among the cage's cells, or a wrong
// sum, or both). Exactly one flag is 2, forced by Sum(cageCount + 1, ...flags)
// since each flag contributes 1 plus an extra 1 only when it is the liar.
//
// The negation's "repeated digit" half only needs a same-value test for cage
// cell pairs not already forced distinct by row/column/box (derived from the
// cage's own cell coordinates, not hand-picked); a cage with no such pair can
// only be lying via its sum. The negation's "wrong sum" half is an NFA that
// clamps the running sum at total + 1 and accepts everything except the exact
// total.
//
// The 4 purple lines are "incomplete arrows" (rules text): no arrowhead marks
// which end holds the sum, so each is encoded as the disjunction over both
// endpoints being the sum cell, the other cells on the line being the addends.

const cages = [
  { total: 30, cells: ['R1C1', 'R1C2', 'R2C2', 'R2C3'] },
  { total: 16, cells: ['R3C1', 'R3C2', 'R4C2', 'R4C3'] },
  { total: 16, cells: ['R7C1', 'R6C1', 'R6C2', 'R6C3'] },
  { total: 30, cells: ['R7C2', 'R8C2', 'R8C1', 'R9C1'] },
  { total: 12, cells: ['R9C3', 'R8C3', 'R8C4', 'R7C4'] },
  { total: 6, cells: ['R5C4', 'R6C4'] },
  { total: 14, cells: ['R5C6', 'R6C6'] },
  { total: 12, cells: ['R7C6', 'R8C6', 'R8C7', 'R9C7'] },
  { total: 4, cells: ['R7C8', 'R8C8'] },
  { total: 5, cells: ['R8C9', 'R9C9'] },
  { total: 20, cells: ['R7C9', 'R6C9', 'R6C8', 'R6C7'] },
  { total: 11, cells: ['R4C7', 'R4C8', 'R3C8', 'R3C9'] },
  { total: 28, cells: ['R2C7', 'R2C8', 'R1C8', 'R1C9'] },
];

const boxOf = ({ row, col }) => `${Math.floor((row - 1) / 3)}_${Math.floor((col - 1) / 3)}`;

// Cage pairs not already forced distinct by a shared row, column, or box --
// these are the only pairs whose equality is real evidence of the "repeated
// digit" half of a cage's negation.
const freePairs = cells => {
  const pairs = [];
  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const a = parseCellId(cells[i]), b = parseCellId(cells[j]);
      if (a.row === b.row || a.col === b.col || boxOf(a) === boxOf(b)) continue;
      pairs.push([cells[i], cells[j]]);
    }
  }
  return pairs;
};

// Sum of `cells` is not exactly `total`. A 2-cell cage is a Pair relation; a
// larger cage is an NFA carrying the running sum, clamped at total + 1 (a sink
// meaning "already too high"), accepting every final sum except exactly `total`.
const wrongSum = (total, cells) => {
  if (cells.length === 2) {
    return new Pair(
      Pair.fnToKey((a, b) => a + b !== total, 9), `wrongSum${total}`, ...cells);
  }
  const spec = NFA.encodeSpec({
    startState: { sum: 0 },
    transition: ({ sum }, value) => ({ sum: Math.min(sum + value, total + 1) }),
    accept: ({ sum }) => sum !== total,
  }, 9);
  return new NFA(spec, `wrongSum${total}`, cells);
};

const flagsVar = new Var('F', 'cage liar flags', cages.length);
const flags = flagsVar.cells();

const cageConstraints = cages.map((cage, i) => {
  const flag = flags[i];
  const pairs = freePairs(cage.cells);
  const negationParts = [
    wrongSum(cage.total, cage.cells),
    ...pairs.map(([a, b]) => new SameValues(2, a, b)),
  ];
  const negation = negationParts.length === 1
    ? negationParts[0]
    : new Or(negationParts);
  return new Or([
    new And([new Given(flag, 1), new Cage(cage.total, ...cage.cells)]),
    new And([new Given(flag, 2), negation]),
  ]);
});

const flagConstraints = [
  flagsVar,
  ...flags.map(f => new Given(f, 1, 2)),
  // Exactly one flag is 2 (the liar cage): flags in {1, 2} sum to
  // cageCount + (number of liars), so a sum of cageCount + 1 means exactly one.
  new Sum(cages.length + 1, ...flags),
];

// Each incomplete-arrow line: disjunction over which endpoint holds the sum.
const arrowLines = [
  ['R1C5', 'R2C5', 'R3C5', 'R4C5'],
  ['R5C1', 'R5C2', 'R5C3'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R7C5', 'R8C5', 'R9C5'],
];

const arrowConstraints = arrowLines.map(line => {
  const first = line[0], last = line[line.length - 1];
  const rest = line.slice(1, -1);
  return new Or([
    new Arrow(first, ...rest, last),
    new Arrow(last, ...rest, first),
  ]);
});

return [
  new Shape('9x9'),
  ...flagConstraints,
  ...cageConstraints,
  ...arrowConstraints,
];
