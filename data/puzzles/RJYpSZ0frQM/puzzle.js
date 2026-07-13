// Title: Tree Squirrel
// Author: Derek LeClair
// Video: https://www.youtube.com/watch?v=RJYpSZ0frQM
// Source: https://sudokupad.app/pyufyvwwpw
//
// Normal sudoku rules apply. The 3x3 box borders divide the blue line into
// segments. Each segment's total is found by summing the digits on that
// segment. The segment totals must increase by 1 from one end of the line to
// the other. Adjacent digits on the line must not be consecutive.

const graph = cellGraph('9x9');
const boxes = graph.boxes();
const boxIndexOf = cell => boxes.findIndex(box => box.includes(cell));

// The blue line, in path order (drawn geometry).
const lineCells = [
  'R8C4', 'R8C5', 'R7C5', 'R7C4', 'R7C3', 'R7C2', 'R6C2', 'R6C3', 'R5C3',
  'R4C3', 'R4C4', 'R5C4', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R6C8', 'R5C8',
  'R5C7', 'R5C6', 'R4C6', 'R4C5', 'R3C5', 'R2C5', 'R2C6', 'R1C6', 'R1C7',
  'R1C8', 'R2C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C8',
  'R8C9', 'R9C9', 'R9C8', 'R8C7', 'R8C6', 'R9C6', 'R9C5', 'R9C4', 'R9C3',
  'R9C2', 'R8C2', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R4C2', 'R3C2',
  'R3C3', 'R2C3', 'R2C2', 'R2C1', 'R1C1', 'R1C2',
];

// --- Adjacent digits on the line must not be consecutive. A single Pair over
// the whole ordered line applies the relation to every adjacent pair on the
// path, which is exactly the rule's scope (not per-segment).
const nonConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

// --- Box borders split the line into segments; derive the split from the
// drawn line and the grid's own box regions rather than hand-listing them.
const segments = [[lineCells[0]]];
for (let i = 1; i < lineCells.length; i++) {
  if (boxIndexOf(lineCells[i]) === boxIndexOf(lineCells[i - 1])) {
    segments[segments.length - 1].push(lineCells[i]);
  } else {
    segments.push([lineCells[i]]);
  }
}

// --- Segment totals increase by 1 from one end of the line to the other:
// each consecutive pair of segment sums differs by exactly 1. Expressed as
// linear equations (this segment's sum) - (previous segment's sum) = 1;
// which physical end is "first" doesn't matter, since the rule is symmetric
// under reversal (increasing one way is decreasing the other).
const segmentSums = segments.slice(1).map((segment, idx) => {
  const i = idx + 1;
  const terms = [
    ...segments[i].map(cell => [cell, 1]),
    ...segments[i - 1].map(cell => [cell, -1]),
  ];
  return new Sum(1, ...terms);
});

return [
  new Shape('9x9'),
  new Pair(nonConsecutiveKey, 'non-consecutive', ...lineCells),
  ...segmentSums,
];
