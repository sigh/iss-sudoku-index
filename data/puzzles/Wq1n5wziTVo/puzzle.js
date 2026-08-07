// Title: Leftovers
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=Wq1n5wziTVo
// Source: https://sudokupad.app/9fipkj2wr0

// SQUISHDOKU. Place a digit from 1-9 in each cell of the 7x7 grid; digits may
// not repeat in a row, column or 3x3 box. The nine 3x3 boxes overlap on the
// dashed lines, so their top-left corners are at rows 1,3,5 and columns 1,3,5.
// Every row and every column therefore holds 7 of the 9 digits, and the 2
// digits it is missing are the subject of the pill clue drawn beside it.
//
// A pill is a two-cell capsule outside the grid; the rules say pills need not
// be filled, so the pair of missing digits is a set. It is carried here by two
// Var cells per row/column, labelled Small/Large purely to name them: the
// Small < Large constraint pins one representative of that labelling and is
// not a puzzle rule.
//
// Pill clues (see the per-clue provenance comments below):
//   black dot  - the row's two missing digits are in a 1:2 ratio;
//   white dot  - the row's two missing digits are consecutive;
//   X          - the column's two missing digits sum to 10;
//   thick purple pill - X-sum: the two missing digits can form a 2-digit
//                number equal to the sum of the first X digits counted from
//                the pill's side, where X is the first digit seen.
//
// Not encoded, because nothing is left to enforce: the payload also draws four
// hidden 9-cell "cross" cages centred on R3C3, R3C5, R5C3 and R5C5 (a column
// segment of 5 crossed with a row segment of 5). Every pair of cells in each
// cross already shares a row, a column or one of the nine boxes, so the cages
// restate the rules above.

const graph = cellGraph('7x7');

// Nine 3x3 boxes, overlapping on grid rows 3 and 5 and columns 3 and 5 (the
// dashed lines); matches the nine 9-cell cages drawn in the source.
const boxes = ['R1C1', 'R1C3', 'R1C5',
               'R3C1', 'R3C3', 'R3C5',
               'R5C1', 'R5C3', 'R5C5'].map(tl => graph.block(tl, 3, 3));

// The two digits missing from each row / each column.
const rowSmall = new Var('RS', 'RowMissingSmall', 7);
const rowLarge = new Var('RL', 'RowMissingLarge', 7);
const colSmall = new Var('CS', 'ColMissingSmall', 7);
const colLarge = new Var('CL', 'ColMissingLarge', 7);

const ratioKey = Pair.fnToKey((a, b) => a === 2 * b || b === 2 * a, 9);
const consecutiveKey = Pair.fnToKey((a, b) => a === b + 1 || b === a + 1, 9);
const orderKey = Pair.fnToKey((a, b) => a < b, 9);

// X-sum pill. `ray` is the row/column read starting at the cell nearest the
// pill, so ray[0] is "the first digit seen" and choosing its value x also
// chooses the window ray[0..x-1] that must sum to the missing pair's 2-digit
// number. "can form a 2-digit number" fixes neither missing digit as the tens
// digit, so both readings are offered.
function xSumPill(ray, small, large) {
  return new Or(ray.map((_, i) => {
    const x = i + 1;
    const window = ray.slice(0, x);
    return new And([
      new Given(ray[0], x),
      new Or([
        new Sum(0, ...window, [small, -10], [large, -1]),
        new Sum(0, ...window, [large, -10], [small, -1]),
      ]),
    ]);
  }));
}

const rows = [1, 2, 3, 4, 5, 6, 7];

return [
  new Shape('7x7', 9),
  new NoBoxes(),
  ...boxes.map(cells => new AllDifferent(...cells)),

  rowSmall, rowLarge, colSmall, colLarge,

  // Each row/column plus its two missing digits is a full 1-9 set.
  ...rows.map(r => new AllDifferent(...graph.row(r), rowSmall.cell(r), rowLarge.cell(r))),
  ...rows.map(c => new AllDifferent(...graph.column(c), colSmall.cell(c), colLarge.cell(c))),

  // Labelling pin for the Small/Large Var pairs (not a puzzle rule).
  ...rows.map(r => new Pair(orderKey, 'order', rowSmall.cell(r), rowLarge.cell(r))),
  ...rows.map(c => new Pair(orderKey, 'order', colSmall.cell(c), colLarge.cell(c))),

  // Row pills, drawn to the right of rows 1-7 across cells C8-C9.
  // Rows 1,2,3 carry a filled black dot; rows 5,6,7 an outlined white dot;
  // row 4 is the thick purple capsule.
  ...[1, 2, 3].map(r => new Pair(ratioKey, 'ratio', rowSmall.cell(r), rowLarge.cell(r))),
  ...[5, 6, 7].map(r => new Pair(consecutiveKey, 'consecutive', rowSmall.cell(r), rowLarge.cell(r))),
  xSumPill(graph.row(4).slice().reverse(), rowSmall.cell(4), rowLarge.cell(4)),

  // Column pills, drawn below columns 1-7 across cells R8-R9.
  // Columns 1,5,6,7 carry an X; columns 3 and 6 are thick purple capsules
  // (column 6 is drawn as a purple capsule with an X inside it, so it takes
  // both clues); columns 2 and 4 are unmarked capsules with no clue.
  ...[1, 5, 6, 7].map(c => new Sum(10, colSmall.cell(c), colLarge.cell(c))),
  ...[3, 6].map(c => xSumPill(graph.column(c).slice().reverse(), colSmall.cell(c), colLarge.cell(c))),
];
