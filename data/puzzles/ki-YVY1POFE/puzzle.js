// Title: Disorienting Hits
// Author: Sven-Ole Behrend
// Video: https://www.youtube.com/watch?v=ki-YVY1POFE
// Source: https://sudokupad.app/31wnj4k03o

// If two digits are separated by a black dot then one is double the other.
const blackDot = ['R9C4', 'R9C5'];

// Beige "hitlines": digits along a hitline do not repeat. One end of a
// hitline (determined by the solver) is the starting point; the digit N at
// the starting point equals the count of cells along the line (counting
// from the starting point, 1-indexed) whose digit equals its position.
//
// The raw source draws two of these lines (the entries touching R3C3) as two
// separate strokes that share a pivot cell; they are merged into a single
// 5-cell hitline here.
const hitlines = [
  ['R8C2', 'R9C3', 'R9C2'],
  ['R1C2', 'R1C1', 'R2C1', 'R2C2'],
  ['R2C3', 'R2C4', 'R3C3', 'R4C2', 'R3C2'],
  ['R2C7', 'R2C6', 'R1C7', 'R2C8', 'R2C9'],
  ['R3C1', 'R4C1', 'R5C2', 'R4C3', 'R4C4', 'R3C5', 'R2C5'],
  ['R5C3', 'R5C4', 'R6C4', 'R5C5', 'R5C6', 'R6C6', 'R7C5', 'R7C4', 'R6C3'],
  ['R4C8', 'R5C8', 'R4C9'],
  ['R8C6', 'R7C7', 'R6C8', 'R5C7'],
];

// State machine reading a hitline in one direction. State tracks the digit
// declared at the starting cell (the target N), the 1-indexed position along
// the line, and how many cells so far have a digit equal to their position.
// Accepts when the final match count equals the declared target.
const hitlineSpec = {
  // No hitline in this puzzle exceeds 9 cells; bound the BFS depth so the
  // (target, pos, matches) state space stays finite.
  maxDepth: 9,
  startState: { target: null, pos: 0, matches: 0 },
  transition: (state, value) => {
    const pos = state.pos + 1;
    const target = state.target === null ? value : state.target;
    const matches = state.matches + (value === pos ? 1 : 0);
    return { target, pos, matches };
  },
  accept: (state) => state.target !== null && state.matches === state.target,
};
const hitlineNFA = NFA.encodeSpec(hitlineSpec, 9);

function hitlineConstraint(cells, index) {
  return new Or([
    new NFA(hitlineNFA, `hit${index}_fwd`, ...cells),
    new NFA(hitlineNFA, `hit${index}_rev`, ...[...cells].reverse()),
  ]);
}

return [
  new Shape('9x9'),

  new BlackDot(...blackDot),

  ...hitlines.map((cells, i) => new AllDifferent(...cells)),
  ...hitlines.map((cells, i) => hitlineConstraint(cells, i)),
];
