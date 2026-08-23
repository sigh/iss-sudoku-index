// Title: Remote Clones Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=G92kMb6esn4
// Source: https://app.crackingthecryptic.com/sudoku/DnPM6Jdm4g

// Normal sudoku rules (rows, columns, boxes) are ISS defaults for Shape('9x9').
//
// Remote-clone arrows: a marked cell carries two short direction arms (drawn
// as two 0.4-cell stub arrows, not full paths). Reading the clue cell's own
// digit as N, the cell N steps out along each arm holds the same digit as
// the cell N steps out along the other arm. Both target cells must lie on
// the board, which restricts which digits the clue cell itself may hold --
// this is the deduction the video title asks about.
//
// There is no `implies` primitive, so "clue == N implies target1 == target2"
// is expressed per-N as the equivalent disjunction "clue != N OR target1 ==
// target2" (Or/Given/SameValues).
//
// Clue cells and their two arm directions, transcribed from the drawn short
// direction-arrow stubs (each clue cell carries exactly two, one per arm).
const clues = [
  ['R1C7', 'left', 'down'],
  ['R2C4', 'left', 'down'],
  ['R2C7', 'left', 'down'],
  ['R2C8', 'left', 'down'],
  ['R3C7', 'right', 'down'],
  ['R4C3', 'down', 'right'],
  ['R4C4', 'right', 'down'],
  ['R4C6', 'up', 'right'],
  ['R4C8', 'left', 'down'],
  ['R5C4', 'up', 'right'],
  ['R5C5', 'up', 'right'],
  ['R5C7', 'up', 'right'],
  ['R6C9', 'left', 'down'],
  ['R8C5', 'up', 'right'],
  ['R9C5', 'up', 'left'],
  ['R9C7', 'up', 'left'],
  ['R9C9', 'up', 'left'],
];

const DELTA = {
  up: [-1, 0],
  down: [1, 0],
  left: [0, -1],
  right: [0, 1],
};

// N steps along a direction from a clue cell; null if it leaves the 9x9 board.
function stepTarget(cell, dir, n) {
  const { row, col } = parseCellId(cell);
  const [dr, dc] = DELTA[dir];
  const r = row + dr * n;
  const c = col + dc * n;
  if (r < 1 || r > 9 || c < 1 || c > 9) return null;
  return makeCellId(r, c);
}

const ALL_VALUES = Array.from({ length: 9 }, (_, i) => i + 1);

const remoteClones = clues.flatMap(([cell, arm1, arm2]) => {
  const validNs = [];
  const disjuncts = [];
  for (const n of ALL_VALUES) {
    const t1 = stepTarget(cell, arm1, n);
    const t2 = stepTarget(cell, arm2, n);
    if (t1 === null || t2 === null) continue;
    validNs.push(n);
    disjuncts.push(new Or([
      new Given(cell, ...ALL_VALUES.filter(v => v !== n)),
      new SameValues(2, t1, t2),
    ]));
  }
  // The clue cell's own digit must be one for which both arm targets exist
  // on the board, or the rule has nothing to compare against.
  return [new Given(cell, ...validNs), ...disjuncts];
});

return [
  new Shape('9x9'),
  ...remoteClones,
];
