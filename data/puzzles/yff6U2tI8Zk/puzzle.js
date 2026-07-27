// Title: A Degree in Thermology
// Author: Knickolas
// Video: https://www.youtube.com/watch?v=yff6U2tI8Zk
// Source: https://sudokupad.app/d510hfne1x

// Normal sudoku rules apply. Nine cells, one per row/column/box, are
// "doublers": a doubler cell's value is twice its digit; every other cell's
// value equals its digit. Each digit 1-9 is doubled exactly once. Doubler
// positions are not drawn -- they are solver-discovered, so they are
// modelled with a per-cell flag overlay (VD: 1 = normal, 2 = doubled).
// Thermometers order cells by value (not digit), strictly increasing from
// the bulb. Killer cages: digits in a cage are all different; values in a
// cage sum to the total (a repeated value from different digits is
// allowed, since only digits are constrained to differ).

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const gridCells = graph.cells();
const flag = cell => flags.at(cell);
const interleave = cells => cells.flatMap(cell => [cell, flag(cell)]);

// NFA: scans digit,flag pairs across the whole grid and accepts iff exactly
// one cell carries digit `digit` under a flag of 2 -- i.e. `digit` is
// doubled exactly once. Run once per digit 1-9.
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
}, 9);

// NFA: scans a cage's digit,flag pairs and accepts iff the effective values
// (digit * flag) sum to `total`. Cached per total since several cages share
// one.
const cageSumCache = new Map();
const cageSumSpec = total => {
  if (cageSumCache.has(total)) return cageSumCache.get(total);
  const spec = NFA.encodeSpec({
    startState: { phase: 'digit', sum: 0 },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        return { phase: 'flag', digit: value, sum: state.sum };
      }
      if (value !== 1 && value !== 2) return undefined;
      const sum = state.sum + state.digit * value;
      if (sum > total) return undefined;
      return { phase: 'digit', sum };
    },
    accept: state => state.phase === 'digit' && state.sum === total,
  }, 9);
  cageSumCache.set(total, spec);
  return spec;
};

// NFA: scans a thermometer's digit,flag pairs bulb-to-tip and accepts iff
// each cell's effective value (digit * flag) strictly exceeds the previous
// cell's. `prev: 0` is a safe sentinel since every effective value is >= 1.
const thermoSpec = NFA.encodeSpec({
  startState: { phase: 'digit', prev: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      return { phase: 'flag', digit: value, prev: state.prev };
    }
    if (value !== 1 && value !== 2) return undefined;
    const effective = state.digit * value;
    if (state.prev !== 0 && effective <= state.prev) return undefined;
    return { phase: 'digit', prev: effective };
  },
  accept: state => state.phase === 'digit',
}, 9);

// Killer cages, [total, cells], transcribed from the drawn cage geometry.
const cages = [
  [24, ['R9C7', 'R9C8', 'R9C9']],
  [12, ['R8C1', 'R8C2']],
  [10, ['R1C2', 'R1C3']],
  [24, ['R1C8', 'R2C8', 'R2C9']],
  [8, ['R7C9', 'R8C9']],
  [23, ['R5C4', 'R5C5', 'R5C6']],
];

// Thermometers, bulb-first cell order, transcribed from the drawn line
// geometry (each entry's first cell is the bulb).
const thermometers = [
  ['R8C7', 'R7C6', 'R7C5', 'R7C4'],
  ['R2C3', 'R3C4', 'R3C5', 'R3C6'],
  ['R2C7', 'R1C6', 'R1C5', 'R1C4'],
  ['R8C3', 'R9C4', 'R9C5', 'R9C6'],
  ['R7C2', 'R6C3', 'R5C3', 'R4C3'],
  ['R3C2', 'R4C1', 'R5C1', 'R6C1'],
  ['R3C8', 'R4C7', 'R5C7', 'R6C7'],
  ['R7C8', 'R6C9', 'R5C9', 'R4C9'],
  ['R2C8', 'R3C7', 'R4C6'],
];

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flag(gridCells[0]), 1, 2)),

  // Exactly one doubler per row/column/box: with flags in {1,2}, a house's
  // nine flags sum to 10 iff exactly one cell in it is doubled.
  ...graph.rows().map(row => new Sum(10, ...flags.at(row))),
  ...graph.columns().map(column => new Sum(10, ...flags.at(column))),
  ...graph.boxes().map(box => new Sum(10, ...flags.at(box))),

  // Each digit 1-9 appears in exactly one doubler.
  ...Array.from({ length: 9 }, (_, i) => new NFA(
    doubledDigitSpec(i + 1), `doubled-digit-${i + 1}`, ...interleave(gridCells))),

  ...cages.flatMap(([total, cells]) => [
    new AllDifferent(...cells),
    new NFA(cageSumSpec(total), `cage-value-sum-${total}`, ...interleave(cells)),
  ]),

  ...thermometers.map(cells => new NFA(
    thermoSpec, 'thermo-values', ...interleave(cells))),
];
