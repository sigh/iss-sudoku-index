// Title: Advent Calendar (full puzzle)
// Author: AnalyticalNinja
// Video: https://www.youtube.com/watch?v=LIiST_VvbCk
// Source: https://sudokupad.app/PPtTtQg476

// Clue rules, which apply to every stage below: digits on an arrow sum to its
// circle; digits in a cage do not repeat and sum to the cage's printed number,
// or have the printed even/odd total where no number is printed.
//
// The puzzle is solved in three stages, each a grid of its own:
//   Stage 1  every 3x3 box is a "mean mini": it uses exactly three digits from
//            1-9, repeating in neither the rows nor the columns of that box.
//   Stage 2  every 6x6 quadrant is a "quattroquadri": its four 3x3 boxes hold
//            1-9 once each and no digit repeats in the quadrant's 6-cell rows
//            or columns. It keeps stage 1's sixteen box centres.
//   Stage 3  the answer grid. It keeps stage 1's sixteen box centres and the
//            four central cells of each stage 2 quadrant. Each band of three
//            rows, each stack of three columns and each 6x6 quadrant holds
//            three sudoku boxes and one mean-mini box. A sudoku box holds 1-9
//            once each, and digits do not repeat among the sudoku boxes of a
//            grid row or column. A mean-mini box is again a mean mini, and
//            carries one doubler in each of its rows and columns; doublers need
//            not hold different digits.
//
// The stage grids share the answer grid's cells and clues, so they are carried
// as full-grid overlays. Rows and columns of the answer grid repeat digits, so
// the grid is Raw and every rule is stated here. The value range is widened to
// 0-9 so a doubler addend can hold "no doubler"; the three digit layers are
// pinned back to 1-9.
const SHAPE = new Shape('12x12', '0-9', 'Raw');
const graph = cellGraph(SHAPE);
const at = (r, c) => makeCellId(r, c);
const cells = (points) => points.map(([r, c]) => at(r, c));

const stage1 = graph.makeOverlay('VS');
const stage2 = graph.makeOverlay('VT');
const doublers = graph.makeOverlay('VA');
// VP<i> holds the box column of the mean-mini box in box row i; the layout
// rule below makes it a permutation.
const layoutVar = new Var('P', 'MeanMiniBoxColumn', 4);
// Shared control cell for the CountDistinct constraints of every mean mini.
const threeVar = new Var('N', 'Three', 1);
const THREE = threeVar.cell(1);

// Cage totals and cells, transcribed from the drawn cages; 'even'/'odd' are the
// four cages that print a parity word instead of a number.
const CAGES = [
  [16, [[2,1],[2,2],[2,3]]], [9, [[3,4],[3,5]]],
  [13, [[1,5],[1,6]]], [11, [[4,6],[5,6]]],
  [7, [[5,4],[5,5]]], [11, [[4,1],[5,1],[6,1]]],
  [10, [[6,2],[6,3]]], [13, [[1,10],[1,11],[2,10]]],
  [5, [[3,10],[3,11]]], [12, [[1,8],[2,8]]],
  [12, [[4,8],[4,9]]], [12, [[4,10],[5,10]]],
  [6, [[4,11],[5,11]]], [13, [[5,12],[6,11],[6,12]]],
  [13, [[11,2],[11,3],[12,2]]], [11, [[11,1],[12,1]]],
  [14, [[8,3],[9,2],[9,3]]], [10, [[7,1],[7,2]]],
  [14, [[11,4],[11,5],[11,6]]], [12, [[12,5],[12,6]]],
  ['even', [[8,6],[9,6]]], [15, [[9,7],[9,8]]],
  ['even', [[8,7]]], ['odd', [[7,8],[7,9]]],
  [18, [[7,11],[8,10],[8,11]]], [13, [[9,11],[9,12]]],
  [3, [[12,12]]], [14, [[11,11],[11,12]]],
  [11, [[10,10],[10,11]]], [14, [[11,7],[11,8],[12,8]]],
  [10, [[11,9],[12,9]]], ['even', [[2,12],[3,12]]],
];
// Circle cell then arm cells, transcribed from the drawn arrows in stroke
// order, including the cells a straight run passes through. The eighteenth
// drawn stroke repeats the last segment of the R6C7 arrow and carries no
// circle, so it is that arrow's arrowhead rather than a clue of its own.
const ARROWS = [
  [[1,2], [[2,3],[3,2]]], [[2,4], [[2,5],[3,5]]],
  [[6,4], [[5,4],[5,5],[6,5]]], [[4,2], [[5,2],[6,2],[6,1]]],
  [[3,12], [[3,11],[3,10],[2,10]]], [[1,7], [[2,8],[1,9]]],
  [[3,9], [[2,9],[2,8]]], [[5,7], [[5,8],[6,9]]],
  [[6,7], [[6,8],[5,7]]], [[11,1], [[10,2],[11,3],[11,2]]],
  [[7,9], [[8,8],[9,7]]], [[9,3], [[9,2],[8,3],[7,2]]],
  [[7,5], [[8,4],[9,5],[8,5]]], [[7,6], [[8,5],[9,6]]],
  [[11,5], [[10,5],[10,6]]], [[9,12], [[8,12],[7,12]]],
  [[11,9], [[10,9],[11,8],[11,7]]],
];

