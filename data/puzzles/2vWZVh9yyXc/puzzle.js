// Title: Crazed wolves on the loose!
// Author: Greenchecker34
// Video: https://www.youtube.com/watch?v=2vWZVh9yyXc
// Source: https://app.crackingthecryptic.com/1yu173j3fy

// Normal Sudoku. Killer cages have distinct digits and their displayed sums.
// A digit appearing in a cage equals the number of cages that contain it.
// Green lines are German whispers. Grey wolf-circle digits appear in no cage.

// Cage cells and totals transcribed from the drawn killer cages; the final cage has no total.
const cages = [
  [22, ['R2C1', 'R2C2', 'R3C1', 'R3C2']],
  [10, ['R1C4', 'R2C4']],
  [17, ['R1C6', 'R1C7', 'R2C7']],
  [15, ['R1C9', 'R2C9']],
  [21, ['R4C7', 'R5C7', 'R5C8']],
  [18, ['R4C4', 'R4C5', 'R5C5']],
  [23, ['R5C1', 'R6C1', 'R7C1', 'R8C1']],
  [20, ['R6C3', 'R7C3', 'R8C3', 'R8C4']],
  [19, ['R9C6', 'R9C7', 'R9C8']],
  [null, ['R7C8', 'R7C9']],
];
const cageCells = cages.map(([, cells]) => cells);

// This multi-segment NFA reads one cage per segment. Its state records whether
// the chosen digit occurred in the current cage and how many completed cages held it.
const cageCountNFA = (digit) => NFA.encodeSpec({
  startState: { seen: false, count: 0 },
  transition: ({ seen, count }, value) => {
    if (value === SEGMENT_BREAK) {
      const nextCount = count + Number(seen);
      return nextCount > digit ? undefined : { seen: false, count: nextCount };
    }
    return { seen: seen || value === digit, count };
  },
  accept: ({ seen, count }) => {
    const total = count + Number(seen);
    return total === 0 || total === digit;
  },
  maxDepth: 39,
}, 9, { multiSegment: true });

// A wolf circle is read first; every cage cell that follows must differ from it.
const wolfNFA = NFA.encodeSpec({
  startState: { digit: null },
  transition: ({ digit }, value) => {
    if (digit === null) return { digit: value };
    return value === digit ? undefined : { digit };
  },
  accept: ({ digit }) => digit !== null,
}, 9);

return [
  new Shape('9x9'),
  ...cages.flatMap(([sum, cells]) =>
    sum === null ? [new AllDifferent(...cells)] : [new Cage(sum, ...cells)]),
  ...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit =>
    new NFA(cageCountNFA(digit), `cage-count-${digit}`, ...cageCells)),
  new Whisper(5, 'R2C4', 'R2C5', 'R2C6', 'R2C7'),
  new Whisper(5, 'R2C9', 'R3C9', 'R4C9'),
  new Whisper(5, 'R9C3', 'R9C4', 'R9C5'),
  new NFA(wolfNFA, 'wolf', 'R5C2', ...cageCells.flat()),
  new NFA(wolfNFA, 'wolf', 'R4C6', ...cageCells.flat()),
];
