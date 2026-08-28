// Title: August 4, 2021:Creasing Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=jWpJqOra_Jk
// Source: https://tinyurl.com/43m73m9x

// Normal sudoku rules apply (rows, columns, boxes -- the default Shape
// groups). Along each drawn line, the sequence of digits read along the
// line is either strictly increasing throughout or strictly decreasing
// throughout; the rules text says the direction is not fixed and must be
// determined by the solver, independently per line.

// Monotone NFA: the two start states are the two candidate directions for
// a line's very first step (mirrors the "Or over the two orientations"
// pattern for an unknown-direction monotone line). Once a direction is
// picked at the first comparison, every later step must continue in that
// same direction or the branch dies; a step that ties or reverses is
// rejected via `undefined`.
const monotoneSpec = {
  startState: [{ prev: null, dir: 1 }, { prev: null, dir: -1 }],
  transition: ({ prev, dir }, value) => {
    if (prev === null) return { prev: value, dir };
    if (dir === 1 ? value <= prev : value >= prev) return undefined;
    return { prev: value, dir };
  },
  accept: () => true,
};
const monotoneNFA = NFA.encodeSpec(monotoneSpec, 9);

// Five plain crease lines, transcribed from the puzzle's drawn line
// geometry. None are closed loops and none share a cell, so each is
// scanned as its own open NFA run in drawn order.
const line1 = ['R6C2', 'R6C3', 'R6C4', 'R5C5', 'R4C6', 'R4C7', 'R4C8'];
const line2 = ['R4C2', 'R4C3', 'R4C4', 'R3C5'];
const line3 = ['R6C8', 'R6C7', 'R6C6', 'R7C5'];
const line4 = ['R2C6', 'R1C7', 'R1C8', 'R1C9'];
const line5 = ['R8C4', 'R9C3', 'R9C2', 'R9C1'];

const creaseLines = [line1, line2, line3, line4, line5].map(
  (cells, i) => new NFA(monotoneNFA, `crease ${i + 1}`, ...cells)
);

return [
  new Shape('9x9'),

  new Given('R1C2', 4), new Given('R1C4', 5), new Given('R1C6', 8),
  new Given('R2C9', 7),
  new Given('R4C1', 1), new Given('R4C9', 9),
  new Given('R6C1', 3), new Given('R6C9', 2),
  new Given('R8C1', 6),
  new Given('R9C4', 6), new Given('R9C6', 9), new Given('R9C8', 8),

  ...creaseLines,
];