// The state is the parity of the values read so far, so the machine accepts a
// cell list whose total has the wanted parity. On the answer grid the list is
// the cage's digits followed by their doubler addends, and an addend is either
// 0 or a repeat of its digit, so that total has the effective total's parity.
const parityNFA = (target) => NFA.encodeSpec({
  startState: 0,
  transition: (state, value) => (state + value) & 1,
  accept: (state) => state === target,
}, SHAPE);
const PARITY = { even: parityNFA(0), odd: parityNFA(1) };

// The clues of one digit layer. `addOf` gives a cell's doubler addend, or is
// null for a layer that has no doublers.
const layerClues = (mapCell, addOf) => {
  const terms = (cs) => addOf ? [...cs, ...cs.map(addOf)] : cs;
  return [
    ...CAGES.flatMap(([total, points]) => {
      const cs = cells(points).map(mapCell);
      if (PARITY[total]) {
        return [new AllDifferent(...cs),
        new NFA(PARITY[total], `${total} ${cs[0]}`, ...terms(cs))];
      }
      return addOf
        ? [new AllDifferent(...cs), new Sum(total, ...terms(cs))]
        : [new Cage(total, ...cs)];
    }),
    ...ARROWS.map(([bulb, arm]) => {
      const circle = [at(...bulb)].map(mapCell);
      const shaft = cells(arm).map(mapCell);
      return addOf
        ? new EqualSum(terms(circle), terms(shaft))
        : new Arrow(...circle, ...shaft);
    }),
  ];
};

const box = (boxRow, boxCol) =>
  graph.block(at(3 * boxRow - 2, 3 * boxCol - 2), 3, 3);
const BOXES = [];
for (let i = 1; i <= 4; i++) for (let j = 1; j <= 4; j++) BOXES.push([i, j]);

// A mean mini: three digits over a 3x3 box, each of its rows and columns
// all-different.
const meanMini = (c) => [
  new AllDifferent(c[0], c[1], c[2]),
  new AllDifferent(c[3], c[4], c[5]),
  new AllDifferent(c[6], c[7], c[8]),
  new AllDifferent(c[0], c[3], c[6]),
  new AllDifferent(c[1], c[4], c[7]),
  new AllDifferent(c[2], c[5], c[8]),
  new CountDistinct(THREE, ...c),
];
const centreCells = BOXES.map(([i, j]) => at(3 * i - 1, 3 * j - 1));
const quadrantCentreCells = [];
for (let qr = 1; qr <= 2; qr++) for (let qc = 1; qc <= 2; qc++) {
  for (const [dr, dc] of [[0, 0], [0, 1], [1, 0], [1, 1]]) {
    quadrantCentreCells.push(at(6 * qr - 3 + dr, 6 * qc - 3 + dc));
  }
}

const stage1Rules = BOXES.flatMap(([i, j]) => meanMini(stage1.at(box(i, j))));

const stage2Rules = [
  ...BOXES.map(([i, j]) => new AllDifferent(...stage2.at(box(i, j)))),
  ...[1, 2].flatMap(qr => [1, 2].flatMap(qc => {
    const top = 6 * qr - 5, left = 6 * qc - 5;
    return [0, 1, 2, 3, 4, 5].flatMap(k => [
      new AllDifferent(...stage2.at(graph.block(at(top + k, left), 1, 6))),
      new AllDifferent(...stage2.at(graph.block(at(top, left + k), 6, 1))),
    ]);
  })),
  // Stage 2 keeps stage 1's box centres.
  ...centreCells.map(cell => new SameValues(2, stage1.at(cell), stage2.at(cell))),
];

