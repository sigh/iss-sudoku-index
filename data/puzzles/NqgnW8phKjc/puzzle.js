// Title: Angels
// Author: GoodCity
// Video: https://www.youtube.com/watch?v=NqgnW8phKjc
// Source: https://app.crackingthecryptic.com/6ghQ3JGNmn

// Rules encoded here, none omitted:
//   Normal sudoku.
//   Adjacent values along a green line differ by at least 5.
//   Values joined by a white dot are consecutive; by a black dot, in a 1:2 ratio.
//   Nine doubler cells count as double their value for clues, one in each row,
//   column and box, their digits a complete set of 1-9, never on a cell with a dot.
//
// A doubler is a per-cell multiplier the grid digits do not carry, so it lives in
// a parallel VD overlay holding 1 (plain) or 2 (doubler); a cell's effective value
// is digit * flag. The dots and the green lines are the only clues, and the dots
// are barred from doublers, so "double their value for clues" bites on the green
// lines.

const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);
// Effective-value constraints read digit, flag, digit, flag, ... in cell order.
const interleave = cells => cells.flatMap(cell => [cell, flag(cell)]);

// One array per drawn green stroke.
const greenLines = [
  ['R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R9C9', 'R8C8', 'R7C7', 'R6C6'],
  ['R6C6', 'R5C7', 'R4C8', 'R3C9'],
  ['R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R7C9', 'R8C8'],
  ['R9C1', 'R8C2', 'R7C3', 'R6C4'],
  ['R6C4', 'R5C3', 'R4C2', 'R3C1'],
  ['R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R7C1', 'R8C2'],
  ['R3C4', 'R2C3', 'R1C2'],
  ['R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R1C8', 'R2C7', 'R3C6'],
];

// Each drawn dot, listed by the two cells its edge separates.
const whiteDots = [['R7C8', 'R7C9'], ['R8C1', 'R9C1'], ['R3C6', 'R3C7'], ['R1C9', 'R2C9']];
const blackDots = [['R8C9', 'R9C9'], ['R7C1', 'R7C2'], ['R1C1', 'R2C1'], ['R3C3', 'R3C4']];
const dottedCells = [...whiteDots, ...blackDots].flat();

// Green line. `pending` holds a digit whose flag has not been read yet; `prev` is
// the previous cell's effective value, or null before the line's first cell.
const whisperSpec = NFA.encodeSpec({
  startState: { pending: null, prev: null },
  transition(state, value) {
    if (state.pending === null) return { pending: value, prev: state.prev };
    const effective = state.pending * value;
    if (state.prev !== null && Math.abs(effective - state.prev) < 5) return undefined;
    return { pending: null, prev: effective };
  },
  accept: state => state.pending === null,
}, 9);

// Scanning every cell of the grid, exactly one cell holding `target` is flagged 2.
// `digit` holds the digit whose flag is still to come; a second hit is rejected in
// `transition`, so `count` never exceeds 1.
const oneDoublerOf = target => NFA.encodeSpec({
  startState: { digit: null, count: 0 },
  transition(state, value) {
    if (state.digit === null) return { digit: value, count: state.count };
    const count = state.count + (state.digit === target && value === 2 ? 1 : 0);
    return count <= 1 ? { digit: null, count } : undefined;
  },
  accept: state => state.digit === null && state.count === 1,
}, 9);

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  // Every cell is plain (1) or a doubler (2).
  flags.makeReplicate(new Given(flags.cells()[0], 1, 2)),

  // One doubler per row, column and box: nine flags, eight 1s and one 2, sum 10.
  ...flags.rowsColumnsBoxes().map(cells => new Sum(10, ...cells)),
  // The doubled digits are a complete set of 1-9.
  ...Array.from({ length: 9 }, (_, index) =>
    new NFA(oneDoublerOf(index + 1), `doubled digit ${index + 1}`, ...interleave(graph.cells()))),
  // No doubler on a cell with a dot.
  ...dottedCells.map(cell => new Given(flag(cell), 1)),

  ...greenLines.map(cells => new NFA(whisperSpec, 'green line', ...interleave(cells))),
  // A dotted cell is pinned to flag 1 above, so its effective value is its digit
  // and the plain dot classes state the dot rules exactly.
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
