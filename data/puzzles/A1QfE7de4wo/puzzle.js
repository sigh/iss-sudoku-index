// Title: The Secret Squared
// Author: BenTen
// Video: https://www.youtube.com/watch?v=A1QfE7de4wo
// Source: https://sudokupad.app/hxxmopig9c

// Normal sudoku, no givens. Each box has one circled cell (a white circle
// underlay in the source, drawn with no digit); the digit placed there is
// that box's multiplier, applying to every cell in the box. A cell's value
// = its digit * its box's multiplier. A value can reach 81, past ISS's
// 16-state Var cap, so neither value-based rule below materializes a
// per-cell value; each is turned into an equivalent constraint over plain
// grid digits instead.
//
// Whole-grid cage (drawn as a single 81-cell cage, total 2025): every box's
// digits are some permutation of 1-9 (ISS's default box all-different), so a
// box's value-sum is always 45 * that box's multiplier, for any grid
// regardless of this puzzle's other rules. So sum(all cell values) = 2025
// reduces exactly to sum(the 9 multiplier digits) = 45 -- an equality that
// holds for the identical set of grids, not a relaxed one.
//
// Blue lines: box borders cut each line into segments (split below from the
// drawn cell sequence, not hand-split). Every segment lies inside one box,
// so its value-sum is (that box's multiplier digit) * (sum of the segment's
// digits) -- a product of two variables, so it isn't a plain linear `Sum`.
// Fixing both segments' multiplier digits turns the equality into a linear
// equation over the segment cells, so `equalSegmentValues` case-splits over
// the 9x9 possible (multiplier, multiplier) pairs for each adjacent segment
// pair and requires the resulting linear equation for whichever pair is
// realized; chaining adjacent pairs (rather than all pairs) is enough to
// force every segment in the line to a common value by transitivity.

const graph = cellGraph('9x9');
const boxes = graph.boxes();
const boxOf = cell => boxes.findIndex(box => box.includes(cell));

// One circled (multiplier) cell per box -- position of each white circle
// underlay in the source's `underlays` list.
const multiplierCells = [
  'R2C3', 'R2C5', 'R3C8', 'R6C1', 'R6C5', 'R6C9', 'R8C1', 'R7C6', 'R8C8',
];
const multiplierCellForBox = {};
for (const cell of multiplierCells) multiplierCellForBox[boxOf(cell)] = cell;

// Blue line cell sequences, transcribed from the source's `lines` wayPoints.
const blueLines = [
  ['R8C2', 'R8C3', 'R8C4', 'R9C5'],
  ['R7C6', 'R8C7', 'R7C8', 'R6C8'],
  ['R5C8', 'R4C9', 'R3C9', 'R2C9'],
  ['R3C7', 'R4C7'],
  ['R6C7', 'R6C6', 'R6C5', 'R5C5', 'R5C6', 'R4C6', 'R4C5', 'R4C4', 'R5C4',
    'R6C4', 'R6C3', 'R6C2', 'R7C1'],
  ['R5C3', 'R4C3', 'R3C4', 'R2C4'],
  ['R1C8', 'R2C7', 'R2C6', 'R1C5'],
  ['R3C6', 'R2C5', 'R1C4', 'R2C3', 'R3C2', 'R4C1'],
];

// Split a line's cells into runs that share a box, at every point the box
// changes -- the "box borders divide the line" cut points.
function segmentsOf(line) {
  const segments = [];
  let current = [line[0]];
  let currentBox = boxOf(line[0]);
  for (const cell of line.slice(1)) {
    const box = boxOf(cell);
    if (box === currentBox) {
      current.push(cell);
    } else {
      segments.push(current);
      current = [cell];
      currentBox = box;
    }
  }
  segments.push(current);
  return segments;
}

// segA's value-sum (multA * sum(segA)) equals segB's (multB * sum(segB)).
// Case-split on both multiplier digits (1-9 each) so each branch's equality
// is linear in the segment cells: a*sum(segA) - b*sum(segB) = 0.
function equalSegmentValues(segA, boxA, segB, boxB) {
  const multA = multiplierCellForBox[boxA];
  const multB = multiplierCellForBox[boxB];
  const branches = [];
  for (let a = 1; a <= 9; a++) {
    for (let b = 1; b <= 9; b++) {
      // a === b === 1 is a plain equal-sum between the two segments, not a
      // genuine coefficient equation; express it with EqualSum directly
      // (lint_constraints.js's sum-equal-sum guidance flags the +/-1 Sum form).
      const equality = a === 1 && b === 1
        ? new EqualSum(segA, segB)
        : new Sum(0, ...segA.map(c => [c, a]), ...segB.map(c => [c, -b]));
      branches.push(new And([
        new Given(multA, a),
        new Given(multB, b),
        equality,
      ]));
    }
  }
  return new Or(branches);
}

const lineConstraints = blueLines.flatMap(line => {
  const segments = segmentsOf(line);
  const segBoxes = segments.map(seg => boxOf(seg[0]));
  return segments.slice(1).map((seg, i) => equalSegmentValues(
    segments[i], segBoxes[i], seg, segBoxes[i + 1]));
});

return [
  new Shape('9x9'),
  new Sum(45, ...multiplierCells),
  ...lineConstraints,
];
