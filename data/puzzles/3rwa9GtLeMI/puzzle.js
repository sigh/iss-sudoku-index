// Title: Sumthing
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=3rwa9GtLeMI
// Source: https://app.crackingthecryptic.com/77hB996Dn8

// Normal Sudoku rules apply. On each brown line, if its end digits are X and
// Y, the first X digits from the X end and the first Y digits from the Y end
// have equal sums. The endpoint digit cannot exceed the line length.
const shape = new Shape('9x9');

// These are the nine brown lines, transcribed from the drawn paths.
const lines = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R1C4', 'R1C3', 'R1C2', 'R2C2', 'R3C2', 'R3C3', 'R3C4', 'R2C4'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5', 'R5C5', 'R6C5'],
  ['R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9'],
  ['R6C7', 'R7C7', 'R8C7', 'R7C6', 'R8C6', 'R9C6'],
  ['R7C5', 'R6C4', 'R6C3', 'R7C2', 'R8C3', 'R8C4', 'R8C5'],
  ['R9C5', 'R9C4', 'R9C3', 'R9C2', 'R8C2', 'R9C1', 'R8C1'],
  ['R7C1', 'R6C1', 'R6C2', 'R5C2', 'R4C2', 'R4C3', 'R5C3', 'R5C4', 'R4C4'],
  ['R2C7', 'R1C7', 'R1C8', 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8',
    'R6C9', 'R7C9', 'R7C8', 'R8C8', 'R8C9', 'R9C9', 'R9C8'],
];

// A two-segment NFA scans the line from both ends.  Its first segment obtains
// X and sums exactly X cells; its reverse segment obtains the fixed candidate
// Y and subtracts exactly Y cells.  Zero final difference is the required sum.
function xSumAlternative(line, y) {
  const length = line.length;
  const machine = NFA.encodeSpec({
    startState: {phase: 'left', target: 0, seen: 0, difference: 0},
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        return state.phase === 'left' && state.seen === state.target
          ? {phase: 'right', seen: 0, difference: state.difference}
          : undefined;
      }
      if (state.phase === 'left') {
        if (state.seen === 0) {
          return value <= length
            ? {phase: 'left', target: value, seen: 1, difference: value}
            : undefined;
        }
        return state.seen < state.target
          ? {...state, seen: state.seen + 1, difference: state.difference + value}
          : state;
      }
      if (state.seen === 0) {
        return value === y
          ? {phase: 'right', seen: 1, difference: state.difference - value}
          : undefined;
      }
      return state.seen < y
        ? {...state, seen: state.seen + 1, difference: state.difference - value}
        : state;
    },
    accept: state => state.phase === 'right' && state.seen === y &&
      state.difference === 0,
    maxDepth: 2 * length + 1,
  }, shape, {multiSegment: true});
  return new NFA(machine, `X-sum line, Y=${y}`, line, [...line].reverse());
}

const xSums = lines.map(line => new Or(
  Array.from({length: Math.min(9, line.length)}, (_, i) =>
    xSumAlternative(line, i + 1))));

return [shape, ...xSums];
