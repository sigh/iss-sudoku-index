// Title: Don't even think about Halvers!
// Author: Andyeka
// Video: https://www.youtube.com/watch?v=h4tt57ySjkg
// Source: https://app.crackingthecryptic.com/sudoku/8HtThN6DFr

// Normal Sudoku, the given at R6C4, the 2/9 circle, and every drawn cage are encoded.
// A VD flag of 1 marks a halved digit; 2 marks an ordinary digit. There is one flag 1
// in each row, column, and box, and each digit is paired with flag 1 exactly once.
// Cage machines read each digit followed by its flag and require twice the printed total.
const graph = cellGraph('9x9');
const halver = graph.makeOverlay('VD');
const flag = cell => halver.at(cell);
const interleave = cells => cells.flatMap(cell => [cell, flag(cell)]);
const gridCells = graph.cells();

const CAGES = [
  [37, ['R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1']],
  [17, ['R1C5', 'R1C6']],
  [8, ['R1C8', 'R1C9', 'R2C8', 'R2C9']],
  [3, ['R3C6']],
  [8, ['R4C6', 'R5C6']],
  [15, ['R4C4', 'R5C4']],
  [6, ['R6C3', 'R6C4', 'R7C4']],
  [8, ['R7C3', 'R8C3', 'R9C3']],
  [14, ['R8C6', 'R9C6']],
  [6, ['R6C9', 'R7C9', 'R7C8']],
  [10, ['R8C8', 'R9C8']],
]; // Drawn cages with printed totals.

const NO_TOTAL_CAGE = ['R3C3', 'R3C2', 'R4C2']; // Drawn no-total cage.

function cageSpec(total) {
  return NFA.encodeSpec({
    startState: { sum: 0, digit: null },
    transition({ sum, digit }, value) {
      if (digit === null) return { sum, digit: value };
      const nextSum = sum + digit * value;
      return nextSum <= 2 * total ? { sum: nextSum, digit: null } : undefined;
    },
    accept: ({ sum, digit }) => digit === null && sum === 2 * total,
  }, 9);
}

function halvedDigitSpec(target) {
  return NFA.encodeSpec({
    startState: { count: 0, pending: null },
    transition({ count, pending }, value) {
      if (pending === null) return { count, pending: value === target };
      const nextCount = count + (pending && value === 1 ? 1 : 0);
      return nextCount <= 1 ? { count: nextCount, pending: null } : undefined;
    },
    accept: ({ count, pending }) => pending === null && count === 1,
  }, 9);
}

function cageConstraints(total, cells) {
  if (cells.length === 1) {
    // The one-cell cage's digit and flag must multiply to twice its printed total.
    return [new Pair(
      Pair.fnToKey((digit, modifier) => digit * modifier === 2 * total, 9),
      `${total} cage`, ...interleave(cells)
    )];
  }
  return [
    new AllDifferent(...cells),
    new NFA(cageSpec(total), `${total} cage`, ...interleave(cells)),
  ];
}

const halvedDigits = Array.from({ length: 9 }, (_, i) => new NFA(
  halvedDigitSpec(i + 1), `halved ${i + 1}`, ...interleave(gridCells)
));

const halverGroups = [
  ...Array.from({ length: 9 }, (_, i) => graph.row(i + 1)),
  ...Array.from({ length: 9 }, (_, i) => graph.column(i + 1)),
  ...Array.from({ length: 9 }, (_, i) => graph.box(i + 1)),
];

return [
  new Shape('9x9'),
  new Given('R6C4', 4),
  halver.toVar('halver flags'),
  halver.makeReplicate(new Given(flag('R1C1'), 1, 2)),
  ...halverGroups.map(cells => new Sum(17, ...halver.at(cells))),
  ...halvedDigits,
  new Quad('R1C1', 2, 9),
  ...CAGES.flatMap(([total, cells]) => cageConstraints(total, cells)),
  new AllDifferent(...NO_TOTAL_CAGE),
];
