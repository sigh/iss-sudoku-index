// Title: Miracle Clones
// Author: Undar_Beyond
// Video: https://www.youtube.com/watch?v=qFLD2TFijJQ
// Source: https://app.crackingthecryptic.com/webapp/6MfbJmQ66B

// Rules encoded here:
//   1. Normal sudoku rules apply.
//   2. Digits along a thermometer increase from the bulb end.
//   3. There are 8 identical clones in the grid which consist of 3 cells each.
//      (Clones cannot be rotated or reflected.)  Clones have an orthogonally
//      connected shape.  No two clones overlap.
//   4. Digits on clones cannot be the same if they are separated by a knight's
//      move (in chess).
// The grid has no given digits.  Nothing is omitted.

// Thermometers, bulb first.  Each is one drawn grey stroke with a grey bulb
// circle at its first waypoint; cells the stroke passes through between two
// waypoints (R3C7 on the fourth, R7C3 on the sixth) are on the thermometer.
const THERMOS = [
  ['R3C2', 'R3C1', 'R4C1'],
  ['R2C3', 'R1C3', 'R1C4'],
  ['R1C7', 'R1C8'],
  ['R2C6', 'R3C7', 'R4C8', 'R3C9'],
  ['R7C7', 'R6C6', 'R5C6', 'R6C5', 'R5C5'],
  ['R9C3', 'R8C4', 'R7C3', 'R6C2'],
  ['R7C1', 'R8C1', 'R9C1'],
];

const graph = cellGraph('9x9');
const cells = graph.cells();

// A 3-cell orthogonally connected shape is a path of three cells: A - B - C,
// with B orthogonally adjacent to both A and C.  Each grid cell carries a role
// code saying which position of a clone (if any) it occupies.  A single role per
// cell is what makes the clones non-overlapping.
const NONE = 1, ROLE_A = 2, ROLE_B = 3, ROLE_C = 4;
const ROLES = [ROLE_A, ROLE_B, ROLE_C];
const role = graph.makeOverlay('VR');

// The three digits of the clone, at positions A, B and C.  Because all 8 clones
// are identical, every role-A cell holds VD1, every role-B cell VD2, every
// role-C cell VD3.
const CLONE_DIGITS = ['VD1', 'VD2', 'VD3'];

const STEPS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// Biconditional between the role of a cell and the role of the cell one fixed
// step away: exactly the cells at role `from` have a cell at role `to` that step
// onwards, so the A->B (and B->C) offset is shared by all 8 clones and no clone
// is rotated or reflected relative to another.
const stepKey = (from, to) =>
  Pair.fnToKey((a, b) => (a === from) === (b === to), 9);

// One Or branch per candidate offset for one step of the clone path.  Cells with
// no partner that way cannot take the role that would need one.
const stepBranches = (from, to, name) => STEPS.map(([dR, dC]) => new And([
  ...cells.flatMap(cell => {
    const prev = graph.step(cell, -dR, -dC);
    return prev
      ? [new Pair(stepKey(from, to), name, role.at(prev), role.at(cell))]
      : [new Given(role.at(cell), ...[NONE, ...ROLES].filter(v => v !== to))];
  }),
  ...cells.filter(cell => graph.step(cell, dR, dC) === null).map(
    cell => new Given(role.at(cell), ...[NONE, ...ROLES].filter(v => v !== from))),
]));

// Two cells on clones hold the same digit exactly when they hold the same role,
// so the knight's-move rule forbids two cells of the same role a knight's move
// apart.  (The three clone digits are distinct: a repeated one would occupy 16
// of the grid's 9 copies of that digit, so distinctness below is forced, not an
// extra assumption.)
const sameRoleKey = Pair.fnToKey((a, b) => !(a === b && a !== NONE), 9);
const KNIGHT_STEPS = [[1, 2], [2, 1], [1, -2], [2, -1]];

return [
  new Shape('9x9'),
  role.toVar('clone role'),
  new Var('D', 'clone digits', 3),

  ...THERMOS.map(thermo => new Thermo(...thermo)),

  // Every cell is unused or one of the three clone positions.
  role.makeReplicate(new Given(role.at(cells[0]), NONE, ...ROLES)),
  // 8 clones of 3 cells each.
  new ContainExact(
    ROLES.flatMap(r => Array(8).fill(r)).join('_'), ...role.cells()),

  new Or(stepBranches(ROLE_A, ROLE_B, 'CloneStepAB')),
  new Or(stepBranches(ROLE_B, ROLE_C, 'CloneStepBC')),

  ...KNIGHT_STEPS.map(([dR, dC]) => {
    // One stamp of the pair per cell that has a partner this knight's move away.
    const starts = cells.filter(cell => graph.step(cell, dR, dC) !== null);
    const origin = role.at(starts[0]);
    return new Replicate(
      [new Pair(sameRoleKey, 'CloneKnight',
        origin, role.at(graph.step(starts[0], dR, dC)))],
      Replicate.encodeTargetCells(role.at(starts), origin, role),
      origin);
  }),

  // Each clone cell holds its position's digit.
  ...cells.flatMap(cell => ROLES.map((r, i) => new Or([
    new Given(role.at(cell), ...[NONE, ...ROLES].filter(v => v !== r)),
    new SameValues(2, cell, CLONE_DIGITS[i]),
  ]))),
  new AllDifferent(...CLONE_DIGITS),

  // A->B->C and C->B->A describe the same clone, so without a tie-break every
  // solution appears twice with the two end roles swapped.  This pins one of the
  // two labellings; it is an artifact of the encoding, not a puzzle rule.
  new Pair(Pair.fnToKey((a, b) => a < b, 9), 'CloneEndOrder', 'VD1', 'VD3'),
];
