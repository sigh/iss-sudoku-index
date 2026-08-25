// Title: Inky, Blinky, Tricky & Treaty
// Author: Nell Gwyn
// Video: https://www.youtube.com/watch?v=gB712fgIs6Y
// Source: https://app.crackingthecryptic.com/webapp/3B3nGpmF44

// Normal sudoku, killer cage, thermometer and sandwich rules apply, except:
// exactly one clue among all the cage sums, thermometers and sandwich totals
// below is a "Trickster" and lies -- that one clue's own literal claim (its
// cage total, its thermometer's strict increase, or its sandwich total) is
// false, while every other clue and every other sudoku rule holds normally.
// (Once solved, the Trickster's own true digits are said to spell a hidden
// message; that is flavour text with no further effect on the grid, so it is
// not encoded here.)
//
// Each clue gets its own 1|2 flag Var (1 = true, 2 = Trickster) gating an
// `Or` of that clue's normal rule and its negation; `ContainExact` pins
// exactly one flag, across all clue types, to 2.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const ALL_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// Cage clues; two are single-cell -- easy to overlook, but real -- so they
// are modelled as a one-cell "sum".
const cageClues = [
  { cells: ['R4C7', 'R5C7', 'R5C6'], sum: 23 },
  { cells: ['R4C6'], sum: 1 },
  { cells: ['R4C4', 'R5C4', 'R5C3'], sum: 9 },
  { cells: ['R4C3'], sum: 9 },
];

// Thermometer clues, each written bulb cell first.
const thermoClues = [
  ['R7C1', 'R6C1', 'R5C1', 'R4C1'],
  ['R6C9', 'R5C9', 'R4C9'],
  ['R8C8', 'R9C7', 'R8C6', 'R9C5', 'R8C4', 'R9C3', 'R8C2'],
  ['R3C2', 'R2C3'],
  ['R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C8'],
];

// Sandwich (outside) clues, read off the left-of-row / above-column lanes.
const sandwichClues = [
  { cells: graph.row(2), sum: 2 },
  { cells: graph.row(3), sum: 6 },
  { cells: graph.row(4), sum: 7 },
  { cells: graph.row(5), sum: 18 },
  { cells: graph.row(6), sum: 11 },
  { cells: graph.row(7), sum: 11 },
  { cells: graph.row(8), sum: 30 },
  { cells: graph.column(3), sum: 0 },
  { cells: graph.column(4), sum: 6 },
  { cells: graph.column(5), sum: 6 },
  { cells: graph.column(6), sum: 6 },
  { cells: graph.column(8), sum: 0 },
];

const cageFlags = new Var('VC', 'cage clue flags (1 true, 2 Trickster)', cageClues.length);
const thermoFlags = new Var('VH', 'thermometer clue flags (1 true, 2 Trickster)', thermoClues.length);
const sandwichFlags = new Var('VS', 'sandwich clue flags (1 true, 2 Trickster)', sandwichClues.length);

// A cage's total is monotonic in its (positive) cell values, so once the
// running sum passes the target it can never return to it: collapse every
// such sum to one sink state (target + 1) instead of counting further.
// Accepts every final sum except the exact target -- the cage's own
// distinctness is asserted separately by an AllDifferent alongside this.
const wrongCageSumSpec = (target) => NFA.encodeSpec({
  startState: 0,
  transition: (sum, value) => Math.min(sum + value, target + 1),
  accept: (sum) => sum !== target,
}, 9);

// A sandwich clue's between-sum, scanned across the whole 9-cell row/column:
// `inside` toggles on the 1 and the 9 (normal sudoku guarantees exactly one
// of each per line), and only cells seen while inside are added to the
// (monotonic) running sum, which is likewise clamped once past the target.
// Accepts every final sum except the exact target.
const wrongSandwichSumSpec = (target) => NFA.encodeSpec({
  startState: { inside: false, sum: 0 },
  transition: ({ inside, sum }, value) => {
    if (value === 1 || value === 9) return { inside: !inside, sum };
    if (!inside) return { inside, sum };
    return { inside, sum: Math.min(sum + value, target + 1) };
  },
  accept: ({ sum }) => sum !== target,
}, 9);

// "Not strictly increasing" -- the pairwise negation an `Or` of per-edge
// failures needs to falsify a whole thermometer (see edge loop below).
const notIncreasingKey = Pair.fnToKey((a, b) => a >= b, 9);

const cageConstraints = cageClues.map((clue, i) => {
  const flag = cageFlags.cell(i + 1);
  const isSingleCell = clue.cells.length === 1;
  const trueBranch = isSingleCell
    ? new Given(clue.cells[0], clue.sum)
    : new Cage(clue.sum, ...clue.cells);
  const falseBranch = isSingleCell
    ? new Given(clue.cells[0], ...ALL_VALUES.filter(v => v !== clue.sum))
    : new And([
      new AllDifferent(...clue.cells),
      new NFA(wrongCageSumSpec(clue.sum), `cage-wrong-sum-${i}`, ...clue.cells),
    ]);
  return new Or([
    new And([new Given(flag, 1), trueBranch]),
    new And([new Given(flag, 2), falseBranch]),
  ]);
});

const thermoConstraints = thermoClues.map((cells, i) => {
  const flag = thermoFlags.cell(i + 1);
  const trueBranch = new Thermo(...cells);
  const edgeFailures = [];
  for (let j = 0; j + 1 < cells.length; j++) {
    edgeFailures.push(new Pair(notIncreasingKey, `thermo-wrong-${i}`, cells[j], cells[j + 1]));
  }
  const falseBranch = new Or(edgeFailures);
  return new Or([
    new And([new Given(flag, 1), trueBranch]),
    new And([new Given(flag, 2), falseBranch]),
  ]);
});

const sandwichConstraints = sandwichClues.map((clue, i) => {
  const flag = sandwichFlags.cell(i + 1);
  const trueBranch = Sandwich.fromCells(clue.sum, clue.cells, geometry);
  const falseBranch = new NFA(wrongSandwichSumSpec(clue.sum), `sandwich-wrong-${i}`, ...clue.cells);
  return new Or([
    new And([new Given(flag, 1), trueBranch]),
    new And([new Given(flag, 2), falseBranch]),
  ]);
});

const allFlags = [...cageFlags.cells(), ...thermoFlags.cells(), ...sandwichFlags.cells()];

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C2', 6),
  new Given('R2C4', 7),
  new Given('R2C5', 6),
  new Given('R3C7', 6),
  new Given('R4C8', 6),
  new Given('R5C5', 7),
  new Given('R7C9', 6),
  new Given('R9C1', 6),
  new Given('R9C6', 7),

  cageFlags,
  thermoFlags,
  sandwichFlags,
  ...allFlags.map(f => new Given(f, 1, 2)),
  // Exactly one clue, of any type, is the Trickster.
  new ContainExact('2', ...allFlags),

  ...cageConstraints,
  ...thermoConstraints,
  ...sandwichConstraints,
];
