// Title: Non-repeating Palindromes
// Author: Amin Khalek
// Video: https://www.youtube.com/watch?v=IJ2UIrox_xw
// Source: https://sudokupad.app/100ywt1d63

// Normal Sudoku. VD flags each cell as a doubler (1), halver (2), or ordinary
// cell (3). Each row, column, box, and digit has one doubler and one halver.
// Grey lines are palindromes, blue lines have equal sums in their box-defined
// segments, and the two inequality arrows point at the smaller modified value.
const graph = cellGraph('9x9');
const modifier = graph.makeOverlay('VD');
const flag = cell => modifier.at(cell);
const stream = cells => cells.flatMap(cell => [cell, flag(cell)]);
const scaled = (digit, state) => digit * (state === 1 ? 4 : state === 2 ? 1 : 2);
const digits = Array.from({ length: 9 }, (_, i) => i + 1);

// An interleaved digit/flag stream. A flag turns its preceding digit into twice,
// half, or its ordinary value (all values are scaled by two to keep integers).
function digitFlagCountSpec(target, targetFlag) {
  return NFA.encodeSpec({
    startState: { count: 0, digit: null },
    transition: ({ count, digit }, value) => {
      if (digit === null) return { count, digit: value };
      const next = count + (digit === target && value === targetFlag ? 1 : 0);
      return next > 1 ? undefined : { count: next, digit: null };
    },
    accept: ({ count, digit }) => digit === null && count === 1,
    maxDepth: 162,
  }, 9);
}

// Compare the scaled values at two mirrored positions of a grey line.
const sameModifiedValueSpec = NFA.encodeSpec({
  startState: { step: 0, digit: null, first: null },
  transition: ({ step, digit, first }, value) => {
    if (step >= 4) return undefined;
    if (digit === null) return { step: step + 1, digit: value, first };
    const actual = scaled(digit, value);
    if (step === 1) return { step: 2, digit: null, first: actual };
    return actual === first ? { step: 4, digit: null, first } : undefined;
  },
  accept: ({ step, digit }) => step === 4 && digit === null,
  maxDepth: 4,
}, 9);

// A blue line is read as its two box-defined segments; their scaled totals match.
function equalSegmentSpec(firstLength, cellCount) {
  return NFA.encodeSpec({
    startState: { step: 0, digit: null, difference: 0 },
    transition: ({ step, digit, difference }, value) => {
      if (step >= cellCount * 2) return undefined;
      if (digit === null) return { step: step + 1, digit: value, difference };
      const cellIndex = (step - 1) / 2;
      const signedValue = cellIndex < firstLength ? scaled(digit, value) : -scaled(digit, value);
      return { step: step + 1, digit: null, difference: difference + signedValue };
    },
    accept: ({ step, digit, difference }) =>
      step === cellCount * 2 && digit === null && difference === 0,
    maxDepth: cellCount * 2 + 1,
  }, 9);
}

// The first paired cell is the one indicated by the inequality arrow.
const smallerValueSpec = NFA.encodeSpec({
  startState: { values: [] },
  transition: ({ values }, value) => {
    const next = [...values, value];
    if (next.length === 4) return scaled(next[0], next[1]) < scaled(next[2], next[3]) ?
      { values: next } : undefined;
    return { values: next };
  },
  accept: ({ values }) => values.length === 4,
  maxDepth: 4,
}, 9);

const greyLines = [
  ['R5C7', 'R4C8', 'R5C9', 'R6C8'],
  ['R4C2', 'R5C2', 'R6C2'],
  ['R8C7', 'R7C8', 'R8C9', 'R9C8'],
  ['R2C7', 'R1C8', 'R2C9', 'R3C8'],
  ['R5C1', 'R5C2', 'R5C3'],
];

// Blue-line cell lists are transcribed from the drawn strokes, split at box borders.
const blueSegments = [
  [['R1C4'], ['R1C3', 'R2C3', 'R3C3']],
  [['R9C4'], ['R9C3', 'R8C3', 'R7C3']],
  [['R2C5', 'R3C5'], ['R4C5', 'R4C6']],
  [['R8C5', 'R8C4', 'R7C4'], ['R6C4']],
];

const firstFlag = modifier.cells()[0];
const units = [
  ...Array.from({ length: 9 }, (_, i) => modifier.at(graph.row(i + 1))),
  ...Array.from({ length: 9 }, (_, i) => modifier.at(graph.column(i + 1))),
  ...Array.from({ length: 9 }, (_, i) => modifier.at(graph.box(i + 1))),
];

return [
  new Shape('9x9'),
  modifier.toVar('doubler-halver flags'),
  modifier.makeReplicate(new Given(firstFlag, 1, 2, 3)),
  ...units.map(unit => new ContainExact('1_2', ...unit)),
  ...digits.flatMap(digit => [
    new NFA(digitFlagCountSpec(digit, 1), `doubler-${digit}`, ...stream(graph.cells())),
    new NFA(digitFlagCountSpec(digit, 2), `halver-${digit}`, ...stream(graph.cells())),
  ]),
  ...greyLines.flatMap(cells => cells.slice(0, Math.floor(cells.length / 2)).map((cell, i) =>
    new NFA(sameModifiedValueSpec, 'palindrome', ...stream([cell, cells[cells.length - 1 - i]])))),
  ...blueSegments.map(segments => new NFA(
    equalSegmentSpec(segments[0].length, segments.flat().length),
    'equal-sum', ...stream(segments.flat()))),
  new NFA(smallerValueSpec, 'inequality', ...stream(['R6C6', 'R7C6'])),
  new NFA(smallerValueSpec, 'inequality', ...stream(['R3C7', 'R4C7'])),
];
