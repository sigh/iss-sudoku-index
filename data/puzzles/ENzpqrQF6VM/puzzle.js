// Title: Far Far Away
// Author: Agent
// Video: https://www.youtube.com/watch?v=ENzpqrQF6VM
// Source: https://sudokupad.app/9557h2w0uy

// Normal Sudoku rules apply. Nine cells are doublers: one is in each row,
// column, and box, and each digit appears in exactly one doubler. A doubler's
// value is twice its digit. Each listed single-cell cage gives X + Y, where X
// is its cell's value and Y is a value X cells away orthogonally.
const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const cells = graph.cells();
const flagCells = flags.at(cells);
const flag = cell => flagCells[cells.indexOf(cell)];

// The flag is 1 for an ordinary cell and 2 for a doubler.
const flagDomains = flags.makeReplicate(new Given(flagCells[0], 1, 2));
const oneDoublerPerUnit = [
  ...graph.rows(),
  ...graph.columns(),
  ...graph.boxes(),
].map(unit => new Sum(11, ...unit.map(flag)));

// This two-symbol machine counts occurrences of one Sudoku digit with flag 2.
const oneDoublerOfDigit = digit => {
  const machine = NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count, digitMatch }, value) => {
      if (digitMatch === undefined) return { count, digitMatch: value === digit };
      const nextCount = count + (digitMatch && value === 2 ? 1 : 0);
      return nextCount <= 1 ? { count: nextCount } : undefined;
    },
    accept: ({ count, digitMatch }) => digitMatch === undefined && count === 1,
  }, 9);
  return new NFA(machine, `doubler ${digit}`, ...cells.flatMap(cell => [cell, flag(cell)]));
};
const oneDoublerPerDigit = Array.from({ length: 9 }, (_, i) => oneDoublerOfDigit(i + 1));

// This machine reads caged digit/flag then remote digit/flag. Its state holds
// the first effective value, and only accepts the specified cage total.
const remoteSum = (origin, target, distance, total) => {
  const machine = NFA.encodeSpec({
    startState: { phase: 'originDigit' },
    transition: (state, value) => {
      if (state.phase === 'originDigit') return { phase: 'originFlag', digit: value };
      if (state.phase === 'originFlag') {
        const x = state.digit * value;
        return x === distance ? { phase: 'targetDigit', x } : undefined;
      }
      if (state.phase === 'targetDigit') return { phase: 'targetFlag', x: state.x, digit: value };
      return { phase: 'done', valid: state.x + state.digit * value === total };
    },
    accept: state => state.phase === 'done' && state.valid,
  }, 9);
  return new NFA(machine, `remote sum ${total}`, origin, flag(origin), target, flag(target));
};

const remoteTargets = origin => {
  const { row, col } = parseCellId(origin);
  const targets = [];
  for (let distance = 1; distance <= 8; distance++) {
    for (const [dr, dc] of [[-distance, 0], [distance, 0], [0, -distance], [0, distance]]) {
      const targetRow = row + dr;
      const targetCol = col + dc;
      if (targetRow >= 1 && targetRow <= 9 && targetCol >= 1 && targetCol <= 9) {
        targets.push([makeCellId(targetRow, targetCol), distance]);
      }
    }
  }
  return targets;
};

// Cage totals transcribed from the drawn single-cell Remote Sum cages.
const cageTotals = [
  ['R1C1', 8], ['R1C3', 19], ['R1C9', 10], ['R3C9', 19], ['R4C4', 15],
  ['R5C2', 5], ['R5C5', 14], ['R5C8', 12], ['R6C6', 10], ['R7C1', 19],
  ['R8C5', 8], ['R9C1', 4], ['R9C7', 19], ['R9C9', 16],
];
const remoteSums = cageTotals.map(([origin, total]) => new Or(
  remoteTargets(origin).map(([target, distance]) => remoteSum(origin, target, distance, total))
));

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  flagDomains,
  ...oneDoublerPerUnit,
  // The exact once-per-digit doubler condition is omitted.
  ...remoteSums,
];
