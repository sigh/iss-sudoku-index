// Title: Train of thought
// Author: SimplePurpleFrog
// Video: https://www.youtube.com/watch?v=_Fmp3dQYIss
// Source: https://app.crackingthecryptic.com/sudoku/8Pqd64fPMg

// Normal sudoku rules apply. Each grey line is divided into consecutive,
// non-overlapping sections. Each section is one digit (a 'total') followed by
// more than one digit summing to that total. The total/sum ordering is fixed
// per line but not given: each line is read from one of its two ends, and
// which end starts with a total is for the solver to determine.
//
// Modelled as one state machine per line, tried in both reading directions
// (Or of the forward and reversed cell order) since the starting end is
// unknown. The machine alternates between reading a total digit and
// accumulating sum digits for the current section:
//   total  - the pending section's total digit, or null between sections
//   sum    - the running sum of digits read since the last total
//   count  - digits summed so far this section, clamped at 2 (only whether
//            it is < 2 matters, to enforce "more than one digit")
// A running sum equal to its total closes the section (rejecting a close on
// only 1 summed digit); exceeding it rejects the branch. The line must end
// exactly on a closed section (total === null).
const lineNFA = NFA.encodeSpec({
  startState: { total: null, sum: 0, count: 0 },
  transition: ({ total, sum, count }, value) => {
    if (total === null) return { total: value, sum: 0, count: 0 };
    const newSum = sum + value;
    const newCount = Math.min(count + 1, 2);
    if (newSum > total) return undefined;
    if (newSum === total) {
      if (newCount < 2) return undefined;
      return { total: null, sum: 0, count: 0 };
    }
    return { total, sum: newSum, count: newCount };
  },
  accept: ({ total }) => total === null,
}, 9);

// Line cell paths, transcribed from the drawn grey lines.
const lines = [
  ['R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9',
    'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2'],
  ['R2C1', 'R3C1', 'R3C2', 'R3C3', 'R2C3', 'R2C4', 'R2C5', 'R3C5', 'R3C6'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7', 'R6C6', 'R6C5', 'R6C4', 'R5C4', 'R4C4',
    'R4C5', 'R4C6', 'R5C6', 'R5C5'],
  ['R6C1', 'R6C2', 'R6C3', 'R7C3', 'R8C3', 'R8C2'],
  ['R8C4', 'R9C4', 'R9C5', 'R9C6', 'R8C6', 'R8C5', 'R7C5', 'R7C6', 'R7C7',
    'R7C8', 'R8C8', 'R8C7'],
];

return [
  new Shape('9x9'),
  ...lines.map((line, i) => new Or([
    new NFA(lineNFA, `line${i}-fwd`, line),
    new NFA(lineNFA, `line${i}-rev`, [...line].reverse()),
  ])),
];
