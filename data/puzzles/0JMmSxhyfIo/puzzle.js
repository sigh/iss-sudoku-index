// Title: Compounding The Co-Dependency
// Author: Prasanna Seshadri
// Video: https://www.youtube.com/watch?v=0JMmSxhyfIo
// Source: https://cracking-the-cryptic.web.app/sudoku/TmMBJj8jbr

// Normal sudoku rules apply: standard rows, columns and 3x3 boxes.
//
// The grid carries 7 pairs of mutually-exclusive variant rulesets, drawn on
// 7 pairs of areas (left/right lanes, top/bottom lanes, box1/box9,
// box2/box8, box3/box7, box4/box6, and the two quad clues in box5). For
// each pair, one area follows one named ruleset and the other area follows
// the other -- which area gets which is left for the solver to work out, so
// each pair is encoded below as a disjunction over both assignments rather
// than pinned to a guessed reading. No converse ("all possible dots/marks
// are given") rules apply anywhere.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// ---------------------------------------------------------------------
// Pair A: left lanes / right lanes -- Outside Parity vs Skyscraper.
// "Outside Parity": the clue counts the first N cells (from the clue) that
// share the parity of the first cell, up to (not including) the first cell
// of the other parity. N is small in every clue here, so it is encoded as a
// literal same-parity chain followed by one parity flip, rather than a
// general-purpose state machine.
// "Skyscraper": standard visible-count-of-heights outside clue.
const sameParityKey = Pair.fnToKey((a, b) => a % 2 === b % 2, 9);
const diffParityKey = Pair.fnToKey((a, b) => a % 2 !== b % 2, 9);

function outsideParity(cells, n) {
  const parts = [];
  for (let i = 0; i < n - 1; i++) {
    parts.push(new Pair(sameParityKey, 'same parity', cells[i], cells[i + 1]));
  }
  parts.push(new Pair(diffParityKey, 'other parity', cells[n - 1], cells[n]));
  return parts;
}

// Lane cell order is grid-outward from each clue (nearest-grid-first),
// matching the direction the clue looks into the grid.
const leftLanes = [
  { cells: graph.ray('R1C1', 0, 1), value: 1 },  // left of row 1, overlay #10
  { cells: graph.ray('R3C1', 0, 1), value: 4 },  // left of row 3, overlay #11
];
const rightLanes = [
  { cells: graph.ray('R7C9', 0, -1), value: 2 }, // right of row 7, overlay #15
  { cells: graph.ray('R9C9', 0, -1), value: 1 }, // right of row 9, overlay #16
];

const leftAsParity = leftLanes.flatMap(l => outsideParity(l.cells, l.value));
const leftAsSkyscraper = leftLanes.map(l => Skyscraper.fromCells(l.value, l.cells, geometry));
const rightAsParity = rightLanes.flatMap(l => outsideParity(l.cells, l.value));
const rightAsSkyscraper = rightLanes.map(l => Skyscraper.fromCells(l.value, l.cells, geometry));

const leftRightPair = new Or([
  new And([...leftAsParity, ...rightAsSkyscraper]),
  new And([...leftAsSkyscraper, ...rightAsParity]),
]);

// ---------------------------------------------------------------------
// Pair B: top lanes / bottom lanes -- Serbian Frame vs X-Sums.
// "Serbian Frame": the clue is the sum of the 3rd and 4th cells from the
// clue (index 2,3 in the grid-outward cell order below).
// "X-Sums": standard first-N-cells-sum-to-clue outside clue, where N is the
// digit in the first cell.
const topLanes = [
  { cells: graph.ray('R1C1', 1, 0), value: 13 }, // top of col 1, overlay #12
  { cells: graph.ray('R1C4', 1, 0), value: 12 }, // top of col 4, overlay #13
  { cells: graph.ray('R1C5', 1, 0), value: 17 }, // top of col 5, overlay #14
];
const bottomLanes = [
  { cells: graph.ray('R9C5', -1, 0), value: 5 },  // bottom of col 5, overlay #19
  { cells: graph.ray('R9C6', -1, 0), value: 15 }, // bottom of col 6, overlay #18
  { cells: graph.ray('R9C9', -1, 0), value: 14 }, // bottom of col 9, overlay #17
];

const serbianFrame = l => new Sum(l.value, l.cells[2], l.cells[3]);
const xSum = l => XSum.fromCells(l.value, l.cells, geometry);

const topAsSerbian = topLanes.map(serbianFrame);
const topAsXSum = topLanes.map(xSum);
const bottomAsSerbian = bottomLanes.map(serbianFrame);
const bottomAsXSum = bottomLanes.map(xSum);

