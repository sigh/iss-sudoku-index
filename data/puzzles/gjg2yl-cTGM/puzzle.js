// Title: Foggy Knight
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=gjg2yl-cTGM
// Source: https://app.crackingthecryptic.com/sudoku/L8HrDHNbHL

// Normal sudoku rules apply. Fog/reveal is solving UI, not a rule of the
// finished grid, and is not encoded.
//
// Each digit satisfies exactly one of:
//   a) it is a knight's move from at least one cell holding the same digit;
//   b) it sits in "its own" box -- box N (1-9, reading order) holds digit N;
//   c) it is the digit 5.
// Exception: the centre cell (R5C5) satisfies exactly two of the three.
//
// Each cell's rule is an Or over the mutually-exclusive ways to satisfy the
// required count: one And per way, combining a positive/negative reading of
// condition (a) with a single Given fixing the digit domain that (b) and (c)
// jointly leave for that way. Condition (a)'s positive form is a two-cell
// SameValues (equal) against one knight neighbour, at least one of which
// must hold; its negative form is a two-cell AllDifferent (not equal)
// against every knight neighbour. Conditions (b) and (c) are each a value
// test on the cell's own digit ("== box index", "== 5"), so a way that
// requires one true and the other false is a Given over the values
// consistent with both -- and, when that set is empty (b and c coincide, in
// box 5, whose index is 5), the way is not just false but unreachable, so it
// is dropped rather than encoded as a contradiction.

const graph = cellGraph('9x9');
const knightOffsets = [
  [-2, -1], [-2, 1], [-1, -2], [-1, 2],
  [1, -2], [1, 2], [2, -1], [2, 1],
];

const knightNeighbours = cell => knightOffsets.map(([dr, dc]) => graph.step(cell, dr, dc)).filter(c => c != null);

// Boxes numbered 1-9 in reading order (top-left = 1, bottom-right = 9).
function boxIndex(cell) {
  const { row, col } = parseCellId(cell);
  return Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1;
}

const ALL_VALUES = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const conditionA = (cell, neighbours) =>
  new Or(neighbours.map(n => new SameValues(2, cell, n)));
const notConditionA = (cell, neighbours) =>
  new And(neighbours.map(n => new AllDifferent(cell, n)));

// The digit values consistent with (b) reading `bTruth` and (c) reading
// `cTruth` for a cell in box `box`, or null when no digit can satisfy both.
function bcDomain(box, bTruth, cTruth) {
  const bValues = bTruth ? [box] : ALL_VALUES.filter(v => v !== box);
  const cValues = cTruth ? [5] : ALL_VALUES.filter(v => v !== 5);
  const domain = bValues.filter(v => cValues.includes(v));
  return domain.length ? domain : null;
}

// One And per way to hit `target` true conditions among {a, b, c}, omitting
// any way whose (b, c) combination is unreachable.
function exactlyN(target, cell, neighbours, box) {
  // Enumerate all 3 assignments of {a, b, c} truth with exactly `target`
  // true, explicitly, rather than computing them -- clearer to check
  // against the rule by eye.
  const assignments = target === 1
    ? [
      [true, false, false],
      [false, true, false],
      [false, false, true],
    ]
    : [
      [true, true, false],
      [true, false, true],
      [false, true, true],
    ];
  const ands = [];
  for (const [aTruth, bTruth, cTruth] of assignments) {
    const domain = bcDomain(box, bTruth, cTruth);
    if (domain === null) continue;
    ands.push(new And([
      aTruth ? conditionA(cell, neighbours) : notConditionA(cell, neighbours),
      new Given(cell, ...domain),
    ]));
  }
  return new Or(ands);
}

const cellRules = graph.cells().map(cell => {
  const neighbours = knightNeighbours(cell);
  const box = boxIndex(cell);
  const { row, col } = parseCellId(cell);
  const isCentre = row === 5 && col === 5;
  return exactlyN(isCentre ? 2 : 1, cell, neighbours, box);
});

return [
  new Shape('9x9'),
  new Given('R1C4', 9), new Given('R1C6', 5),
  new Given('R2C3', 8), new Given('R2C4', 7),
  new Given('R3C7', 7),
  new Given('R4C2', 2), new Given('R4C5', 7),
  new Given('R6C6', 2),
  new Given('R7C4', 2),
  new Given('R8C9', 8),
  ...cellRules,
];
