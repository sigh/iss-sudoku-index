// Title: FourCast
// Author: Nordy
// Video: https://www.youtube.com/watch?v=gAQFb5frn8U
// Source: https://app.crackingthecryptic.com/sudoku/7qtdB7rFMB

// Rules encoded here:
//  - Normal sudoku (default Shape('9x9') regions).
//  - Grey cells hold even digits.
//  - Each circle's own digit equals the sum of a hidden 3-cell arrow that
//    extends from it horizontally or vertically (Arrow's own semantics: sum
//    along the arrow == the bulb/first cell). The arrow's direction is not
//    given, so every geometrically legal direction is offered as an Or
//    branch per circle; "legal" excludes any direction that runs off the
//    grid or lands on another circle's cell (arrows may not share cells with
//    circles).
//  - Cross-arrow overlap ("may not cross, overlap or share cells with other
//    arrows") is enforced directly: each circle gets a 1-cell auxiliary Var
//    recording which of its own legal directions is active (every branch of
//    its Or pins this Var, so it is always fully determined -- no
//    unconstrained auxiliary state to inflate the solution count). For every
//    pair of directions (one per circle) whose 3-cell paths would actually
//    share a cell, a direct NAND constraint forbids choosing both at once.
//  Nothing is omitted.

const graph = cellGraph('9x9');

// The 10 drawn circles (arrow bulbs), one per hidden arrow.
const circles = [
  'R1C2', 'R1C9', 'R3C4', 'R4C5', 'R5C4', 'R4C8', 'R7C5', 'R8C6', 'R9C9', 'R9C2',
];

// The 11 drawn grey squares.
const greyCells = [
  'R1C3', 'R1C4', 'R1C7', 'R2C8', 'R3C2', 'R3C3', 'R3C8', 'R4C9', 'R5C1',
  'R8C2', 'R8C9',
];

const circleSet = new Set(circles);

// Every direction whose 3-cell arm stays on the grid and does not land on
// another circle's cell. "Extends from its circle" excludes the circle cell
// itself from the arm.
const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };
const candidateArrows = (circle) => {
  const options = [];
  for (const [dir, [dRow, dCol]] of Object.entries(DIRS)) {
    const cells = [1, 2, 3].map(k => graph.step(circle, dRow * k, dCol * k));
    if (cells.some(c => c === null)) continue;
    if (cells.some(c => circleSet.has(c))) continue;
    options.push({ dir, cells });
  }
  return options;
};

const arrows = circles.map(candidateArrows);
arrows.forEach((opts, i) => {
  if (opts.length === 0) {
    throw new Error(`circle ${circles[i]} has no legal arrow placement`);
  }
});

// One 1-cell auxiliary Var per circle, recording which legal direction (a
// 1-based index into that circle's own `arrows[i]` list) is active. Every
// branch of the circle's own Or pins it, so it always holds exactly one
// value in {1..arrows[i].length} -- there is no branch that leaves it free.
const dirVars = circles.map((_, i) => new Var(
  `D${String.fromCharCode(65 + i)}`, `Dir${i + 1}`, 1));
const dirCell = i => dirVars[i].cell(1);
const allIndices = i => arrows[i].map((_, k) => k + 1);

// Direct pairwise bans: for every pair of circles and every pair of their
// own directions whose 3-cell paths actually intersect, forbid choosing both
// at once (`Or` of "circle i didn't pick that direction" /
// "circle j didn't pick that direction" -- a NAND over the two direction
// Vars). Computed from the candidate cells above rather than hand-listed.
const overlapBans = [];
for (let i = 0; i < circles.length; i++) {
  for (let j = i + 1; j < circles.length; j++) {
    for (let a = 0; a < arrows[i].length; a++) {
      const cellsA = new Set(arrows[i][a].cells);
      for (let b = 0; b < arrows[j].length; b++) {
        if (!arrows[j][b].cells.some(c => cellsA.has(c))) continue;
        overlapBans.push(new Or([
          new Given(dirCell(i), ...allIndices(i).filter(k => k !== a + 1)),
          new Given(dirCell(j), ...allIndices(j).filter(k => k !== b + 1)),
        ]));
      }
    }
  }
}

return [
  new Shape('9x9'),
  ...dirVars,

  ...greyCells.map(cell => new Given(cell, 2, 4, 6, 8)),

  // Pick one legal direction per circle: it ties the circle's own digit to
  // the sum of that direction's 3 cells (Arrow's bulb-first convention), and
  // records the choice on the circle's own direction Var.
  ...circles.map((circle, i) => new Or(
    arrows[i].map(({ cells }, k) => new And([
      new Arrow(circle, ...cells),
      new Given(dirCell(i), k + 1),
    ]))
  )),

  ...overlapBans,
];
