// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=9J7Qbxbjj50
// Source: https://cracking-the-cryptic.web.app/sudoku/qqTPL9MmtL
//
// Normal sudoku rules apply (rows, columns, boxes all-different -- the
// default for a Shape('9x9')).
//
// Killer cages: digits in a cage sum to its printed total and cannot
// repeat within the cage.
//
// One digit X (1-9, never given -- it is determined by the solver) is
// worth double its face value wherever it occurs inside a killer cage; X
// is the same digit for every cage in the grid. Modelled as a single
// off-grid Var 'VX' holding X, read once per cage by an NFA whose cell
// list is [VX, ...cageCells]: the first symbol fixes what to double for
// that check, then each cage cell adds its value, doubled exactly when it
// equals X. Because a cage's own digits are already forced distinct
// (AllDifferent below), at most one cell per cage can equal X, so no
// separate "at most one occurrence" bookkeeping is needed. Sum is clamped
// one past each cage's own target to keep the compiled NFA small.

const cages = [
  [22, ['R1C3', 'R2C3', 'R2C4']],
  [20, ['R1C6', 'R1C7', 'R2C7']],
  [23, ['R1C8', 'R2C8', 'R2C9']],
  [22, ['R3C8', 'R3C9', 'R4C9']],
  [16, ['R3C6', 'R3C7', 'R4C7']],
  [20, ['R4C1', 'R4C2', 'R5C2']],
  [16, ['R5C1', 'R6C1', 'R7C1']],
  [24, ['R6C2', 'R7C2', 'R8C2']],
  [12, ['R6C3', 'R7C3']],
  [13, ['R4C3', 'R5C3']],
  [15, ['R7C4', 'R8C3', 'R8C4']],
  [13, ['R9C3', 'R9C4']],
  [16, ['R7C5', 'R7C6', 'R8C5']],
  [15, ['R8C6', 'R9C5', 'R9C6']],
  [24, ['R6C8', 'R7C8', 'R7C9']],
  [5, ['R5C8', 'R5C9']],
  [9, ['R4C5', 'R5C5']],
];

const varX = new Var('X', 'X (doubler digit)', 1);
const VX = varX.cell(1);

function cageDoubleTotalNFA(total) {
  return NFA.encodeSpec({
    startState: { x: null, sum: 0 },
    transition: ({ x, sum }, value) => {
      if (x === null) return { x: value, sum: 0 };
      const contribution = (value === x) ? value * 2 : value;
      return { x, sum: Math.min(sum + contribution, total + 1) };
    },
    accept: ({ x, sum }) => x !== null && sum === total,
  }, 9);
}

return [
  new Shape('9x9'),
  varX,
  ...cages.flatMap(([total, cells]) => [
    new AllDifferent(...cells),
    new NFA(cageDoubleTotalNFA(total), `cage${total}`, VX, ...cells),
  ]),
];
