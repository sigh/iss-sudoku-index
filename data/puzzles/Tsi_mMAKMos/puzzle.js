// Title: Segment Counters
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=Tsi_mMAKMos
// Source: https://sudokupad.app/utaq8fddwh

// Each entry preserves one drawn line as its box-delimited segments and circles.
const lines = [
  {
    segments: [
      ['R2C1', 'R1C1', 'R1C2', 'R1C3'],
      ['R1C4', 'R1C5'],
    ],
    circles: ['R2C1', 'R1C3'],
  },
  {
    segments: [
      ['R5C2', 'R5C3'],
      ['R5C4', 'R5C5', 'R4C5'],
      ['R3C5', 'R2C5', 'R2C6'],
      ['R2C7', 'R2C8', 'R1C8'],
    ],
    circles: ['R1C8'],
  },
  {
    segments: [
      ['R1C9', 'R2C9', 'R3C9', 'R3C8'],
      ['R4C8', 'R5C8', 'R6C8'],
      ['R7C8', 'R7C7', 'R8C7', 'R9C7'],
      ['R9C6', 'R9C5', 'R9C4'],
      ['R9C3', 'R8C3', 'R7C3', 'R7C2'],
      ['R6C2', 'R6C1', 'R5C1'],
    ],
    circles: ['R1C9', 'R2C9', 'R3C9'],
  },
  {
    segments: [
      ['R2C3'],
      ['R2C4', 'R3C4'],
    ],
    circles: ['R3C4'],
  },
  {
    segments: [
      ['R5C6', 'R6C6'],
      ['R7C6', 'R7C5'],
    ],
    circles: [],
  },
];

// The first one-cell segment supplies the circled digit. Each later segment
// contributes one iff it contains that digit, regardless of multiplicity.
const segmentCounter = NFA.encodeSpec({
  startState: { target: null, count: 0, seen: false, scanning: false },
  transition: (state, value) => {
    if (state.target === null) {
      return { target: value, count: 0, seen: false, scanning: false };
    }
    if (value === SEGMENT_BREAK) {
      if (!state.scanning) {
        return { ...state, scanning: true };
      }
      const count = state.count + (state.seen ? 1 : 0);
      if (count > state.target) return undefined;
      return { ...state, count, seen: false };
    }
    return { ...state, seen: state.seen || value === state.target };
  },
  accept: (state) => state.scanning
    && state.count + (state.seen ? 1 : 0) === state.target,
}, 9, { multiSegment: true });

const equalSegmentSums = lines.map(({ segments }) => new EqualSum(...segments));
const circleCounts = lines.flatMap(({ segments, circles }) =>
  circles.map(circle => new NFA(
    segmentCounter,
    'segment counter',
    [circle],
    ...segments,
  )));

return [
  new Shape('9x9'),
  ...equalSegmentSums,
  ...circleCounts,
];
