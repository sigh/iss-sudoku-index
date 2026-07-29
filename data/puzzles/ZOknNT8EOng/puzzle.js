// Title: Double Arrow Melt
// Author: Black_Doom
// Video: https://www.youtube.com/watch?v=ZOknNT8EOng
// Source: https://app.crackingthecryptic.com/olig7yj3gj

// Normal Sudoku.  A VD flag of 2 marks a doubler; flags are otherwise 1.
// Every row, column, and box has exactly two doublers, and doubler digits
// comprise exactly two copies of every ordinary digit.
const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);
const interleave = cells => cells.flatMap(cell => [cell, flag(cell)]);

const twoFlags = cells => new ContainExact('2_2', ...cells);

function digitTwiceNFA(target) {
  return NFA.encodeSpec({
    startState: { digit: null, count: 0 },
    transition({ digit, count }, value) {
      if (digit === null) return { digit: value, count };
      const nextCount = count + (value === 2 && digit === target ? 1 : 0);
      return nextCount > 2 ? undefined : { digit: null, count: nextCount };
    },
    accept: ({ digit, count }) => digit === null && count === 2,
  }, 9);
}

// Each path is [circle, ...arrow arm], transcribed from the grey arrow strokes.
const ARROWS = [
  ['R1C1', 'R1C2'], ['R1C1', 'R2C1', 'R3C1'],
  ['R9C1', 'R8C1'], ['R9C1', 'R9C2', 'R9C3'],
  ['R1C9', 'R2C9'], ['R1C9', 'R1C8', 'R1C7'],
  ['R9C9', 'R9C8'], ['R9C9', 'R8C9', 'R7C9'],
  ['R9C4', 'R8C4', 'R7C4'], ['R1C6', 'R2C6', 'R3C6'],
  ['R6C5', 'R6C6', 'R5C6'], ['R4C5', 'R4C4', 'R5C4'],
  ['R2C7', 'R3C7', 'R3C8'], ['R8C3', 'R7C3', 'R7C2', 'R6C2'],
  ['R5C9', 'R5C8', 'R4C8'], ['R3C2', 'R3C3', 'R3C4'],
];

function effectiveArrowNFA(length) {
  return NFA.encodeSpec({
    startState: { step: 0, digit: null, balance: 0 },
    transition({ step, digit, balance }, value) {
      if (digit === null) return { step, digit: value, balance };
      const effective = digit * value;
      const nextBalance = balance + (step === 0 ? effective : -effective);
      if (nextBalance < 0) return undefined;
      return {
        step: step + 1,
        digit: null,
        balance: nextBalance,
      };
    },
    accept: ({ step, digit, balance }) => step === length && digit === null && balance === 0,
    maxDepth: length * 2,
  }, 9);
}

// These outside clues are sandwich sums between the two doubler flags.
const SANDWICHES = [
  { label: 'R1=27', cells: graph.row(1), target: 27 },
  { label: 'R6=15', cells: graph.row(6), target: 15 },
  { label: 'R9=14', cells: graph.row(9), target: 14 },
  { label: 'C6=10', cells: graph.column(6), target: 10 },
  { label: 'C9=18', cells: graph.column(9), target: 18 },
  { label: 'C4>0', cells: graph.column(4), target: null },
];

function doublerSandwichNFA(target) {
  return NFA.encodeSpec({
    startState: { digit: null, doublers: 0, sum: 0 },
    transition({ digit, doublers, sum }, value) {
      if (digit === null) return { digit: value, doublers, sum };
      const nextDoublers = doublers + (value === 2 ? 1 : 0);
      const added = value === 1 && doublers === 1 ? digit : 0;
      const nextSum = target === null ? Math.min(1, sum + added) : sum + added;
      if (nextDoublers > 2 || (target !== null && nextSum > target)) return undefined;
      return { digit: null, doublers: nextDoublers, sum: nextSum };
    },
    accept: ({ digit, doublers, sum }) =>
      digit === null && doublers === 2 && (target === null ? sum > 0 : sum === target),
  }, 9);
}

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flags.cells()[0], 1, 2)),
  ...graph.rowsColumnsBoxes().map(cells => twoFlags(flags.at(cells))),
  ...Array.from({ length: 9 }, (_, i) =>
    new NFA(digitTwiceNFA(i + 1), `doubler digit ${i + 1}`, ...interleave(graph.cells()))
  ),
  ...ARROWS.map(cells =>
    new NFA(effectiveArrowNFA(cells.length), 'effective arrow', ...interleave(cells))
  ),
  ...SANDWICHES.map(({ label, cells, target }) =>
    new NFA(doublerSandwichNFA(target), `doubler sandwich ${label}`, ...interleave(cells))
  ),
];
