// Title: Double The Heat
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=AsJC2KmsacU
// Source: https://app.crackingthecryptic.com/sudoku/NbhMLRBtdj

// Normal sudoku rules apply. Digits along a thermometer increase from the
// bulb end. Nine cells in the grid (one per row, column and box) are
// doublers, which count as double their value on thermometers. Each digit
// appears in exactly one doubler.
//
// Doubler placement is solver-discovered: a parallel Var overlay `flags`
// holds 1 (ordinary) or 2 (doubler) per grid cell, paired one-to-one with
// the main grid cells.
const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const cells = graph.cells();

const flagDomains = flags.makeReplicate(new Given(flags.at(cells[0]), 1, 2));

// One doubler per row/column/box: with 8 ordinary cells (flag=1) and one
// doubler (flag=2) per unit, the flags sum to 8*1 + 1*2 = 10.
const oneDoublerPerUnit = [
  ...graph.rows(),
  ...graph.columns(),
  ...graph.boxes(),
].map(unit => new Sum(10, ...flags.at(unit)));

// Each digit appears in exactly one doubler: for every digit, at most one
// (grid cell, flag) pair reads (digit, 2) across the whole grid. Combined
// with the placement Sum above (exactly 9 doublers total), "at most one per
// digit" over all 9 digits forces "exactly one per digit" by pigeonhole.
// State: {digitMatch} while awaiting the paired flag, {count} once read;
// dies (returns undefined) the instant a second doubled occurrence of the
// target digit would be counted, so `accept` only has to let anything
// through that survived the scan.
const cellFlags = flags.at(cells);
const cellAndFlagStream = cells.flatMap((cell, i) => [cell, cellFlags[i]]);
function atMostOneDoublerOfDigit(digit) {
  const machine = NFA.encodeSpec({
    startState: { count: 0 },
    transition: (state, value) => {
      if (state.digitMatch === undefined) {
        return { count: state.count, digitMatch: value === digit };
      }
      const hit = (state.digitMatch && value === 2) ? 1 : 0;
      const nextCount = state.count + hit;
      return nextCount > 1 ? undefined : { count: nextCount };
    },
    accept: (state) => state.digitMatch === undefined,
  }, 9);
  return new NFA(machine, `doubler ${digit}`, ...cellAndFlagStream);
}
const oneDoublerPerDigit =
  Array.from({ length: 9 }, (_, i) => atMostOneDoublerOfDigit(i + 1));

// Thermometers, transcribed as [bulb, tip] from the drawn line/circle
// geometry. All are two cells, so "increase from the bulb" is a single
// comparison of effective values (digit, doubled when flag=2).
// State machine: read bulb digit, bulb flag (-> effB), tip digit, tip flag
// (-> effT); accept iff effT > effB.
const thermometers = [
  ['R1C2', 'R2C3'], ['R3C2', 'R2C1'], ['R4C6', 'R3C7'], ['R3C8', 'R2C9'],
  ['R1C8', 'R2C7'], ['R4C2', 'R5C3'], ['R6C2', 'R5C1'], ['R7C2', 'R8C1'],
  ['R7C4', 'R6C3'], ['R7C5', 'R8C4'], ['R9C5', 'R8C6'], ['R7C8', 'R8C9'],
  ['R9C8', 'R8C7'], ['R6C8', 'R5C7'], ['R4C5', 'R5C6'],
];
const doublerOrderMachine = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0: return { phase: 1, b: value };
      case 1: return { phase: 2, effB: state.b * value };
      case 2: return { phase: 3, effB: state.effB, t: value };
      case 3: return { phase: 4, effB: state.effB, effT: state.t * value };
    }
  },
  accept: (state) => state.phase === 4 && state.effT > state.effB,
}, 9);
const doublerThermos = thermometers.map(([bulb, tip]) => new NFA(
  doublerOrderMachine, 'doubler thermo',
  bulb, flags.at(bulb), tip, flags.at(tip)));

// Givens transcribed from cells[].
const givens = [
  ['R1C5', 9], ['R2C4', 1], ['R2C6', 3], ['R3C3', 7], ['R3C5', 2],
  ['R4C8', 1], ['R5C4', 9], ['R5C9', 2], ['R6C5', 1], ['R6C9', 7],
  ['R8C3', 1], ['R9C1', 8], ['R9C2', 3],
].map(([cell, value]) => new Given(cell, value));

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  flagDomains,
  ...oneDoublerPerUnit,
  ...oneDoublerPerDigit,
  ...doublerThermos,
  ...givens,
];
