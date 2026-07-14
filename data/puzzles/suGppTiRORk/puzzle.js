// Title: Hailstorm
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=suGppTiRORk
// Source: https://sudokupad.app/bcurd4y01m?setting-nogrid=1

// The source uses a 7x7 canvas for a 6x6 Sudoku plus a top/left clue frame.
// The playable source cells R2C2-R7C7 are translated to ISS R1C1-R6C6.
// Outside values are diagonal sums as large as 36, beyond ISS's 16-value
// domain. Comparing the sums directly is the exact grid-only projection.

const shape = new Shape('6x6');

const diagonals = [
  ['R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C5'],
  ['R1C1', 'R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6'],
  ['R1C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6'],
  ['R1C3', 'R2C4', 'R3C5', 'R4C6'],
  ['R1C4', 'R2C5', 'R3C6'],
];

function increasingSums(left, right, label) {
  const spec = NFA.encodeSpec({
    startState: { phase: 'left', difference: 0 },
    transition: (state, value) => {
      if (value === SEGMENT_BREAK) {
        return { phase: 'right', difference: state.difference };
      }
      return state.phase === 'left'
        ? { phase: 'left', difference: state.difference + value }
        : { phase: 'right', difference: state.difference - value };
    },
    accept: state => state.phase === 'right' && state.difference < 0,
    // The extra step is the segment-break symbol between the two sums.
    maxDepth: left.length + right.length + 1,
  }, 6, { multiSegment: true });
  return new NFA(spec, label, left, right);
}

return [
  shape,

  // Source line: R2C3 (bulb), R2C2, R2C1, R1C1, R1C2, R1C3, R1C4.
  // The first two source cells are playable grid cells.
  new Thermo('R1C2', 'R1C1'),

  // The remaining source cells equal these five diagonal sums, so strict
  // increase along that portion is exactly strict increase between sums.
  increasingSums(['R1C1'], diagonals[0], 'grid value < first diagonal sum'),
  ...diagonals.slice(0, -1).map((cells, i) =>
    increasingSums(cells, diagonals[i + 1], `diagonal sum ${i + 1} < ${i + 2}`)
  ),
];
