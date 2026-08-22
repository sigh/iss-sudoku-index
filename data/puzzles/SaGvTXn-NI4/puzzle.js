// Title: Chaos Construction
// Author: Zhen Xiao (Hong Weihua)
// Video: https://www.youtube.com/watch?v=SaGvTXn-NI4
// Source: https://app.crackingthecryptic.com/sudoku/6JBh99JDJJ
//
// Rules encoded: rows, columns and the nine unknown regions each hold 1-9
// once (ChaosConstruction discovers the size-9 connected regions; NoBoxes
// removes the default box groups). Each marked/unmarked 2x2 area's region
// membership is stated against the "CC" chaos-region-label overlay. Each
// outside sum is the sum of the first M cells from that side, M being the
// count of region-border crossings anywhere in that row/column (see the
// outsideSum() comment for how M is derived and used).

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');

// 2x2-area markers, named by their top-left cell (drawn overlay positions).
const CIRCLE_TL = ['R1C3', 'R1C5', 'R1C6', 'R3C8', 'R4C8', 'R5C3', 'R8C5', 'R8C6', 'R2C1'];
const SQUARE_TL = ['R3C5', 'R3C6', 'R4C4', 'R4C6', 'R4C7', 'R7C3', 'R7C4', 'R8C7'];

// Circle: the 4 cells' region labels are all equal. SameValues splits its
// cells into `numSets` equal-size groups and requires each group hold the
// same values; 4 singleton groups collapses that to plain equality.
const circleConstraints = CIRCLE_TL.map(tl =>
  new SameValues(4, ...cc.at(graph.block(tl, 2, 2))));

// Black square: exactly 3 distinct region labels among the 4 cells.
// CountDistinct ties a control cell to the distinct count, so pin one
// shared control cell to 3 and reuse it for every black square.
const three = new Var('T', 'three', 1);
const squareConstraints = SQUARE_TL.map(tl =>
  new CountDistinct(three.cell(1), ...cc.at(graph.block(tl, 2, 2))));

// Every other 2x2 area (all top-lefts R1C1..R8C8 minus the marked ones)
// spans two or four regions. One control cell per such area, restricted to
// {2, 4}, tied to its area's distinct-label count.
const markedTL = new Set([...CIRCLE_TL, ...SQUARE_TL]);
const unmarkedTL = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    const tl = makeCellId(r, c);
    if (!markedTL.has(tl)) unmarkedTL.push(tl);
  }
}
const twoOrFour = new Var('U', 'unmarked', unmarkedTL.length);
const unmarkedConstraints = unmarkedTL.flatMap((tl, i) => {
  const control = twoOrFour.cell(i + 1);
  return [
    new Given(control, 2, 4),
    new CountDistinct(control, ...cc.at(graph.block(tl, 2, 2))),
  ];
});

// Region-border count per row/column: an NFA over
// [borderCountCell, cc_1, ..., cc_9] (the lane's 9 CC labels, either grid
// direction -- border count does not depend on which end you start from).
// borderCountCell's value is (border count + 1), keeping it inside the
// normal 1-9 domain since 0 borders is a value the count could otherwise
// need to represent.
const borderSpec = {
  startState: { target: null, prev: null, count: 0 },
  transition({ target, prev, count }, value) {
    if (target === null) return { target: value, prev: null, count: 0 };
    if (prev === null) return { target, prev: value, count };
    // Clamp at target: once count can only fail, collapse to one sink value.
    const next = count + (value !== prev ? 1 : 0);
    return { target, prev: value, count: Math.min(next, target) };
  },
  accept: ({ target, count }) => target !== null && count === target - 1,
  maxDepth: 10,
};
const borderNFA = NFA.encodeSpec(borderSpec, 9);

const rowBorders = new Var('R', 'rowBorders', 9);
const colBorders = new Var('L', 'colBorders', 9);

const rowBorderConstraints = Array.from({ length: 9 }, (_, i) =>
  new NFA(borderNFA, 'RowBorders', rowBorders.cell(i + 1), ...cc.row(i + 1)));
const colBorderConstraints = Array.from({ length: 9 }, (_, i) =>
  new NFA(borderNFA, 'ColBorders', colBorders.cell(i + 1), ...cc.column(i + 1)));

// Outside sum: an Or over every possible border count M (1-8; M = 0 would
// force the clue to equal a sum of zero cells, and no clue prints 0, so it
// is safely omitted rather than needing its own always-false branch). Each
// branch pins the border-count control cell to that M and sums exactly the
// first M cells of the lane, ordered from the clue's side.
function outsideSum(borderCell, orderedCells, clueValue) {
  const branches = [];
  for (let m = 1; m <= 8; m++) {
    branches.push(new And([
      new Given(borderCell, m + 1),
      new Sum(clueValue, ...orderedCells.slice(0, m)),
    ]));
  }
  return new Or(branches);
}

// Outside clue values, read from the drawn overlays; lane i is column/row i+1.
const TOP = [17, 23, 24, 20, 27, 29, 15, 20, 6];
const BOTTOM = [12, 24, 27, 20, 17, 20, 14, 32, 7];
const LEFT = [8, 21, 7, 31, 11, 24, 17, 19, 9];
const RIGHT = [9, 6, 20, 20, 24, 19, 19, 14, 9];

const outsideConstraints = [
  ...TOP.map((v, i) => outsideSum(colBorders.cell(i + 1), graph.column(i + 1), v)),
  ...BOTTOM.map((v, i) => outsideSum(colBorders.cell(i + 1), [...graph.column(i + 1)].reverse(), v)),
  ...LEFT.map((v, i) => outsideSum(rowBorders.cell(i + 1), graph.row(i + 1), v)),
  ...RIGHT.map((v, i) => outsideSum(rowBorders.cell(i + 1), [...graph.row(i + 1)].reverse(), v)),
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...circleConstraints,
  three,
  new Given(three.cell(1), 3),
  ...squareConstraints,
  twoOrFour,
  ...unmarkedConstraints,
  rowBorders,
  colBorders,
  ...rowBorderConstraints,
  ...colBorderConstraints,
  ...outsideConstraints,
];
