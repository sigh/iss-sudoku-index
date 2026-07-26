// Title: Purple Lines
// Author: Wiggel
// Video: https://www.youtube.com/watch?v=H21168xv0qs
// Source: https://sudokupad.app/56e3pocc01

// Normal sudoku rules apply.
//
// Every line drawn on the grid is purple, and a purple line obeys the blue
// (Modular) and the red (Parity) rule at the same time:
//   - blue: every connected run of 3 cells contains one digit each from the
//     modular sets [147], [258], [369]  -> Modular(3)
//   - red: digits alternate odd/even along the line  -> Modular(2)
// No line is drawn in plain blue or plain red, so both rules apply to all of
// them.
//
// The narrator also states "No purple line could ever be a valid Renban",
// having defined a Renban as a set of consecutive, non-repeating digits in any
// order. Read as a claim about purple lines in general it is false -- the line
// 1-2-3 satisfies both purple rules and is a Renban -- so it is a statement
// about the purple lines of this grid, and it is encoded as one: no purple
// line's digits form a set of consecutive, non-repeating digits.
//
// The fog covering the grid, and the cells that reveal it, are a presentation
// rule about the order of discovery and place no condition on the final grid,
// so they are not encoded.

// Cell paths of the 15 drawn purple lines, in drawn order. Waypoints are
// king-adjacent; straight runs are written out cell by cell.
const purpleLines = [
  ['R8C6', 'R9C6', 'R9C5'],
  ['R7C7', 'R8C7', 'R8C8'],
  ['R5C6', 'R6C6', 'R5C7', 'R6C8', 'R7C8', 'R6C9'],
  ['R5C4', 'R5C5', 'R6C5'],
  ['R5C9', 'R4C9', 'R3C9', 'R2C9'],
  ['R2C8', 'R1C7', 'R1C6'],
  ['R3C8', 'R3C7', 'R4C7'],
  ['R7C2', 'R8C2', 'R9C1'],
  ['R5C1', 'R6C1', 'R7C1'],
  ['R3C1', 'R4C1', 'R4C2'],
  ['R2C1', 'R1C1', 'R1C2'],
  ['R3C2', 'R2C2', 'R2C3', 'R2C4', 'R1C5', 'R2C5'],
  ['R2C6', 'R3C6', 'R3C5', 'R4C5', 'R4C4', 'R4C3'],
  ['R5C2', 'R5C3', 'R6C3'],
  ['R8C4', 'R7C4', 'R7C5', 'R8C5'],
];

// "No purple line could ever be a valid Renban", as a machine over the line's
// digits. The state is the sorted set of digits seen so far; the absorbing
// state BROKEN means the line can no longer be a Renban, which happens exactly
// when a digit repeats or when the spread of the digits seen exceeds len - 1.
// A run that reaches the end without breaking therefore holds len distinct
// digits spanning at most len - 1, i.e. exactly a Renban -- so BROKEN is the
// only accepting state.
const BROKEN = { broken: true };
const notRenban = (cells) => {
  const len = cells.length;
  const spec = NFA.encodeSpec({
    startState: { seen: [] },
    transition: (state, value) => {
      if (state.broken) return BROKEN;
      if (state.seen.includes(value)) return BROKEN;
      const seen = [...state.seen, value].sort((a, b) => a - b);
      if (seen[seen.length - 1] - seen[0] > len - 1) return BROKEN;
      // The state must not itself be an array: a transition returning an array
      // means "branch to each of these states", not "this one set state".
      return { seen };
    },
    accept: (state) => state.broken === true,
  }, 9);
  return new NFA(spec, 'not-renban', cells);
};

return [
  new Shape('9x9'),

  new Given('R4C1', 7),
  new Given('R4C8', 1),
  new Given('R5C6', 7),
  new Given('R6C1', 9),
  new Given('R7C3', 4),
  new Given('R7C4', 1),
  new Given('R7C6', 5),
  new Given('R8C3', 7),
  new Given('R9C6', 2),
  new Given('R9C9', 5),

  ...purpleLines.map((cells) => new Modular(3, ...cells)),
  ...purpleLines.map((cells) => new Modular(2, ...cells)),
  ...purpleLines.map(notRenban),
];
