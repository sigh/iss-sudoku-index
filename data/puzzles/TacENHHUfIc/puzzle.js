// Title: Lief, the Univeres, and Everythign
// Author: SSG
// Video: https://www.youtube.com/watch?v=TacENHHUfIc
// Source: https://sudokupad.app/3nkifpknc6

// Normal sudoku, default 3x3 boxes (regions array matches the default boxes).
// The rules state "every clue is wrong" and then define nine named rules,
// one per colour/shape, each of which would make its clue "not wrong" if
// obeyed. Checking every drawn clue's own literal reading against the known
// digits shows the naive/literal reading fails for every single instance of
// every clue family (all four "42" cages sum to 40/37/41/38, all four purple
// lines miss being consecutive runs, all ten quads are missing a listed
// digit, and so on) -- so "every clue is wrong" is the puzzle's one real,
// universal rule: each clue below enforces the *negation* of its named rule,
// never the rule itself.
//
// Two clue families display a comparison sign ("<42", ">8", "<31", "<8")
// instead of a plain total. Read at face value (the shown inequality is the
// clue's own literal, "wrong" reading) and negated like everything else, they
// become ordinary flipped-inequality sum clues -- Killer for the centre cage,
// Ascending Starters for the four outside labels -- with no separate omission
// needed.
//
// Where a clue's rule is a conjunction of "no repeat" with another condition
// (Killer, Renban), the "repeat" branch of the negation is dropped: every
// cage and Renban line here is entirely inside one row, one column, or one
// box, so the baseline sudoku rules already force it distinct, and the
// negation collapses to just the other condition failing. (Tracking the
// repeat branch explicitly is also infeasible -- it blows the NFA's 4096-
// state cap once combined with the running sum/span state.)

const renbanLines = [ // purple lines -- Renban, negated
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9'],
  ['R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1'],
];

const modularLines = [ // teal lines -- Modular Lines (mod 3), negated
  ['R1C9', 'R2C9', 'R2C8', 'R3C8'],
  ['R6C8', 'R7C8', 'R8C8'],
  ['R4C3', 'R4C4', 'R5C4'],
];

const entropicLines = [ // peach lines -- Entropic Lines, negated
  ['R4C6', 'R4C7', 'R3C7'],
  ['R6C3', 'R6C4', 'R7C4'],
];

const nabnerLines = [ // yellow lines -- Nabner, negated ("no two cells" is
  ['R4C7', 'R3C7', 'R3C6'],                   // every pair, not only neighbours)
  ['R7C6', 'R7C7', 'R8C7'],
  ['R8C4', 'R8C3', 'R7C3'],
];

const parityLines = [ // red lines -- Parity Lines (adjacent parity == Modular(2)), negated
  ['R5C7', 'R5C6', 'R4C6'],
  ['R8C6', 'R8C7', 'R7C7'],
  ['R8C4', 'R7C4', 'R7C3'],
];

const ambiguousThermoLines = [ // gray lines -- Ambiguous Thermos, negated:
  ['R2C2', 'R2C1', 'R1C2'],   // must break monotonicity in BOTH directions
  ['R1C2', 'R2C2', 'R3C2'],
  ['R1C8', 'R1C9', 'R2C9'],
  ['R2C8', 'R3C8', 'R3C9'],
  ['R4C3', 'R3C4'],
  ['R5C4', 'R4C4', 'R3C4'],
  ['R6C6', 'R6C7', 'R7C7'],
  ['R8C3', 'R7C3', 'R6C3'],
];

