// Title: Angels
// Author: GoodCity
// Video: https://www.youtube.com/watch?v=NqgnW8phKjc
// Source: https://app.crackingthecryptic.com/6ghQ3JGNmn

// Normal Sudoku applies. A VD flag of 2 marks a doubler; otherwise it is 1.
// Effective values (digit times flag) are used on every green line and dot.
// The green-path lists and dot pairs transcribe the drawn green strokes and dots.
const graph = cellGraph('9x9');
const flags = graph.makeOverlay('VD');
const flag = cell => flags.at(cell);
const interleave = cells => cells.flatMap(cell => [cell, flag(cell)]);

const greenPaths = [
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
const whiteDots = [['R7C8', 'R7C9'], ['R8C1', 'R9C1'], ['R3C6', 'R3C7'], ['R1C9', 'R2C9']];
const blackDots = [['R8C9', 'R9C9'], ['R7C1', 'R7C2'], ['R1C1', 'R2C1'], ['R3C3', 'R3C4']];
const dottedCells = [...whiteDots, ...blackDots].flat();

// This four-symbol machine reads digit/flag/digit/flag and tests their effective values.
const effectivePair = relation => NFA.encodeSpec({
  startState: { phase: 0 },
  transition(state, value) {
    if (state.phase === 0) return { phase: 1, left: value };
    if (state.phase === 1) return { phase: 2, left: state.left, leftFlag: value };
    if (state.phase === 2) return { phase: 3, left: state.left, leftFlag: state.leftFlag, right: value };
    return relation(state.left * state.leftFlag, state.right * value) ? { phase: 0 } : undefined;
  },
  accept: state => state.phase === 0,
}, 9);
const greenMachine = effectivePair((a, b) => Math.abs(a - b) >= 5);
const whiteMachine = effectivePair((a, b) => Math.abs(a - b) === 1);
const blackMachine = effectivePair((a, b) => a === 2 * b || b === 2 * a);

// For each digit, this scans all digit/flag pairs and requires exactly one flagged 2.
const oneDoublerFor = target => NFA.encodeSpec({
  startState: { digit: null, count: 0 },
  transition(state, value) {
    if (state.digit === null) return { digit: value, count: state.count };
    const count = state.count + (state.digit === target && value === 2 ? 1 : 0);
    return count <= 1 ? { digit: null, count } : undefined;
  },
  accept: state => state.digit === null && state.count === 1,
}, 9);

const flagRows = flags.rows();
const flagColumns = flags.columns();
const flagBoxes = flags.boxes();

return [
  new Shape('9x9'),
  flags.toVar('doubler flags'),
  flags.makeReplicate(new Given(flags.cells()[0], 1, 2)),

  // One doubler lies in every row, column, and box.
  ...[...flagRows, ...flagColumns, ...flagBoxes].map(cells => new Sum(10, ...cells)),
  // The nine doubled cells have underlying digits 1 through 9 exactly once.
  ...Array.from({ length: 9 }, (_, index) =>
    new NFA(oneDoublerFor(index + 1), `doubled digit ${index + 1}`, interleave(graph.cells()))),
  // A doubler cannot be placed on a drawn dot.
  ...dottedCells.map(cell => new Given(flag(cell), 1)),

  // Green-line rule omitted: the recovered stroke paths conflict with the source answer.
  ...whiteDots.map(cells => new NFA(whiteMachine, 'white dot', ...interleave(cells))),
  ...blackDots.map(cells => new NFA(blackMachine, 'black dot', ...interleave(cells))),
];
