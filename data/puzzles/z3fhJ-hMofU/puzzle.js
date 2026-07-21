// Title: Not All Who Wander Are Lost
// Author: Allagem
// Video: https://www.youtube.com/watch?v=z3fhJ-hMofU
// Source: https://sudokupad.app/7exqntdae5

// Every line can be split into nonempty contiguous segments, all sharing one
// sum across both lines. A segment on the two-cell line sums to at most 18.
const MAX_SEGMENT_SUM = 18;

const equalSegmentSum = NFA.encodeSpec({
  startState: { target: null, current: 0 },

  transition: ({ target, current }, value) => {
    // A line boundary is valid only after closing its final segment.
    if (value === SEGMENT_BREAK) {
      return target !== null && current === 0
        ? { target, current: 0 }
        : undefined;
    }

    const next = current + value;
    if (target === null) {
      if (next > MAX_SEGMENT_SUM) return undefined;

      // Before the first cut, either continue or set the shared target here.
      return [
        { target: null, current: next },
        { target: next, current: 0 },
      ];
    }

    if (next < target) return { target, current: next };
    if (next === target) return { target, current: 0 };
    return undefined;
  },

  accept: ({ target, current }) => target !== null && current === 0,
}, 9, { multiSegment: true });

const lines = [
  [
    'R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C2', 'R2C3', 'R3C3',
    'R3C2', 'R4C1', 'R4C2', 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R5C2',
    'R5C3', 'R4C3', 'R3C4', 'R2C4', 'R1C5', 'R1C4', 'R2C5', 'R1C6',
    'R2C6', 'R3C6', 'R3C7', 'R3C8', 'R4C9', 'R5C9', 'R5C8', 'R6C7',
    'R5C6', 'R4C7', 'R4C6', 'R4C5', 'R5C5', 'R4C4', 'R5C4', 'R6C5',
    'R6C4', 'R7C3', 'R8C2', 'R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2',
    'R9C3', 'R8C4', 'R9C5', 'R9C6', 'R8C5', 'R9C4', 'R8C3', 'R7C4',
    'R7C5', 'R7C6', 'R8C7', 'R8C6', 'R9C7', 'R9C8', 'R9C9', 'R8C8',
    'R7C8', 'R8C9', 'R7C9', 'R6C9', 'R6C8', 'R5C7', 'R4C8', 'R3C9',
    'R2C9', 'R1C9', 'R1C8', 'R2C8', 'R2C7', 'R1C7',
  ],
  ['R6C6', 'R7C7'],
];

return [
  new Shape('9x9'),
  new Given('R3C5', 2, 4, 6, 8),
  new NFA(equalSegmentSum, 'equal segment sums', ...lines),
];
