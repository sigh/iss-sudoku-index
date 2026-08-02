// Title: Kin-Kon-Kan Sudoku
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=Mu4utvYBi-Q
// Source: https://sudokupad.app/5vhdcvx1rz

// Rules encoded here, in full:
//  1. Every row, column and box holds the digits 1-7, one '/' mirror and one
//     '\' mirror. Grid value 8 is '/' and value 9 is '\', so the ordinary
//     9-value row/column/box all-different rule is exactly this house rule.
//  2. Each outside clue shines a beam into its row or column. The beam runs
//     straight and turns at every mirror it meets. The rules' worked example --
//     "a beam entering a / mirror from the left would leave going upwards" --
//     fixes both mirrors' four turns (see SLASH/BACK below).
//  3. A clue is the sum of the digits the beam meets until it leaves the grid.
//     Mirror cells carry no digit and add nothing. A beam that crosses one
//     digit cell twice, once per axis, adds it twice: the rules describe the
//     total as the sum along the beam's journey out of the grid.
//  4. Each clue is written '?' followed by one digit, so the total is a
//     two-digit number with that units digit and a tens digit of 1-9.
//
// Nothing is drawn inside the grid: the mirrors' positions and orientations are
// both for the solver to find, so a beam's route is not known in advance. The
// model is therefore a backwards one. For every (cell, travel direction) state
// the overlays hold the sum of the beam that starts by entering that cell
// travelling that way, split into the parts the clues test:
//   VA<dir> -- that sum mod 10, as value (residue + 1), so 1..10;
//   VT<dir> -- floor(sum / 10), saturating at 10 for "100 or more", as value
//              (tens + 1), so 1..11.
// A state whose beam never leaves the grid has no such sum -- with only
// diagonal mirrors a closed light cycle is possible, e.g. '/' and '\' at the
// four corners of a rectangle -- so both overlays carry a sentinel for it
// (A_DEAD, T_DEAD) rather than forcing an equation round the cycle. A beam
// entering from outside cannot be on a cycle, so a clued state is never the
// sentinel.
//
// Each state's sum is one step of its beam: sum(cell, dir) = digit(cell) +
// sum(next cell, next dir), where the next state is the same direction when the
// cell holds a digit, and the mirror's turn when it holds a mirror. Off the
// grid the beam has left, so the sums there are 0 (the VZ exit cells).

const A_DEAD = 11;   // beam from this state never leaves the grid
const T_DEAD = 12;

const shape = new Shape('9x9', 12);
const graph = cellGraph(shape);
const gridCells = graph.cells();

const STEP = { E: [0, 1], W: [0, -1], N: [-1, 0], S: [1, 0] };
// Where a beam travelling in each direction goes on. The rules' example gives
// '/' rightward -> up; the remaining turns are the same mirror seen from the
// other three sides.
const SLASH = { E: 'N', W: 'S', N: 'E', S: 'W' };   // grid value 8
const BACK = { E: 'S', W: 'N', N: 'W', S: 'E' };    // grid value 9
const DIRS = ['E', 'W', 'N', 'S'];

const A = {}, T = {};
for (const d of DIRS) {
  A[d] = graph.makeOverlay('VA' + d);
  T[d] = graph.makeOverlay('VT' + d);
}
const [A_EXIT, T_EXIT] = ['VZ1', 'VZ2'];

const stepTo = (cell, dir) => graph.step(cell, ...STEP[dir]);
const aAt = (cell, dir) => cell === null ? A_EXIT : A[dir].at(cell);
const tAt = (cell, dir) => cell === null ? T_EXIT : T[dir].at(cell);

// Both machines read one state's cells in the order
//   [this cell, ...the three candidate next states..., this state's own value]
// and check the last against whichever next state this cell's value selects:
// the same direction for a digit, SLASH's turn for value 8, BACK's turn for 9.
// State field p is the read position; k is which next state to use; req is the
// value the final read must have.
const residueMachine = NFA.encodeSpec({
  startState: { p: 0 },
  transition: (s, v) => {
    switch (s.p) {
      case 0:   // this cell: a digit to add, or a mirror to turn at
        if (v <= 7) return { p: 1, k: 'd', a: v };
        if (v === 8) return { p: 1, k: 's' };
        if (v === 9) return { p: 1, k: 'b' };
        return undefined;
      case 1:   // next state going straight on
        if (s.k !== 'd') return { p: 2, k: s.k };
        if (v === A_DEAD) return { p: 2, req: A_DEAD };
        if (v > A_DEAD) return undefined;
        return { p: 2, req: ((v - 1 + s.a) % 10) + 1 };
      case 2:   // next state after a '/' turn
        return s.k === 's' ? { p: 3, req: v } : { p: 3, req: s.req, k: s.k };
      case 3:   // next state after a '\' turn
        return s.k === 'b' ? { p: 4, req: v } : { p: 4, req: s.req };
      case 4:   // this state's own residue
        return v === s.req ? { p: 5 } : undefined;
    }
  },
  accept: (s) => s.p === 5,
}, shape);

