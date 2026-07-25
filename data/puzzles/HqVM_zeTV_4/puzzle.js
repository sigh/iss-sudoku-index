// Title: Slightly intoxicated
// Author: Eric Bader
// Video: https://www.youtube.com/watch?v=HqVM_zeTV_4
// Source: https://sudokupad.app/a9z92eaf6s

// Normal sudoku rules apply (default row/column/box groups).
//
// Which boxes are intoxicated is not given -- it is a solver deduction. Each
// box gets a flag Var (SOBER/INTOX), forced equal across the box's own 9
// cells. The flag set must contain exactly 4 or 5 INTOX boxes, and the
// INTOX boxes must be orthogonally connected; ConnectedValues needs a full
// 81-cell layer, hence the per-box equality rather than a 9-cell overlay.
//
// Every cage sits inside a single box (checked once below, at load time) and
// is a killer cage (distinct digits; raw payload marks 'unique': true on
// every cage) regardless of its box's status. A sober box's cages sum digits
// normally. An intoxicated box's cages sum each digit's "drunken value"
// instead (1-3 -> 0, 4-6 -> 5, 7-9 -> 10): a per-cell category Var (1/2/3 for
// the three digit thirds) is tied to its grid digit via a Pair relation, and
// the drunken total is a coefficient Sum over the categories
// (value = 5*(category-1), so total = 5*sum(categories) - 5*cellCount).

const SOBER = 1;
const INTOX = 2;

const GIVENS = [
  ['R2C2', 3], ['R3C5', 9], ['R5C8', 2], ['R5C9', 7],
  ['R6C4', 5], ['R8C2', 5], ['R9C6', 1], ['R9C9', 4],
];

// Cages: cells + total, transcribed from the drawn cage outlines.
const CAGES = [
  [['R1C5', 'R2C5', 'R3C5'], 30],
  [['R7C5', 'R8C5', 'R9C5'], 15],
  [['R5C7', 'R5C8', 'R5C9'], 10],
  [['R5C1', 'R5C2', 'R5C3'], 15],
  [['R4C5', 'R5C5'], 5],
  [['R3C2', 'R3C3'], 15],
  [['R2C7', 'R3C7'], 5],
  [['R6C7', 'R6C8', 'R6C9'], 15],
  [['R4C7', 'R4C8', 'R4C9'], 20],
  [['R7C2', 'R7C3', 'R8C3'], 15],
  [['R7C7', 'R7C8', 'R8C7'], 20],
  [['R6C2', 'R6C3'], 10],
  [['R2C6', 'R3C6'], 10],
  [['R7C1', 'R8C1', 'R9C1'], 15],
  [['R7C4', 'R8C4', 'R9C4'], 20],
  [['R2C8', 'R2C9', 'R3C8', 'R3C9'], 30],
  [['R9C7', 'R9C8'], 5],
  [['R7C9', 'R8C8', 'R8C9'], 15],
  [['R9C2', 'R9C3'], 10],
  [['R4C2', 'R4C3'], 10],
  [['R2C1', 'R2C2', 'R2C3', 'R3C1'], 10],
];

const graph = cellGraph('9x9');
const boxes = graph.boxes();

// Box-intoxication flags: one Var per grid cell (ConnectedValues requires a
// full 81-cell layer), forced equal within each box.
const bx = graph.makeOverlay('VBX');
const boxRestrict = bx.makeReplicate(new Given(bx.cells()[0], SOBER, INTOX));
const boxEquality = boxes.map(box => new SameValues(9, ...bx.at(box)));
const boxReps = boxes.map(box => bx.at(box[0]));

// Drunken-value categories for every cage cell: 1 = digit 1-3 (value 0),
// 2 = digit 4-6 (value 5), 3 = digit 7-9 (value 10).
const cageCells = [...new Set(CAGES.flatMap(([cells]) => cells))];
const dc = graph.makeOverlay('VDC', cageCells);
const catRestrict = dc.makeReplicate(new Given(dc.cells()[0], 1, 2, 3));
const catKey = Pair.fnToKey((digit, cat) => cat === Math.ceil(digit / 3), 9);
const catLinks = cageCells.map(cell =>
  new Pair(catKey, 'drunk category', cell, dc.at(cell)));

function boxOf(cell) {
  const box = boxes.find(b => b.includes(cell));
  if (!box) throw new Error(`Cell ${cell} is not in any box`);
  return box;
}

function cageConstraints([cells, total]) {
  const rep = bx.at(boxOf(cells[0])[0]);
  const n = cells.length;
  return [
    new AllDifferent(...cells),
    new Or([
      new And([new Given(rep, SOBER), new Sum(total, ...cells)]),
      new And([
        new Given(rep, INTOX),
        new Sum(total + 5 * n, ...cells.map(c => [dc.at(c), 5])),
      ]),
    ]),
  ];
}

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),

  bx.toVar('box intoxication'),
  boxRestrict,
  ...boxEquality,
  new ConnectedValues('VBX', INTOX),
  // Exactly 4 or 5 intoxicated boxes: sum = 9 (all SOBER=1) + #INTOX.
  new Or([new Sum(13, ...boxReps), new Sum(14, ...boxReps)]),

  dc.toVar('drunk category'),
  catRestrict,
  ...catLinks,

  ...CAGES.flatMap(cageConstraints),
];
