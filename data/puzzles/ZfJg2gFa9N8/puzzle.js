// Title: Floating Sandwiches
// Author: Dying Flutchman
// Video: https://www.youtube.com/watch?v=ZfJg2gFa9N8
// Source: https://app.crackingthecryptic.com/sudoku/JB9QRtD7bt

// Normal sudoku. Black dots join digits with a 1:2 ratio (BlackDot); white
// dots join consecutive digits (WhiteDot). Not all dots are shown, so no
// negative constraint is added for an undotted adjacent pair.
//
// There are 18 "crust cells", 2 in each row and column; a crust cell's own
// digit is unconstrained. An outside clue gives the sum of the digits
// strictly between a line's two crust cells. Nothing in the payload marks
// which cells are crust: crust membership is solver state, located by the
// rule's own fixed count (2 per row, 2 per column) plus, for 10 of the 18
// lines, a printed sum. A VC Var overlay carries NOT_CRUST/CRUST per cell,
// forced to exactly two CRUST per row and per column (every row/column, not
// only the clued ones, since the rule is unconditional) by a Sum trick:
// domain {1,2}, so a 9-cell line's total is 11 iff exactly two cells hold 2.
// A clued line additionally pins which two positions those are, as an Or
// over every position pair in that line; each branch fixes that pair to
// CRUST and sums the real grid digits strictly between them to the clue
// (the row/column-wide Sum(11) then forces every other cell in the line to
// NOT_CRUST, so the branch does not need to say so itself).

const shape = new Shape('9x9');
const graph = cellGraph(shape);
const crust = graph.makeOverlay('VC');

const NOT_CRUST = 1;
const CRUST = 2;
const LINE_LEN = 9;
const CRUST_LINE_TOTAL = 2 * CRUST + (LINE_LEN - 2) * NOT_CRUST;

// Row/column sum clues, provenance: the drawn outside-clue circles, one per
// clued row/column; the 8 unclued lines carry no such circle.
const ROW_SUMS = { 1: 15, 3: 25, 4: 35, 5: 5, 6: 40, 7: 30, 9: 19 };
const COL_SUMS = { 4: 7, 5: 14, 6: 7 };

// Kropki dots, provenance: the drawn edge-centred rounded marks; white fill =
// consecutive, black fill = 1:2 ratio.
const WHITE_DOTS = [
  ['R2C8', 'R2C9'], ['R6C9', 'R7C9'], ['R7C7', 'R7C8'], ['R4C6', 'R5C6'],
  ['R5C3', 'R5C4'], ['R3C1', 'R4C1'], ['R8C1', 'R8C2'],
];
const BLACK_DOTS = [
  ['R8C2', 'R9C2'], ['R5C4', 'R6C4'], ['R5C6', 'R5C7'], ['R1C8', 'R2C8'],
];

// "This line's crust pair sits at some two positions, with this between-sum."
// Position pairs one apart (nothing between) are skipped: every printed sum
// here is positive, so an empty between-range could never match anyway.
function crustPairBranches(lineCells, crustCells, target) {
  const branches = [];
  for (let i = 0; i < lineCells.length; i++) {
    for (let j = i + 2; j < lineCells.length; j++) {
      branches.push(new And([
        new Given(crustCells[i], CRUST),
        new Given(crustCells[j], CRUST),
        new Sum(target, ...lineCells.slice(i + 1, j)),
      ]));
    }
  }
  return new Or(branches);
}

const rowSumConstraints = Object.entries(ROW_SUMS).map(
  ([r, target]) => crustPairBranches(graph.row(+r), crust.row(+r), target));
const colSumConstraints = Object.entries(COL_SUMS).map(
  ([c, target]) => crustPairBranches(graph.column(+c), crust.column(+c), target));

return [
  shape,
  crust.toVar('crust'),
  crust.makeReplicate(new Given(crust.cells()[0], NOT_CRUST, CRUST)),
  ...crust.rows().map(row => new Sum(CRUST_LINE_TOTAL, ...row)),
  ...crust.columns().map(col => new Sum(CRUST_LINE_TOTAL, ...col)),
  ...WHITE_DOTS.map(([a, b]) => new WhiteDot(a, b)),
  ...BLACK_DOTS.map(([a, b]) => new BlackDot(a, b)),
  ...rowSumConstraints,
  ...colSumConstraints,
];