const cages42 = [ // Killer cages labelled "42", negated: sum != 42
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'],
  ['R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
];

// The centre cage, labelled "<42": naive reading "sum < 42", negated to "sum >= 42".
const centerCage =
  ['R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5'];

const quads = [ // digit(s) transcribed from each quad's corner circle overlay
  ['R1C8', [2]], ['R1C3', [8]], ['R1C6', [3, 1]], ['R1C1', [4]],
  ['R7C1', [4]], ['R7C8', [2]], ['R8C4', [8]], ['R8C5', [3, 1]],
  ['R5C8', [8, 2]], ['R5C2', [1, 9]],
];

// Four outside labels (Ascending Starters), read starting at the cell
// nearest the clue and proceeding into the grid, negated (flipped inequality,
// boundary-inclusive since "not <" is ">=" and "not >" is "<="):
// - left of row 2, "< 42": row 2 left-to-right, negated sum >= 42.
// - above column 4, "> 8": column 4 top-to-bottom, negated sum <= 8.
// - above column 6, "< 31": column 6 top-to-bottom, negated sum >= 31.
// - below column 5, "< 8": column 5 bottom-to-top, negated sum >= 8.
const ascendingStarters = [
  { op: '<', target: 42, cells: ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'] },
  { op: '>', target: 8, cells: ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'] },
  { op: '<', target: 31, cells: ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6'] },
  { op: '<', target: 8, cells: ['R9C5', 'R8C5', 'R7C5', 'R6C5', 'R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5'] },
];

// -- Negated-rule NFAs. Each accepts exactly when the named rule's own
// definition is FALSE for the scanned cells (never when it holds).

// Renban, negated: the repeat branch is dropped (see header) -- the cells do
// not span exactly `length` consecutive values.
function wrongRenban(length) {
  return NFA.encodeSpec({
    startState: { min: 9, max: 1 },
    transition: ({ min, max }, value) => ({
      min: Math.min(min, value),
      max: Math.max(max, value),
    }),
    accept: ({ min, max }) => max - min !== length - 1,
  }, 9);
}

// Modular(mod), negated: some window of `mod` consecutive cells has two
// cells sharing a residue -- tracked via a sliding window of the last
// (mod - 1) residues.
function wrongModular(mod) {
  return NFA.encodeSpec({
    startState: { window: [], bad: false },
    transition: ({ window, bad }, value) => {
      const residue = value % mod;
      return {
        window: [...window, residue].slice(-(mod - 1)),
        bad: bad || window.includes(residue),
      };
    },
    accept: ({ bad }) => bad,
  }, 9);
}

// Entropic, negated: some window of 3 consecutive cells has two cells in the
// same tier {1,2,3}/{4,5,6}/{7,8,9} -- same sliding-window shape as Modular(3).
const wrongEntropic = NFA.encodeSpec({
  startState: { window: [], bad: false },
  transition: ({ window, bad }, value) => {
    const tier = Math.floor((value - 1) / 3);
    return {
      window: [...window, tier].slice(-2),
      bad: bad || window.includes(tier),
    };
  },
  accept: ({ bad }) => bad,
}, 9);

// Nabner, negated: some pair (any two positions, not just neighbours) shares
// a digit or is consecutive -- track every digit seen so far and check each
// new digit against the seen mask widened by +-1.
const wrongNabner = NFA.encodeSpec({
  startState: { mask: 0, bad: false },
  transition: ({ mask, bad }, value) => {
    const neighbourMask = (1 << (value - 1))
      | (value > 1 ? 1 << (value - 2) : 0)
      | (value < 9 ? 1 << value : 0);
    return {
      mask: mask | (1 << (value - 1)),
      bad: bad || (mask & neighbourMask) !== 0,
    };
  },
  accept: ({ bad }) => bad,
}, 9);

// Ambiguous Thermo, negated: monotonicity broken in BOTH directions (neither
// a valid increasing nor decreasing reading survives to the end).
const wrongAmbiguousThermo = NFA.encodeSpec({
  startState: { previous: null, up: true, down: true },
  transition: ({ previous, up, down }, value) => ({
    previous: value,
    up: up && (previous === null || previous < value),
    down: down && (previous === null || previous > value),
  }),
  accept: ({ up, down }) => !up && !down,
}, 9);

// Killer, negated: the repeat branch is dropped (see header) -- the sum does
// not equal `target`. Clamped at target + 1: past that, the running sum
// (strictly increasing) can never return to `target`, so every state beyond
// it is interchangeable -- required to keep the compiled state count finite.
function wrongCageNotEqual(target) {
  return NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => Math.min(sum + value, target + 1),
    accept: sum => sum !== target,
  }, 9);
}

// Killer with a "<" total, negated to ">=": clamped at target since every sum
// that reaches or passes it satisfies ">=" identically.
function wrongCageAtLeast(target) {
  return NFA.encodeSpec({
    startState: 0,
    transition: (sum, value) => Math.min(sum + value, target),
    accept: sum => sum >= target,
  }, 9);
}

// Quadruples, negated: at least one listed digit is missing from the block.
function wrongQuad(values) {
  const complete = (1 << values.length) - 1;
  return NFA.encodeSpec({
    startState: 0,
    transition: (mask, value) => {
      const index = values.indexOf(value);
      return index < 0 ? mask : mask | (1 << index);
    },
    accept: mask => mask !== complete,
  }, 9);
}

// Ascending Starters, negated: the first ascending run's sum does not
// satisfy the displayed comparison (`op`/`target`), read starting at the
// first listed cell (nearest the clue) until digits stop ascending. `sum` is
// clamped at the point past which further growth cannot change the negated
// comparison's outcome (see wrongCageNotEqual/AtLeast) to keep the state
// count finite.
function wrongAscendingStarter(op, target) {
  const holds = op === '<' ? (sum => sum < target) : (sum => sum > target);
  const clampAt = op === '<' ? target : target + 1;
  return NFA.encodeSpec({
    startState: { previous: null, sum: 0, locked: false },
    transition: ({ previous, sum, locked }, value) => {
      if (locked) return { previous: value, sum, locked: true };
      if (previous === null) return { previous: value, sum: value, locked: false };
      if (value > previous) {
        return { previous: value, sum: Math.min(sum + value, clampAt), locked: false };
      }
      return { previous: value, sum, locked: true };
    },
    accept: ({ sum }) => !holds(sum),
  }, 9);
}

const graph = cellGraph('9x9');

return [
  new Shape('9x9'),
  ...renbanLines.map(cells => new NFA(wrongRenban(cells.length), 'wrong renban', ...cells)),
  ...modularLines.map(cells => new NFA(wrongModular(3), 'wrong modular', ...cells)),
  ...entropicLines.map(cells => new NFA(wrongEntropic, 'wrong entropic', ...cells)),
  ...nabnerLines.map(cells => new NFA(wrongNabner, 'wrong nabner', ...cells)),
  ...parityLines.map(cells => new NFA(wrongModular(2), 'wrong parity', ...cells)),
  ...ambiguousThermoLines.map(cells => new NFA(wrongAmbiguousThermo, 'wrong ambiguous thermo', ...cells)),
  ...cages42.map(cells => new NFA(wrongCageNotEqual(42), 'wrong 42 cage', ...cells)),
  new NFA(wrongCageAtLeast(42), 'wrong <42 cage', ...centerCage),
  ...quads.map(([topLeft, values]) =>
    new NFA(wrongQuad(values), 'wrong quad', ...graph.block(topLeft, 2, 2))),
  ...ascendingStarters.map(({ op, target, cells }) =>
    new NFA(wrongAscendingStarter(op, target), 'wrong ascending starter', ...cells)),
];
