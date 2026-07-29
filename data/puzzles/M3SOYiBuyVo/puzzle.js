// Title: Taron
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=M3SOYiBuyVo
// Source: https://sudokupad.app/qvjh329nc0

// Normal sudoku. On each coloured line, box borders form segments. If a digit
// appears in a segment of length N, it appears in every segment of length N or
// greater on that line. A digit d appearing on a line occurs d times there.
// The three drawn lines do not branch or cross. The grey dot and fog only hide
// artwork during solving. Nothing is omitted.

const givens = [
  new Given('R1C9', 6),
  new Given('R6C5', 7),
  new Given('R8C1', 1),
  new Given('R9C2', 6),
];

// The five same-coloured source strokes share endpoints and form the one drawn
// yellow line; the remaining two drawn paths are pink and cyan.
const LINES = [
  [
    'R2C3', 'R3C2', 'R4C2', 'R5C3', 'R5C2', 'R5C1', 'R6C2', 'R6C3',
    'R7C3', 'R7C4', 'R8C4', 'R7C5', 'R7C6', 'R8C7', 'R8C8', 'R9C8',
    'R8C9', 'R7C9', 'R6C8', 'R5C8', 'R4C7', 'R4C6', 'R4C5', 'R5C6',
    'R6C6', 'R6C5', 'R6C4', 'R5C4', 'R4C4', 'R3C4', 'R3C5', 'R2C5',
    'R2C4', 'R1C4', 'R1C5', 'R1C6',
  ],
  ['R3C7', 'R3C8', 'R4C9'],
  ['R9C5', 'R8C6', 'R9C7'],
];

const boxIndex = cell => {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};
const segmentsOf = line => {
  const segments = [];
  for (const cell of line) {
    if (segments.length === 0 ||
        boxIndex(segments[segments.length - 1][0]) !== boxIndex(cell)) {
      segments.push([cell]);
    } else {
      segments[segments.length - 1].push(cell);
    }
  }
  return segments;
};

// This machine scans a line's segments from shortest to longest. For one digit,
// `required` means a shorter segment contained it, while `groupSeen` makes all
// equal-length segments agree. `count` simultaneously enforces that digit d
// occurs either zero times or exactly d times on the whole line.
const lineDigitSpec = (digit, lengths) => {
  const finishSegment = state => {
    const sameLength = state.segment > 0 &&
      lengths[state.segment] === lengths[state.segment - 1];
    if (sameLength) {
      return state.seen === state.groupSeen ? state : undefined;
    }
    if (state.required && !state.seen) return undefined;
    return {
      ...state,
      required: state.required || state.seen,
      groupSeen: state.seen,
    };
  };

  return NFA.encodeSpec({
    startState: {
      segment: 0,
      seen: false,
      required: false,
      groupSeen: false,
      count: 0,
    },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        if (state.segment >= lengths.length - 1) return undefined;
        const finished = finishSegment(state);
        if (finished === undefined) return undefined;
        return {
          segment: state.segment + 1,
          seen: false,
          required: finished.required,
          groupSeen: finished.groupSeen,
          count: state.count,
        };
      }
      const count = state.count + (value === digit ? 1 : 0);
      if (count > digit) return undefined;
      return {
        ...state,
        seen: state.seen || value === digit,
        count,
      };
    },
    accept: state => {
      if (state.segment !== lengths.length - 1) return false;
      const finished = finishSegment(state);
      return finished !== undefined &&
        (finished.count === 0 || finished.count === digit);
    },
    maxDepth: lengths.reduce((sum, length) => sum + length, 0) +
      lengths.length - 1,
  }, 9, { multiSegment: true });
};

const lineRules = LINES.flatMap(line => {
  const segments = segmentsOf(line).sort((a, b) => a.length - b.length);
  const lengths = segments.map(segment => segment.length);
  return Array.from({ length: 9 }, (_, index) => {
    const digit = index + 1;
    return new NFA(
      lineDigitSpec(digit, lengths),
      'region-subset self-count',
      ...segments,
    );
  });
});

return [
  new Shape('9x9'),
  ...givens,
  ...lineRules,
];
