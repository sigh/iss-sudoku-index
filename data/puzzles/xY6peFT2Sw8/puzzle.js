// Title: Simple Arithmetic
// Author: Valdronius
// Video: https://www.youtube.com/watch?v=xY6peFT2Sw8
// Source: https://sudokupad.app/crekl5kk58

// Normal sudoku rules: 9x9, standard rows/columns/3x3-box all-different
// (the payload's regions are the ordinary boxes, so the default Shape
// suffices).
//
// Any cell marked with a +, -, *, or / equals the sum, difference, product,
// or quotient of the two cells orthogonally adjacent to it -- either the
// horizontal pair (left, right) or the vertical pair (up, down). The rules
// text names no order for the two neighbours, so difference and quotient are
// read unsigned: larger neighbour minus/over smaller (the only reading under
// which every cell, a single digit 1-9, can hold the result). A cell on the
// grid's edge has only one of the two pairs to test, so the direction is
// forced there; an interior cell keeps both pairs live and the mark may
// refer to either -- encoded below as a direction disjunction.
//
// "All such cells have been marked" is read as written: every cell for which
// some direction/operation combination holds carries a mark (collapsed to
// one symbol when a cell would otherwise show two), so an unmarked cell
// necessarily satisfies none of the four operations in either available
// direction. That negative half of the rule is encoded per unmarked cell
// below; omitting it would leave the puzzle far under-constrained.
//
// Marks transcribed from the payload's underlay text, cell by cell.
const MARKS = {
  R1C3: '+',
  R2C5: '-', R2C7: '/',
  R3C9: '/',
  R4C2: '-', R4C3: '-', R4C5: '-', R4C6: '-', R4C9: '-',
  R5C1: '-', R5C2: '-', R5C4: '/', R5C6: '-', R5C8: '-',
  R6C3: '+', R6C5: '-', R6C8: '-', R6C9: '-',
  R7C5: '-', R7C6: '-',
  R8C1: '+', R8C2: '*', R8C4: '+', R8C7: '-', R8C8: '-',
  R9C3: '*', R9C5: '+',
};

const OPS = ['+', '-', '*', '/'];

// Whether `op` relates unordered digits a, b to result t (a and b are the
// two neighbours in either order; the rule names no order for any of them).
function opHolds(op, a, b, t) {
  switch (op) {
    case '+': return t === a + b;
    case '-': return t === Math.abs(a - b);
    case '*': return t === a * b;
    // Larger neighbour divided by smaller: exactly one of these can be an
    // integer equal to t, since a !== b (shared row or column).
    case '/': return a === t * b || b === t * a;
  }
}

// NFA reading an ordered [a, b, target] triple; accepts exactly when
// `test(a, b, target)` holds for the values read. Used both for a marked
// cell's shown relation and for an unmarked cell's "none of the four
// operations hold" negative.
function tripleNFA(test) {
  return NFA.encodeSpec({
    startState: { n: 0 },
    transition: (state, value) => {
      if (state.n === 0) return { n: 1, a: value };
      if (state.n === 1) return { n: 2, a: state.a, b: value };
      if (state.n === 2) return { n: 3, ok: test(state.a, state.b, value) };
      return undefined;
    },
    accept: state => state.n === 3 && state.ok,
  }, 9);
}

// The available neighbour-pair directions for `cell`: horizontal needs both
// a left and a right neighbour, vertical needs both an above and a below
// one, so an edge cell keeps only one (a corner keeps neither).
function directionsOf(cell) {
  const { row, col } = parseCellId(cell);
  const dirs = [];
  if (col > 1 && col < 9) dirs.push([makeCellId(row, col - 1), makeCellId(row, col + 1)]);
  if (row > 1 && row < 9) dirs.push([makeCellId(row - 1, col), makeCellId(row + 1, col)]);
  return dirs;
}

const markedConstraints = Object.entries(MARKS).map(([cell, op]) => {
  const branches = directionsOf(cell).map(([n1, n2]) =>
    new NFA(tripleNFA((a, b, t) => opHolds(op, a, b, t)), `${op} ${cell}`, n1, n2, cell));
  return branches.length === 1 ? branches[0] : new Or(branches);
});

const allCells = [];
for (let r = 1; r <= 9; r++) for (let c = 1; c <= 9; c++) allCells.push(makeCellId(r, c));

// One independent NFA per available direction of every unmarked cell -- both
// must hold when a cell has two directions, and returning them as separate
// top-level constraints (rather than wrapping in `And`) already conjoins
// them.
const unmarkedConstraints = allCells
  .filter(cell => !(cell in MARKS))
  .flatMap(cell => directionsOf(cell).map(([n1, n2]) =>
    new NFA(tripleNFA((a, b, t) => !OPS.some(op => opHolds(op, a, b, t))), `none ${cell}`, n1, n2, cell)));

return [
  new Shape('9x9'),
  ...markedConstraints,
  ...unmarkedConstraints,
];
