// Title: Shockwaves
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=N6wm55h60Ss
// Source: https://app.crackingthecryptic.com/sudoku/TFFD8LHJTn

// Normal Sudoku applies. Each VD flag is 1 normally or 2 for a doubler; there
// is one doubler in every row, column, box, and digit. Cage totals use digit *
// flag, while cage digits remain distinct.
const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);
const interleaveFlags = cells => cells.flatMap(cell => [cell, flag(cell)]);

// Drawn cage cells and totals, transcribed from the numbered cage outlines.
const CAGES = [
  [32, ['R2C6', 'R3C6', 'R3C5']],
  [8, ['R4C4', 'R5C4', 'R4C5']],
  [3, ['R1C7', 'R1C8']],
  [3, ['R7C1', 'R8C1']],
  [32, ['R5C3', 'R6C3', 'R6C2']],
  [25, ['R8C6', 'R7C6', 'R7C7', 'R6C7', 'R6C8']],
  [10, ['R9C4', 'R9C5']],
  [12, ['R4C9', 'R5C9']],
  [31, ['R8C9', 'R9C9', 'R9C8']],
];

function weightedCage(total, cells) {
  // The NFA reads each digit followed by its 1-or-2 contribution flag.
  const spec = NFA.encodeSpec({
    startState: { digit: null, sum: 0 },
    transition: ({ digit, sum }, value) => {
      if (digit === null) return { digit: value, sum };
      const nextSum = sum + digit * value;
      return nextSum > total ? undefined : { digit: null, sum: nextSum };
    },
    accept: ({ digit, sum }) => digit === null && sum === total,
    maxDepth: cells.length * 2,
  }, 9);
  return new NFA(spec, `weighted cage ${total}`, ...interleaveFlags(cells));
}

function oneDoublerForDigit(target) {
  // States alternate a grid digit with its flag and count target-digit flags of 2.
  const spec = NFA.encodeSpec({
    startState: { digit: null, count: 0 },
    transition: ({ digit, count }, value) => {
      if (digit === null) return { digit: value, count };
      const nextCount = count + (digit === target && value === 2 ? 1 : 0);
      return nextCount > 1 ? undefined : { digit: null, count: nextCount };
    },
    accept: ({ digit, count }) => digit === null && count === 1,
    maxDepth: graph.cells().length * 2,
  }, 9);
  return new NFA(spec, `doubler digit ${target}`, ...interleaveFlags(graph.cells()));
}

const doublerHouses = flags.rowsColumnsBoxes().map(cells => new Sum(10, ...cells));
const doublerDigits = Array.from({ length: 9 }, (_, i) => oneDoublerForDigit(i + 1));
const cageConstraints = CAGES.flatMap(([total, cells]) => [
  new AllDifferent(...cells),
  weightedCage(total, cells),
]);

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flags.cells()[0], 1, 2)),
  ...doublerHouses,
  ...doublerDigits,
  ...cageConstraints,
];
