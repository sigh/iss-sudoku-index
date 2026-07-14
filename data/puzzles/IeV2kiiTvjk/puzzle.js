// Title: Ice Breaker
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=IeV2kiiTvjk
// Source: https://sudokupad.app/i46kzqcugi

// Normal Sudoku rules apply. Green lines are German whispers (adjacent digits
// differ by at least 5), and purple lines are renbans (non-repeating consecutive
// sets). Across all drawn-line cells, digit d may occur at most d times.

const greenLines = [
  ['R8C2', 'R7C2', 'R6C2', 'R6C3', 'R6C4'],
  ['R9C5', 'R9C6', 'R9C7', 'R8C7', 'R7C7'],
  ['R3C8', 'R2C8', 'R1C8', 'R1C7', 'R1C6'],
  ['R2C3', 'R3C3', 'R4C3', 'R4C4', 'R4C5'],
];

const purpleLines = [
  ['R7C5', 'R6C5', 'R5C5', 'R5C6', 'R5C7'],
  ['R6C1', 'R5C1', 'R5C2'],
  ['R9C8', 'R8C8', 'R8C9'],
  ['R9C2', 'R9C3', 'R8C3'],
];

// This grey line has no local rule; it participates only in the global count.
const greyLine = ['R3C9', 'R4C9', 'R4C8', 'R4C7', 'R3C7'];

// Count each physical cell once if lines intersect.
const lineCells = [...new Set([
  ...greenLines.flat(),
  ...purpleLines.flat(),
  ...greyLine,
])];

const atMostDigitOccurrences = (digit) => {
  const machine = NFA.encodeSpec({
    startState: { count: 0 },
    transition: ({ count }, value) => {
      if (value !== digit) return { count };
      if (count === digit) return undefined;
      return { count: count + 1 };
    },
    accept: () => true,
  }, 9);
  return new NFA(machine, `line-count-${digit}`, ...lineCells);
};

return [
  new Shape('9x9'),
  ...greenLines.map(cells => new Whisper(5, ...cells)),
  ...purpleLines.map(cells => new Renban(...cells)),
  // Sudoku already limits each digit to nine total grid occurrences, so the
  // digit-9 instance of the global rule would be redundant.
  ...Array.from({ length: 8 }, (_, index) => atMostDigitOccurrences(index + 1)),
];
