// Title: Difference Fences
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=GvhkWBhq2q0
// Source: https://app.crackingthecryptic.com/17rhp0owyb

// Rules encoded (all of them; nothing is omitted):
//
//  1. Normal sudoku, no given digits.
//  2. Digits in the circles must appear in the surrounding four cells.
//  3. Each fence segment sits on one cell edge and its value is the
//     difference between the two cells it separates. No two segments on the
//     same fence share a value. A fence's total value is the sum of its
//     segment values, and that total is the number in the circle attached to
//     the fence. Two circles are drawn empty: those totals are deduced, and
//     rule 2 still applies to the digits of the deduced total.
//
// Reading the circle contents as one number: each drawn circle has radius
// 0.31 cell and carries two digit marks 0.085 cell to its left and right, so
// both marks are inside the circle, side by side. Taken as a single number
// (left mark = tens) the six labelled circles read 21, 19, 17, 15, 18, 12.
// Taken as separate one-digit totals they cannot be totals at all: a
// three-segment fence needs three distinct non-zero differences, so its total
// is at least 1+2+3 = 6, and the circles at R2C2 and R7C2 carry only the
// marks 2,1 and 1,2.
//
// Reading the two blank circles: the rules say the total "is given in the
// attached quad" for every fence and then that "some total values will need
// to be deduced". The deduced total is therefore still the circle's contents,
// so rule 2 applies to its digits; that is what makes the deduction one the
// solve needs. The blank circles' fences are encoded as a disjunction over
// every total their segment count can reach, each branch pairing the total
// with the quad its digits imply.

// The eight drawn fences, each as the chain of grid corners its wall runs
// along, plus the circle it ends at. Corner [r, c] is the lattice point at
// the bottom-right of R{r}C{c}; corner [0, 0] is the grid's top-left. The
// circle field is that same corner, i.e. the quad's top-left cell is
// R{r}C{c}. `digits` is the pair of marks drawn in the circle, left then
// right, or null for a circle drawn empty.
const fences = [
  { corner: [2, 2], digits: [2, 1], path: [[1, 2], [1, 1], [2, 1], [2, 2]] },
  { corner: [4, 1], digits: [1, 9], path: [[4, 2], [5, 2], [5, 1], [4, 1]] },
  { corner: [1, 5], digits: [1, 7], path: [[1, 4], [2, 4], [2, 5], [1, 5]] },
  { corner: [2, 8], digits: [1, 5], path: [[1, 8], [1, 7], [2, 7], [2, 8]] },
  { corner: [4, 8], digits: [1, 8], path: [[7, 8], [6, 8], [5, 8], [4, 8]] },
  { corner: [7, 7], digits: null, path: [[5, 6], [5, 7], [6, 7], [7, 7]] },
  { corner: [7, 2], digits: [1, 2], path: [[8, 2], [8, 1], [7, 1], [7, 2]] },
  {
    corner: [5, 5], digits: null,
    path: [[7, 5], [8, 5], [8, 4], [7, 4], [6, 4], [5, 4], [5, 5]],
  },
];

// One unit step of a corner chain is one cell edge. A step along row boundary
// r into column c separates R{r}C{c} from R{r+1}C{c}; a step along column
// boundary c into row r separates R{r}C{c} from R{r}C{c+1}.
function edgeCells([r0, c0], [r1, c1]) {
  if (r0 === r1) {
    const c = Math.max(c0, c1);
    return [makeCellId(r0, c), makeCellId(r0 + 1, c)];
  }
  const r = Math.max(r0, r1);
  return [makeCellId(r, c0), makeCellId(r, c0 + 1)];
}

const fenceEdges = fences.map(
  f => f.path.slice(1).map((p, i) => edgeCells(f.path[i], p)));

// Every fence segment separates two cells that share a row or a column, so
// its value is in 1..8 and fits a Var cell's own 1..9 range directly.
const segmentCount = fenceEdges.reduce((n, e) => n + e.length, 0);
const diffVars = new Var('D', 'fence segment difference', String(segmentCount));

// VD_i == |a - b|: one of a = b + VD_i, b = a + VD_i must hold.
const diffLink = (v, [a, b]) => new Or([
  new EqualSum([a], [b, v]),
  new EqualSum([b], [a, v]),
]);

// The totals a k-segment fence can reach: the sums of the k-subsets of 1..8,
// since its segment values are distinct and lie in 1..8.
function reachableTotals(k) {
  const totals = new Set();
  const walk = (next, remaining, sum) => {
    if (remaining === 0) return void totals.add(sum);
    for (let v = next; v <= 8; v++) walk(v + 1, remaining - 1, sum + v);
  };
  walk(1, k, 0);
  return [...totals].sort((x, y) => x - y);
}

// The digits of a total, as they would be written in its circle. A total of
// 10 or 20 would be written with a 0, which is not a sudoku digit and so
// places no requirement on the four cells; only its other digit is required.
const totalDigits = t =>
  (t < 10 ? [t] : [Math.floor(t / 10), t % 10]).filter(d => d > 0);

let cursor = 0;
const fenceConstraints = fences.flatMap((fence, fi) => {
  const edges = fenceEdges[fi];
  const vars = edges.map(() => diffVars.cell(++cursor));
  const quadCell = makeCellId(...fence.corner);
  const links = [
    ...edges.map((e, i) => diffLink(vars[i], e)),
    new AllDifferent(...vars),
  ];

  if (fence.digits) {
    const total = fence.digits[0] * 10 + fence.digits[1];
    return [
      ...links,
      new Sum(total, ...vars),
      new Quad(quadCell, ...fence.digits),
    ];
  }

  // Blank circle: the total is unknown, so branch over every total this
  // fence can reach and require the quad that total's digits spell out.
  return [
    ...links,
    new Or(reachableTotals(edges.length).map(t => new And([
      new Sum(t, ...vars),
      new Quad(quadCell, ...totalDigits(t)),
    ]))),
  ];
});

return [
  new Shape('9x9'),
  diffVars,
  ...fenceConstraints,
];
