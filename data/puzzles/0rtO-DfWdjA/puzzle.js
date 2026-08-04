// Title: Dimorphism
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=0rtO-DfWdjA
// Source: https://app.crackingthecryptic.com/sudoku/dB4gb8FMNL

// Two independent 6x6 sudoku grids share one canvas, separated by an unused
// gap column. Grid A (left) is this script's main grid. Grid B (right) is
// modelled as a Var overlay paired 1:1 with Grid A's 36 positions, since
// every cross-grid rule reads "the same position in the other grid" --
// Grid B's own row r, column c is Grid A's row r, column c through that
// pairing.
//
// Regions are drawn, not default boxes (a hidden default grid redraws its own
// borders as ordinary lines): Grid A's box dividers give 3-row x 2-col boxes;
// Grid B's box dividers (columns read minus the 7-column gap offset) give
// 2-row x 3-col boxes -- the grids are differently shaped, which is the
// title's "dimorphism". Grid A's default boxes are removed and replaced with
// explicit Jigsaw pieces; Grid B's row/column/region groups are added
// explicitly since Var cells carry no implicit groups.
//
// The rules distinguish a cell's "digit" from its "value": value == digit,
// except at that grid's six sum cells -- one per row, column and region,
// their positions not given by any drawn mark and left for the solver to
// find -- where value = this cell's digit + the same-position digit in the
// other grid. Sum-cell positions and the resulting values are therefore
// solver-discovered auxiliary state. Red lines, blue lines and white dots are
// stated over "value"; ordinary Sudoku and the "no digit repeats among a
// grid's own sum cells" clause use "digit" directly. The shape is widened to
// 0-12 so a flag cell can hold 0 and a summed value can reach 12; Given
// restricts every ordinary digit cell back down to 1-6.
const shape = new Shape('6x6', '0-12');
const graph = cellGraph(shape);
const shapeName = graph.gridGeometry().name;
const idA = (r, c) => makeCellId(r, c);
const ALL = [1, 2, 3, 4, 5, 6];

// Grid A boxes: dividers at columns 3,5 and row 4 (1-indexed) -> 3 rows x 2 cols.
const regionOfA = (r, c) => Math.floor((r - 1) / 3) * 3 + Math.floor((c - 1) / 2);
// Grid B boxes: dividers at column 11 and rows 3,5 (1-indexed, gap-adjusted) -> 2 rows x 3 cols.
const regionOfB = (r, c) => Math.floor((r - 1) / 2) * 2 + Math.floor((c - 1) / 3);

const regionCells = (regionOfFn) => Array.from({ length: 6 }, (_, k) =>
  ALL.flatMap(r => ALL.filter(c => regionOfFn(r, c) === k).map(c => [r, c])));
const regionsA = regionCells(regionOfA);
const regionsB = regionCells(regionOfB);
const rowsIdx = ALL.map(r => ALL.map(c => [r, c]));
const colsIdx = ALL.map(c => ALL.map(r => [r, c]));

// ---- Grid A: main grid, custom boxes ----
const digitAGivens = graph.cells().map(cell => new Given(cell, 1, 2, 3, 4, 5, 6));
const jigsawA = regionsA.map(cells =>
  new Jigsaw(shapeName, ...cells.map(([r, c]) => idA(r, c))));

// ---- Grid B: Var overlay paired 1:1 with Grid A's positions ----
const digitB = graph.makeOverlay('VDB');
const posB = (r, c) => digitB.at(idA(r, c));
const digitBGivens = graph.cells().map(cell => new Given(digitB.at(cell), 1, 2, 3, 4, 5, 6));
const groupsB = [
  ...rowsIdx.map(cells => new AllDifferent(...cells.map(([r, c]) => posB(r, c)))),
  ...colsIdx.map(cells => new AllDifferent(...cells.map(([r, c]) => posB(r, c)))),
  ...regionsB.map(cells => new AllDifferent(...cells.map(([r, c]) => posB(r, c)))),
];

// ---- Sum-cell / value machinery, shared shape for both grids ----
// Reads [flag, digitSelf, digitOther, value]: value must equal
// digitSelf + flag * digitOther (flag in {0,1}, so this is digitSelf when the
// cell isn't a sum cell, and digitSelf+digitOther when it is).
const VALUE_NFA = NFA.encodeSpec({
  startState: null,
  transition: (s, v) => {
    if (s === null) return { flag: v };
    if (s.self === undefined) return { flag: s.flag, self: v };
    if (s.other === undefined) return { flag: s.flag, self: s.self, other: v };
    return { ok: v === s.self + s.flag * s.other };
  },
  accept: (s) => !!(s && s.ok),
}, shape);

// Reads a row's 6 (flag, digitSelf) pairs then a final rowSel cell: rowSel
// must equal the digitSelf of whichever cell in the row has flag=1 (there is
// exactly one, enforced separately). Used to pick out, per row, the digit at
// that row's sum cell, so the six sum-cell digits (one per row) can be
// checked pairwise distinct.
// Flag reads reject anything but 0/1 early, and sum saturates past 12 (the
// highest a rowSel cell can ever hold), so neither field's state can climb
// over the full 0-12 alphabet width.
const ROWSEL_NFA = NFA.encodeSpec({
  startState: { count: 0, sum: 0 },
  transition: (s, v) => {
    if (s.count === 12) return { done: true, ok: v === s.sum };
    if (s.count % 2 === 0) {
      if (v !== 0 && v !== 1) return undefined;
      return { count: s.count + 1, sum: s.sum, pendingFlag: v };
    }
    return { count: s.count + 1, sum: Math.min(s.sum + s.pendingFlag * v, 13) };
  },
  accept: (s) => !!(s.done && s.ok),
}, shape);