const topBottomPair = new Or([
  new And([...topAsSerbian, ...bottomAsXSum]),
  new And([...topAsXSum, ...bottomAsSerbian]),
]);

// ---------------------------------------------------------------------
// Pair C: box1 line / box9 line -- Arrow vs Thermo. Each line's bulb-end
// cell (from line data) leads its cell list.
const line1 = ['R2C3', 'R1C2', 'R2C1', 'R2C2']; // box1 line, bulb R2C3
const line9 = ['R8C7', 'R8C8', 'R8C9', 'R9C8']; // box9 line, bulb R8C7

const box19Pair = new Or([
  new And([new Arrow(...line1), new Thermo(...line9)]),
  new And([new Thermo(...line1), new Arrow(...line9)]),
]);

// ---------------------------------------------------------------------
// Pair D: box2 dots / box8 dots -- 3-Difference vs Consecutive. Every dot
// in both boxes is drawn white, so only the white-dot reading of each
// ruleset is ever in play.
const diff3Key = Pair.fnToKey((a, b) => Math.abs(a - b) === 3, 9);

const box2Dots = [['R1C4', 'R2C4'], ['R1C6', 'R2C6']]; // overlays #2, #3
const box8Dots = [['R8C4', 'R9C4'], ['R8C6', 'R9C6']]; // overlays #4, #5

const asDifference3 = dots => dots.map(([a, b]) => new Pair(diff3Key, 'white dot', a, b));
const asConsecutive = dots => dots.map(([a, b]) => new WhiteDot(a, b));

const box28Pair = new Or([
  new And([...asDifference3(box2Dots), ...asConsecutive(box8Dots)]),
  new And([...asConsecutive(box2Dots), ...asDifference3(box8Dots)]),
]);

// ---------------------------------------------------------------------
// Pair E: box3 shaded cells / box7 shaded cells -- Even Set vs Odd Set.
// Each ruleset restricts its 4 shaded cells to a 4-value parity set and
// requires them distinct, which forces all 4 values to appear.
const box3Cells = ['R1C8', 'R2C9', 'R2C7', 'R3C8']; // shaded underlays
const box7Cells = ['R7C2', 'R8C1', 'R9C2', 'R8C3']; // shaded underlays
const EVEN = [2, 4, 6, 8];
const ODD = [1, 3, 5, 7];

const asSet = (cells, values) =>
  [...cells.map(c => new Given(c, ...values)), new AllDifferent(...cells)];

const box37Pair = new Or([
  new And([...asSet(box3Cells, EVEN), ...asSet(box7Cells, ODD)]),
  new And([...asSet(box3Cells, ODD), ...asSet(box7Cells, EVEN)]),
]);

// ---------------------------------------------------------------------
// Pair F: box4 dots / box6 dots -- Kropki vs XV. Kropki reads white as
// difference-1 (WhiteDot) and black as double (BlackDot); XV reads white as
// sum-10 (X) and black as sum-5 (V). Box6 carries no white dot, so only its
// black-dot reading appears in either branch.
const box4White = [['R5C3', 'R6C3']];              // overlay #6
const box4Black = [['R5C1', 'R5C2']];              // overlay #7
const box6Black = [['R4C7', 'R5C7'], ['R5C8', 'R5C9']]; // overlays #8, #9

const box46Pair = new Or([
  new And([
    ...box4White.map(([a, b]) => new WhiteDot(a, b)),
    ...box4Black.map(([a, b]) => new BlackDot(a, b)),
    ...box6Black.map(([a, b]) => new V(a, b)),
  ]),
  new And([
    ...box4White.map(([a, b]) => new X(a, b)),
    ...box4Black.map(([a, b]) => new V(a, b)),
    ...box6Black.map(([a, b]) => new BlackDot(a, b)),
  ]),
]);

// ---------------------------------------------------------------------
// Pair G: the two box5 quad clues -- Quadruple vs Quad Sum. Both clues
// print "14"; Quadruple reads it as the two digits 1 and 4 that must
// appear, Quad Sum reads it as the total of all 4 cells.
const quad1 = { topLeft: 'R4C4', cells: ['R4C4', 'R4C5', 'R5C4', 'R5C5'] }; // overlay #0
const quad2 = { topLeft: 'R5C5', cells: ['R5C5', 'R5C6', 'R6C5', 'R6C6'] }; // overlay #1

const box5Pair = new Or([
  new And([new Quad(quad1.topLeft, 1, 4), new Sum(14, ...quad2.cells)]),
  new And([new Sum(14, ...quad1.cells), new Quad(quad2.topLeft, 1, 4)]),
]);

return [
  new Shape('9x9'),
  leftRightPair,
  topBottomPair,
  box19Pair,
  box28Pair,
  box37Pair,
  box46Pair,
  box5Pair,
];
