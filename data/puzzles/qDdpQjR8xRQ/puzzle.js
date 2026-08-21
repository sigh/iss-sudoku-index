// Title: Medieval Upheaval 4
// Author: Nordy
// Video: https://www.youtube.com/watch?v=qDdpQjR8xRQ
// Source: https://sudokupad.app/0of52e2mjx

// Rules encoded here, in full:
//  - Chaos Construction: nine orthogonally-connected nine-cell regions; every
//    row, column and region holds 1-9 once each.
//  - Pink lines are renbans: a non-repeating consecutive set in any order.
//  - Chess Sums: a number in a cell's top-left corner says how many of the
//    three chess sums that cell's digit satisfies. The three sums are, over the
//    cells sharing that cell's region, the total of those a king's move away,
//    the total of those a knight's move away, and the total of those a bishop's
//    move away; each is satisfied when it equals the marked cell's own digit.
//    The rules add that other regions do not block a bishop, so a bishop sees
//    its whole diagonals; a blocking reading would stop every ray at the first
//    occupied cell, which on a filled grid is the adjacent diagonal cell and
//    would leave that clarification with nothing to clarify.
// Nothing is omitted.

const graph = cellGraph('9x9');
// Chaos Construction's region-label layer: cc.at(gridCell) is that cell's label.
const cc = graph.makeOverlay('CC');

// Transcribed from the ten black corner texts: cell -> how many sums hold.
const CHESS_SUMS = [
  ['R1C1', 3],
  ['R1C3', 3],
  ['R2C3', 1],
  ['R2C6', 1],
  ['R2C7', 1],
  ['R3C7', 2],
  ['R4C5', 3],
  ['R5C3', 2],
  ['R8C5', 2],
  ['R9C9', 1],
];

// Transcribed from the seven drawn pink line entries.
const RENBANS = [
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R2C4', 'R2C5', 'R3C5'],
  ['R8C7', 'R7C7', 'R7C8', 'R6C8', 'R5C8'],
  ['R5C3', 'R5C2', 'R5C1'],
  ['R4C5', 'R5C5', 'R5C4'],
  ['R4C4', 'R4C3', 'R3C3', 'R3C2', 'R2C2', 'R2C3'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8', 'R3C8'],
];

const KNIGHT_STEPS = [
  [1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1],
];
const DIAGONALS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];

// The three move categories for one clue cell, in a fixed order: king, knight,
// bishop. Bishop rays run to the grid edge (slice(1) drops the clue cell).
const moveCategories = (cell) => [
  graph.kingNeighbours(cell),
  KNIGHT_STEPS.map(([dR, dC]) => graph.step(cell, dR, dC)).filter(c => c),
  DIAGONALS.flatMap(([dR, dC]) => graph.ray(cell, dR, dC).slice(1)),
];

// One flag per (clue cell, move category), value 1 = that sum is not satisfied,
// 2 = it is satisfied. The flags carry the count rule; each NFA below ties one
// flag to its own sum so the count can be applied to the three flags together.
// One row of three flags per clue cell, so a flag is addressed by clue and
// category rather than by a hand-computed index.
const flags = new Var('F', 'Chess Sums category flags', `${CHESS_SUMS.length}x3`);
const flagCell = (clueIndex, category) => flags.cell(clueIndex + 1, category + 1);

// NFA over [flag, clue digit, clue label, label(t1), digit(t1), label(t2), ...]
// for one clue cell and one move category, where t1, t2, ... are that category's
// target cells. `rem` starts at the clue digit and each target sharing the clue
// cell's region label subtracts its digit, so the sum equals the clue digit
// exactly when rem finishes at 0; it saturates at -1 once it passes 0, which it
// can never return from because digits are positive. `sat` is what the flag
// claimed, so the machine accepts a claim of "satisfied" only with rem 0 and a
// claim of "not satisfied" only with rem non-zero.
const chessSumNFA = NFA.encodeSpec({
  startState: { phase: 'flag' },
  transition(state, v) {
    switch (state.phase) {
      case 'flag':
        if (v > 2) return undefined;
        return { phase: 'digit', sat: v === 2 };
      case 'digit':
        return { phase: 'label', sat: state.sat, rem: v };
      case 'label':
        return { phase: 'target', sat: state.sat, rem: state.rem, label: v };
      case 'target':
        return {
          phase: 'targetValue', sat: state.sat, rem: state.rem,
          label: state.label, same: v === state.label,
        };
      case 'targetValue':
        return {
          phase: 'target', sat: state.sat,
          rem: state.same ? Math.max(state.rem - v, -1) : state.rem,
          label: state.label,
        };
    }
  },
  accept: (s) => s.phase === 'target' && (s.sat ? s.rem === 0 : s.rem !== 0),
}, 9);

const chessSumChecks = CHESS_SUMS.flatMap(([cell, count], i) =>
  moveCategories(cell).map((targets, category) => new NFA(
    chessSumNFA, `ChessSum${cell}`,
    flagCell(i, category), cell, cc.at(cell),
    ...targets.flatMap(target => [cc.at(target), target])))
);

// Exactly `count` of the cell's three flags say satisfied (value 2).
const chessSumCounts = CHESS_SUMS.map(([cell, count], i) => new ContainExact(
  [...Array(3 - count).fill(1), ...Array(count).fill(2)].join('_'),
  ...[0, 1, 2].map(category => flagCell(i, category))));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  flags,
  ...flags.cells().map(cell => new Given(cell, 1, 2)),
  ...RENBANS.map(cells => new Renban(...cells)),
  ...chessSumChecks,
  ...chessSumCounts,
];