// label: 'A' or 'B'. selfFn/otherFn(r,c) address this grid's / the other
// grid's digit cell. unitsSum are this grid's own row/col/region cell lists
// (regions differ in shape between the two grids).
function buildSumLinkage(label, selfFn, otherFn, unitsSum) {
  const flag = graph.makeOverlay('VF' + label);
  const value = graph.makeOverlay('VY' + label);
  const flagAt = (r, c) => flag.at(idA(r, c));
  const valueAt = (r, c) => value.at(idA(r, c));

  const flagGivens = graph.cells().map(cell => new Given(flag.at(cell), 0, 1));
  const transversal = [
    ...unitsSum.rows.map(cells => new Sum(1, ...cells.map(([r, c]) => flagAt(r, c)))),
    ...unitsSum.cols.map(cells => new Sum(1, ...cells.map(([r, c]) => flagAt(r, c)))),
    ...unitsSum.regions.map(cells => new Sum(1, ...cells.map(([r, c]) => flagAt(r, c)))),
  ];
  const valueNFAs = ALL.flatMap(r => ALL.map(c =>
    new NFA(VALUE_NFA, `value ${label} R${r}C${c}`,
      flagAt(r, c), selfFn(r, c), otherFn(r, c), valueAt(r, c))));

  const rowSel = new Var('Q' + label, `sum-cell digit per row (grid ${label})`, 6);
  const rowSelNFAs = ALL.map(r => new NFA(ROWSEL_NFA, `row-select ${label} R${r}`,
    ...ALL.flatMap(c => [flagAt(r, c), selfFn(r, c)]), rowSel.cell(r)));
  const distinctSumDigits = new AllDifferent(...ALL.map(r => rowSel.cell(r)));

  return {
    valueAt,
    constraints: [
      flag.toVar(`sum-cell flags (grid ${label})`), ...flagGivens,
      value.toVar(`values (grid ${label})`),
      ...transversal, ...valueNFAs,
      rowSel, ...rowSelNFAs, distinctSumDigits,
    ],
  };
}

const unitsA = { rows: rowsIdx, cols: colsIdx, regions: regionsA };
const unitsB = { rows: rowsIdx, cols: colsIdx, regions: regionsB };
const linkA = buildSumLinkage('A', (r, c) => idA(r, c), (r, c) => posB(r, c), unitsA);
const linkB = buildSumLinkage('B', (r, c) => posB(r, c), (r, c) => idA(r, c), unitsB);

// ---- Lines: three drawn shapes, each drawn once red in Grid A and once blue
// in Grid B at the same local position (blue columns read minus the
// 7-column gap offset match red exactly). Red: non-repeating consecutive set
// of values (Renban). Blue: equal value-sum per region segment the line
// crosses (EqualSum, segmented by Grid B's own boxes, walked in the line's
// drawn order).
const LINE_SHAPES = [
  [[5, 5], [4, 6], [3, 6], [2, 5], [1, 4], [2, 3], [2, 2], [3, 2], [4, 1], [5, 1], [6, 2], [6, 3]],
  [[3, 4], [3, 3], [4, 2], [5, 2], [6, 1]],
  [[3, 5], [4, 5], [5, 6], [6, 5]],
];

function splitByRegion(cellsLocal, regionOfFn) {
  const segments = [];
  let cur = [];
  let curRegion = null;
  for (const [r, c] of cellsLocal) {
    const reg = regionOfFn(r, c);
    if (reg !== curRegion && cur.length) { segments.push(cur); cur = []; }
    cur.push([r, c]);
    curRegion = reg;
  }
  if (cur.length) segments.push(cur);
  return segments;
}

const redLines = LINE_SHAPES.map(cells =>
  new Renban(...cells.map(([r, c]) => linkA.valueAt(r, c))));
const blueLines = LINE_SHAPES.map(cellsLocal =>
  new EqualSum(...splitByRegion(cellsLocal, regionOfB)
    .map(seg => seg.map(([r, c]) => linkB.valueAt(r, c)))));

// ---- White dots: consecutive values (underlays at edge(R1C1,R2C1) and
// edge(R1C8,R2C8), the latter at Grid B's same local position). A plain Pair
// is used instead of WhiteDot since these bind Var "value" cells, not
// grid-adjacent cells.
const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, shape);
const whiteDots = [
  new Pair(consecutiveKey, 'white dot: values R1C1-R2C1 (grid A)', linkA.valueAt(1, 1), linkA.valueAt(2, 1)),
  new Pair(consecutiveKey, 'white dot: values R1C1-R2C1 (grid B)', linkB.valueAt(1, 1), linkB.valueAt(2, 1)),
];

return [
  shape,
  new NoBoxes(),
  ...digitAGivens,
  ...jigsawA,
  digitB.toVar('Grid B digits'),
  ...digitBGivens,
  ...groupsB,
  ...linkA.constraints,
  ...linkB.constraints,
  ...redLines,
  ...blueLines,
  ...whiteDots,
];
