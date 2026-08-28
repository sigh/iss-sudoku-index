// Title: 45-45-90
// Author: arctan
// Video: https://www.youtube.com/watch?v=MBvGO_KOJRI
// Source: https://beta.sudokupad.app/fbhfM7M84N
//
// Normal sudoku rules (standard 3x3 boxes, matching the payload's drawn
// regions -- Shape's default tiling). One given: R2C2=3. Two arrows, bulb
// sums its arm cells: R2C7 = R3C7+R2C6, and R7C2 = R8C2+R7C1 (each arrow's
// bulb cell is itself one of the yellow circles below). Yellow circles are a
// self-counting clue (a circle's digit counts how many circles hold that
// digit) via CountingCircles.
//
// The remaining rule -- circles paired into opposite corners of an
// axis-aligned square, with the pair's sum written into one of the square's
// other two corners, no two pairs sharing a sum cell, pairing and corner
// choice both left to the solver -- has no dedicated ISS class and is built
// below from Var selectors plus Sum/Or/And.

// Yellow-circle cells (drawn as underlay fill #F7D038, 0.82x0.82 rounded, at
// these centres; [row, col], 1-indexed).
const CIRCLES = [
  [2, 5], [2, 7], [3, 3], [3, 4], [3, 6], [4, 3], [4, 7], [5, 2],
  [5, 8], [6, 3], [6, 7], [7, 2], [7, 4], [7, 6], [7, 7], [8, 5],
];
const circleCells = CIRCLES.map(([r, c]) => makeCellId(r, c));

// Two circles at (r1,c1) and (r2,c2) are "opposite corners of a square"
// exactly when |r1-r2| = |c1-c2| (an axis-aligned square of that side
// length); the square's other two corners -- where the pair's sum digit may
// be written, per the rules' own worked example (r4c7/r7c4 -> r4c4 or r7c7)
// -- are then (r1,c2) and (r2,c1). Every candidate pairing is computed here
// from CIRCLES, not hand-listed, since the rule is explicit that pairing and
// corner choice are both for the solver to find.
const edges = [];
for (let i = 0; i < CIRCLES.length; i++) {
  for (let j = i + 1; j < CIRCLES.length; j++) {
    const [r1, c1] = CIRCLES[i];
    const [r2, c2] = CIRCLES[j];
    const dr = Math.abs(r1 - r2), dc = Math.abs(c1 - c2);
    if (dr === dc && dr > 0) {
      edges.push({
        i, j,
        cellI: circleCells[i],
        cellJ: circleCells[j],
        cornerA: makeCellId(r1, c2),
        cornerB: makeCellId(r2, c1),
      });
    }
  }
}

// One Var per edge per corner-choice: value 2 means "this edge is the
// chosen pairing, with its sum written in this corner"; value 1 means not.
// (Values 1/2 rather than 0/1 so the selectors stay in the grid's normal
// 1-9 alphabet -- no widened Shape needed.) Two separate same-length Var
// groups, one per corner side, so each is read by a plain additive index.
const selVarA = new Var('PA', 'pair corner-A selector', edges.length);
const selVarB = new Var('PB', 'pair corner-B selector', edges.length);
const selA = (e) => selVarA.cell(e + 1);
const selB = (e) => selVarB.cell(e + 1);
const selectorGivens = edges.flatMap((_, e) => [
  new Given(selA(e), 1, 2),
  new Given(selB(e), 1, 2),
]);

// Every circle is used by exactly one chosen pairing: over all (edge,
// corner) slots incident to that circle, the {1,2}-valued selectors sum to
// (slot count + 1) exactly when exactly one of them reads 2.
const perCircleOneActive = circleCells.map((_, idx) => {
  const incident = [];
  edges.forEach((e, ei) => {
    if (e.i === idx || e.j === idx) incident.push(selA(ei), selB(ei));
  });
  return new Sum(incident.length + 1, ...incident);
});

// Every grid cell is the sum-target of at most one chosen pairing: for each
// cell that is a candidate corner for >=1 edge, a slack Var (domain {1,2})
// absorbs the same style of equation, so that two active slots pointing at
// the same corner is infeasible ("different pairs cannot use the same
// square for their sum").
const cornerUsers = new Map();
edges.forEach((e, ei) => {
  for (const [corner, selCell] of [[e.cornerA, selA(ei)], [e.cornerB, selB(ei)]]) {
    if (!cornerUsers.has(corner)) cornerUsers.set(corner, []);
    cornerUsers.get(corner).push(selCell);
  }
});
const cornerList = [...cornerUsers.entries()];
const cornerLimitVars = new Var('K', 'corner sum-usage slack', cornerList.length);
const cornerAtMostOne = cornerList.flatMap(([, sels], idx) => {
  const slackCell = cornerLimitVars.cell(idx + 1);
  return [
    new Given(slackCell, 1, 2),
    new Sum(sels.length + 2, ...sels, slackCell),
  ];
});

// Linking: for each edge, either it is not the chosen pairing (both slots
// read 1), or it is chosen with the sum in cornerA, or chosen with the sum
// in cornerB -- and in either active case the corner cell's digit equals
// the pair's digit sum (Arrow: bulb/control cell first, so the corner is
// the "circle" the two circle digits sum to). Listing exactly these 3 cases
// (never "both active") also rules out an edge using both of its corners.
const edgeLinks = edges.map((e, ei) => new Or([
  new And([new Given(selA(ei), 1), new Given(selB(ei), 1)]),
  new And([new Given(selA(ei), 2), new Arrow(e.cornerA, e.cellI, e.cellJ)]),
  new And([new Given(selB(ei), 2), new Arrow(e.cornerB, e.cellI, e.cellJ)]),
]));

return [
  new Shape('9x9'),
  new Given('R2C2', 3),
  new Arrow('R2C7', 'R3C7', 'R2C6'),
  new Arrow('R7C2', 'R8C2', 'R7C1'),
  new CountingCircles(...circleCells),
  selVarA,
  selVarB,
  ...selectorGivens,
  ...perCircleOneActive,
  cornerLimitVars,
  ...cornerAtMostOne,
  ...edgeLinks,
];
