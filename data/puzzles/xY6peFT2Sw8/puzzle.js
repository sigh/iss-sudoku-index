// Title: Simple Arithmetic
// Author: Valdronius
// Video: https://www.youtube.com/watch?v=xY6peFT2Sw8
// Source: https://sudokupad.app/crekl5kk58

// Normal sudoku rules apply. A cell marked with +, -, *, or / equals the
// sum, absolute difference, product, or quotient (larger/smaller) of its
// two orthogonal neighbour cells - either the horizontal pair (left, right)
// or the vertical pair (up, down). Every cell for which the relation holds
// is marked; when a cell would qualify for two marks, only one is shown, so
// the relation is known to hold for at least one orientation (both may
// hold). Marks near a grid edge only have one orientation available and are
// encoded directly; interior marks are encoded as an Or of the two possible
// orientations.

const OPS = {
  '+': (a, b) => a + b,
  '-': (a, b) => Math.abs(a - b),
  '*': (a, b) => a * b,
  '/': (a, b) => {
    const hi = Math.max(a, b), lo = Math.min(a, b);
    if (lo === 0 || hi % lo !== 0) return null;
    return hi / lo;
  },
};

// Build (once per operator) an NFA over an ordered triple of cells
// [neighbourA, neighbourB, markedCell] that accepts iff
// markedCell == op(neighbourA, neighbourB). The op is symmetric in its two
// arguments for all four operators used here, so neighbour order is
// irrelevant.
const opNFACache = {};
function opNFA(op) {
  if (!opNFACache[op]) {
    const fn = OPS[op];
    opNFACache[op] = NFA.encodeSpec({
      startState: 0,
      transition: (state, value) => {
        if (state === 0) return { step: 1, a: value };
        if (state.step === 1) return { step: 2, a: state.a, b: value };
        if (state.step === 2) {
          const r = fn(state.a, state.b);
          return (r !== null && r === value) ? 'accept' : undefined;
        }
        return undefined;
      },
      accept: (s) => s === 'accept',
    }, 9);
  }
  return opNFACache[op];
}

function arithmeticTriple(op, cellA, cellB, target) {
  return new NFA(opNFA(op), `${op} ${target}`, cellA, cellB, target);
}

// row, col, op - decoded from the puzzle's underlay text marks and mapped
// to R#C# via the SudokuPad geometry decode.
const MARKS = [
  [1, 3, '+'], [8, 1, '+'], [8, 4, '+'], [9, 5, '+'], [6, 3, '+'],
  [5, 4, '/'], [3, 9, '/'], [2, 7, '/'],
  [8, 2, '*'], [9, 3, '*'],
  [5, 1, '-'], [5, 2, '-'], [4, 2, '-'], [4, 3, '-'], [4, 5, '-'],
  [4, 6, '-'], [5, 6, '-'], [6, 5, '-'], [7, 5, '-'], [7, 6, '-'],
  [8, 7, '-'], [8, 8, '-'], [4, 9, '-'], [5, 8, '-'], [6, 8, '-'], [6, 9, '-'],
];

const arithmeticConstraints = MARKS.map(([row, col, op]) => {
  const target = makeCellId(row, col);
  const orientations = [];
  if (col > 1 && col < 9) {
    orientations.push([makeCellId(row, col - 1), makeCellId(row, col + 1)]);
  }
  if (row > 1 && row < 9) {
    orientations.push([makeCellId(row - 1, col), makeCellId(row + 1, col)]);
  }
  const options = orientations.map(
    ([a, b]) => arithmeticTriple(op, a, b, target));
  return options.length === 1 ? options[0] : new Or(options);
});

return [
  new Shape('9x9'),
  ...arithmeticConstraints,
];