// The tens machine reads the straight-on state's residue as well, because the
// only way this state's tens count can differ from the next one's is a carry
// out of the residue: adding one digit adds at most ten.
const tensMachine = NFA.encodeSpec({
  startState: { p: 0 },
  transition: (s, v) => {
    switch (s.p) {
      case 0:
        if (v <= 7) return { p: 1, k: 'd', a: v };
        if (v === 8) return { p: 1, k: 's' };
        if (v === 9) return { p: 1, k: 'b' };
        return undefined;
      case 1:   // residue of the next state going straight on
        if (s.k !== 'd') return { p: 2, k: s.k };
        if (v === A_DEAD) return { p: 2, k: 'd', dead: 1 };
        if (v > A_DEAD) return undefined;
        // The digit is all this state adds, so the carry is settled here and
        // the digit and the residue need not be carried any further.
        return { p: 2, k: 'd', carry: (v - 1 + s.a) >= 10 ? 1 : 0 };
      case 2:   // tens of the next state going straight on
        if (s.k !== 'd') return { p: 3, k: s.k };
        if (s.dead === 1) return v === T_DEAD ? { p: 3, req: T_DEAD } : undefined;
        if (v === T_DEAD) return undefined;
        return { p: 3, req: Math.min((v - 1) + s.carry, 10) + 1 };
      case 3:
        return s.k === 's' ? { p: 4, req: v } : { p: 4, req: s.req, k: s.k };
      case 4:
        return s.k === 'b' ? { p: 5, req: v } : { p: 5, req: s.req };
      case 5:
        return v === s.req ? { p: 6 } : undefined;
    }
  },
  accept: (s) => s.p === 6,
}, shape);

const beamRules = DIRS.flatMap(d => gridCells.flatMap(cell => {
  const straight = stepTo(cell, d);
  const slash = stepTo(cell, SLASH[d]);
  const back = stepTo(cell, BACK[d]);
  return [
    new NFA(residueMachine, 'sum', cell,
      aAt(straight, d), aAt(slash, SLASH[d]), aAt(back, BACK[d]), A[d].at(cell)),
    new NFA(tensMachine, 'tens', cell,
      aAt(straight, d), tAt(straight, d), tAt(slash, SLASH[d]), tAt(back, BACK[d]),
      T[d].at(cell)),
  ];
}));

// The 24 outside clue labels, by side and by the row or column they sit against;
// the value is the units digit printed after the '?'. Rows and columns 4, 5, 6
// carry no label on any side.
const clues = {
  top: { 1: 1, 2: 4, 3: 3, 7: 6, 8: 2, 9: 6 },
  bottom: { 1: 7, 2: 7, 3: 4, 7: 7, 8: 7, 9: 7 },
  left: { 1: 7, 2: 7, 3: 9, 7: 4, 8: 1, 9: 1 },
  right: { 1: 4, 2: 0, 3: 3, 7: 7, 8: 3, 9: 9 },
};
// The cell the beam enters and the direction it travels.
const entryOf = {
  top: c => [makeCellId(1, c), 'S'],
  bottom: c => [makeCellId(9, c), 'N'],
  left: r => [makeCellId(r, 1), 'E'],
  right: r => [makeCellId(r, 9), 'W'],
};
const clueRules = Object.entries(clues).flatMap(([side, labels]) =>
  Object.entries(labels).flatMap(([line, units]) => {
    const [cell, dir] = entryOf[side](+line);
    return [
      new Given(A[dir].at(cell), units + 1),
      // Tens digit 1-9: value (tens + 1), so 2..10.
      new Given(T[dir].at(cell), 2, 3, 4, 5, 6, 7, 8, 9, 10),
    ];
  }));

return [
  shape,
  ...DIRS.flatMap(d => [A[d].toVar('A' + d), T[d].toVar('T' + d)]),
  new Var('Z', 'exit', 2),
  // A beam that has left the grid has no digits left to add: sum 0.
  new Given(A_EXIT, 1),
  new Given(T_EXIT, 1),
  // The widened value range carries the overlays; the grid itself holds only
  // the seven digits and the two mirrors.
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  ...beamRules,
  ...clueRules,
];