// The answer grid keeps stage 1's box centres and stage 2's quadrant centres.
const stage3Givens = [
  ...centreCells.map(cell => new SameValues(2, stage1.at(cell), cell)),
  ...quadrantCentreCells.map(cell => new SameValues(2, stage2.at(cell), cell)),
];

// One mean-mini box per box row, per box column (an all-different permutation
// over VP) and per 6x6 quadrant. The quadrant clause reduces to splitting box
// rows 1 and 2 across the left and right pairs of box columns: the permutation
// then splits box rows 3 and 4 the other way by itself.
const layoutRules = [
  new AllDifferent(...layoutVar.cells()),
  ...layoutVar.cells().map(v => new Given(v, 1, 2, 3, 4)),
  new Or([
    new And([new Given(layoutVar.cell(1), 1, 2),
    new Given(layoutVar.cell(2), 3, 4)]),
    new And([new Given(layoutVar.cell(1), 3, 4),
    new Given(layoutVar.cell(2), 1, 2)]),
  ]),
];

// The six ways to place one doubler in each row and column of a 3x3 box. A
// doubler's addend is barred from 0, which the addend pairing below then forces
// to equal its digit; every other addend is 0.
const DOUBLER_PLACEMENTS = [[0, 1, 2], [0, 2, 1], [1, 0, 2],
[1, 2, 0], [2, 0, 1], [2, 1, 0]];
const doublerChoice = (c) => new Or(DOUBLER_PLACEMENTS.map(placement =>
  new And(c.map((cell, k) => new Given(
    doublers.at(cell),
    ...(placement[(k / 3) | 0] === k % 3 ? [1, 2, 3, 4, 5, 6, 7, 8, 9] : [0]))))));

const boxTypeRules = BOXES.map(([i, j]) => {
  const c = box(i, j);
  return new Or([
    new And([new Given(layoutVar.cell(i), j),
      ...meanMini(c), doublerChoice(c)]),
    new And([new Given(layoutVar.cell(i), ...[1, 2, 3, 4].filter(x => x !== j)),
      new AllDifferent(...c),
      ...c.map(cell => new Given(doublers.at(cell), 0))]),
  ]);
});

// No digit repeats among the three sudoku boxes of a grid row or column: the
// nine cells outside whichever box the layout makes a mean mini.
const sudokuLineRules = [
  ...[...Array(12).keys()].map(k => {
    const r = k + 1, i = Math.ceil(r / 3);
    return new Or([1, 2, 3, 4].map(j => new And([
      new Given(layoutVar.cell(i), j),
      new AllDifferent(...graph.row(r).filter(
        cell => Math.ceil(parseCellId(cell).col / 3) !== j)),
    ])));
  }),
  ...[...Array(12).keys()].map(k => {
    const col = k + 1, j = Math.ceil(col / 3);
    return new Or([1, 2, 3, 4].map(i => new And([
      new Given(layoutVar.cell(i), j),
      new AllDifferent(...graph.column(col).filter(
        cell => Math.ceil(parseCellId(cell).row / 3) !== i)),
    ])));
  }),
];

// A doubler counts its digit twice in a total, so each cell carries an addend
// that is 0 when the cell is not a doubler and a repeat of its digit when it is.
const addendPairing = graph.cells().map(cell => new Pair(
  Pair.fnToKey((digit, addend) => addend === 0 || addend === digit, SHAPE),
  'doubler addend', cell, doublers.at(cell)));

const digitRange = (g) => g.makeReplicate(
  new Given(g.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

return [
  SHAPE,
  stage1.toVar('Stage 1 grid'),
  stage2.toVar('Stage 2 grid'),
  doublers.toVar('Doubler addends'),
  layoutVar,
  threeVar,
  new Given(THREE, 3),
  digitRange(graph),
  digitRange(stage1),
  digitRange(stage2),
  ...stage1Rules,
  ...layerClues(cell => stage1.at(cell), null),
  ...stage2Rules,
  ...layerClues(cell => stage2.at(cell), null),
  ...stage3Givens,
  ...layoutRules,
  ...boxTypeRules,
  ...sudokuLineRules,
  ...addendPairing,
  ...layerClues(cell => cell, cell => doublers.at(cell)),
];
