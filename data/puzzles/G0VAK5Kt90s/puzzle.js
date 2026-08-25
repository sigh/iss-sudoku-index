// Title: Sudoku N (2)
// Author: Unknown
// Video: https://www.youtube.com/watch?v=G0VAK5Kt90s
// Source: https://sudokupad.app/sq1o637xpc

// Normal sudoku rules apply. VN holds the puzzle's single unknown value N
// (1-9): a black dot would mark the edge between two orthogonally adjacent
// cells a, b if any of a+b, a*b, |a-b|, a/b, b/a (whichever divides evenly)
// equals N. The source draws zero dots anywhere on the grid, and the rules
// state every such dot is drawn -- an exhaustiveness clause is a rule about
// the cells (here, edges) that carry no mark, not a vacuous one -- so for the
// correct N, every one of the grid's adjacent pairs must avoid it under all
// four operations.

const graph = cellGraph('9x9');
const N = 'VN';

// Reads [a, b, N] and rejects iff some operation on (a, b) equals N.
const noDotSpec = NFA.encodeSpec({
  startState: { k: 0 },
  transition: (s, x) => {
    if (s.k === 0) return { k: 1, a: x };
    if (s.k === 1) {
      const a = s.a, b = x;
      let mask = 0;
      const forbid = (r) => { if (r >= 1 && r <= 9) mask |= 1 << r; };
      forbid(a + b);
      forbid(a * b);
      forbid(Math.abs(a - b));
      if (a % b === 0) forbid(a / b);
      if (b % a === 0) forbid(b / a);
      return { k: 2, mask };
    }
    return (s.mask & (1 << x)) ? undefined : { k: 3 };
  },
  accept: (s) => s.k === 3,
}, 9);

// Every orthogonally adjacent pair in the grid: consecutive cells within each
// row and each column -- 8 per line x 18 lines = 144 edges.
const edges = [];
for (const line of [...graph.rows(), ...graph.columns()]) {
  for (let i = 0; i + 1 < line.length; i++) edges.push([line[i], line[i + 1]]);
}
const noDots = edges.map(([a, b], i) =>
  new NFA(noDotSpec, `no-dot-${i + 1}`, a, b, N));

return [
  new Shape('9x9'),
  new Var('N', 'shared unknown value N', 1),
  new Given('R1C1', 7),
  new Given('R1C5', 2),
  new Given('R1C7', 5),
  new Given('R1C9', 3),
  new Given('R2C2', 1),
  new Given('R2C8', 4),
  new Given('R3C3', 9),
  new Given('R3C7', 6),
  new Given('R3C9', 2),
  new Given('R4C4', 7),
  new Given('R4C6', 5),
  new Given('R5C1', 4),
  new Given('R5C9', 9),
  new Given('R6C4', 2),
  new Given('R6C6', 3),
  new Given('R7C1', 6),
  new Given('R7C3', 4),
  new Given('R7C7', 9),
  new Given('R8C2', 2),
  new Given('R8C8', 8),
  new Given('R9C1', 5),
  new Given('R9C3', 7),
  new Given('R9C5', 8),
  new Given('R9C9', 1),
  ...noDots,
];
