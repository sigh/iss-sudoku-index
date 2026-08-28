// Title: April 30, 2022: Sequence
// Author: clover!
// Video: https://www.youtube.com/watch?v=liEAjQvQYe8
// Source: https://tinyurl.com/2p9x34n9

// Normal sudoku rules apply. The digits along each drawn line form an evenly
// spaced (constant-difference) increasing sequence, increasing in the
// direction the line's arrowhead points.
//
// Direction: every drawn arrowhead sits at, and points further beyond, the
// last cell of its line (checked for all 10 lines against the line's own
// direction of travel). So "increasing in the direction the arrow points"
// means increasing from the first cell listed to the last, which is the
// order used below.

const sequenceLines = [
  // Vertical lines running down from row 2 to row 5 (arrow at the row-5 end).
  ['R2C4', 'R3C4', 'R4C4', 'R5C4'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R2C7', 'R3C7', 'R4C7', 'R5C7'],
  // Vertical lines running up from row 8 to row 5 (arrow at the row-5 end).
  ['R8C9', 'R7C9', 'R6C9', 'R5C9'],
  ['R8C6', 'R7C6', 'R6C6', 'R5C6'],
  ['R8C3', 'R7C3', 'R6C3', 'R5C3'],
  // Diagonal 3-cell lines linking box corners; arrow at the last cell.
  ['R9C3', 'R8C2', 'R7C1'],
  ['R1C7', 'R2C8', 'R3C9'],
  ['R1C6', 'R2C6', 'R3C5'],
  ['R9C4', 'R8C4', 'R7C5'],
];

// One cell at a time, carries the previous digit and (once two cells have
// been read) the fixed common difference. The opening comparison lives in
// the `diff === null` branch (no earlier state to test against), every
// later comparison must hit the same difference exactly, and any drop or
// unequal gap rejects in transition.
const sequenceSpec = {
  startState: { prev: null, diff: null },
  transition: ({ prev, diff }, value) => {
    if (prev === null) return { prev: value, diff: null };
    if (diff === null) {
      const d = value - prev;
      return d > 0 ? { prev: value, diff: d } : undefined;
    }
    return value === prev + diff ? { prev: value, diff } : undefined;
  },
  accept: () => true,
};
const sequenceNFA = NFA.encodeSpec(sequenceSpec, 9);

return [
  new Given('R2C6', 7), new Given('R2C8', 5),
  new Given('R3C1', 2), new Given('R3C4', 3), new Given('R3C7', 4),
  new Given('R5C2', 1), new Given('R5C5', 2), new Given('R5C8', 3),
  new Given('R7C3', 3), new Given('R7C6', 4), new Given('R7C9', 5),
  new Given('R8C2', 4), new Given('R8C4', 7),

  ...sequenceLines.map(cells => new NFA(sequenceNFA, 'sequence', ...cells)),
];
