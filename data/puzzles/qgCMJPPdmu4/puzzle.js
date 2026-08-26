// Title: Irwell
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=qgCMJPPdmu4
// Source: https://sudokupad.app/james-sinclair/irwell

// VD is a parallel flag layer: 1 means an ordinary cell and 2 means a
// Doubler. Every value-sensitive constraint below scans grid digit / VD flag
// pairs and uses digit * flag as the cell's effective value.
const graph = cellGraph('6x6');
const flags = graph.makeOverlay('VD');
const cells = graph.cells();
const flag = cell => flags.at(cell);
const interleave = clueCells => clueCells.flatMap(cell => [cell, flag(cell)]);

const doubledDigitSpec = digit => NFA.encodeSpec({
  startState: { phase: 'digit', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, count: state.count };
    }
    if (value !== 1 && value !== 2) return undefined;
    const count = state.count + (state.digit === digit && value === 2 ? 1 : 0);
    if (count > 1) return undefined;
    return { phase: 'digit', count };
  },
  accept: state => state.phase === 'digit' && state.count === 1,
}, 6);

const effectivePairSpec = predicate => NFA.encodeSpec({
  startState: { phase: 'first-digit' },
  transition: (state, value) => {
    if (state.phase === 'first-digit') {
      return { phase: 'first-flag', digit: value };
    }
    if (state.phase === 'first-flag') {
      if (value !== 1 && value !== 2) return undefined;
      return { phase: 'second-digit', first: state.digit * value };
    }
    if (state.phase === 'second-digit') {
      return { phase: 'second-flag', first: state.first, digit: value };
    }
    if (state.phase === 'second-flag') {
      if (value !== 1 && value !== 2) return undefined;
      return predicate(state.first, state.digit * value) ? { phase: 'done' } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 'done',
}, 6);

// Even value is a true 2-cell relation (digit, flag) -- a Pair, not an NFA.
const evenValueKey = Pair.fnToKey((digit, flagValue) => (digit * flagValue) % 2 === 0, 6);

const thermoSpec = effectivePairSpec((bulb, tip) => tip > bulb);

// Thermometer: two drawn strokes share a rounded bulb at R3C2 (confirmed by
// the filled-circle underlay there) and fork into two increasing arms.
// Strict increase along each arm is equivalent to strict increase on every
// adjacent pair, so each arm is a chain of pairwise "tip > bulb" checks.
const THERMO_ARMS = [
  ['R3C2', 'R2C1'],
  ['R3C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C6'],
];

function thermoPairs(arm) {
  const pairs = [];
  for (let i = 0; i + 1 < arm.length; i++) pairs.push([arm[i], arm[i + 1]]);
  return pairs;
}

// Shaded-square underlays: these six cells must hold an even value.
const EVEN_CELLS = ['R1C6', 'R3C6', 'R4C6', 'R6C1', 'R6C2', 'R6C3'];

return [
  new Shape('6x6'),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flag(cells[0]), 1, 2), flags.at(cells)),

  // Six flags sum to 7 exactly when exactly one cell in the group is doubled
  // (five 1s and one 2).
  ...graph.rows().map(row => new Sum(7, ...flags.at(row))),
  ...graph.columns().map(column => new Sum(7, ...flags.at(column))),
  ...graph.boxes().map(box => new Sum(7, ...flags.at(box))),

  // The six doubler cells contain different digits: each digit 1-6 occurs
  // exactly once beneath a flag of 2.
  ...Array.from({ length: 6 }, (_, i) => new NFA(
    doubledDigitSpec(i + 1), `doubled digit ${i + 1}`, ...interleave(cells))),

  ...THERMO_ARMS.flatMap(arm => thermoPairs(arm).map(([bulb, tip]) =>
    new NFA(thermoSpec, 'thermometer values', ...interleave([bulb, tip])))),

  ...EVEN_CELLS.map(cell => new Pair(evenValueKey, 'even value', cell, flag(cell))),
];
