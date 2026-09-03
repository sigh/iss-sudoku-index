// Title: Ring Loop
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=NEV4wzKSKu8
// Source: https://sudokupad.app/ilf81086nm

// Rules encoded below:
//  * Normal sudoku.
//  * Draw a one-cell-wide loop of orthogonally connected cells. It MAY touch
//    itself orthogonally or diagonally, and must visit each box at least once.
//  * Two different loop cells are partners when the loop reaches each from the
//    other in the same number of steps in both directions. Every partner pair
//    has a different absolute difference of digits.
//  * The digits printed in a circle each appear at least once in the four cells
//    surrounding that circle.
// The grey ring drawn around the board is a note-taking area, not a rule; the
// board itself is the inner 9x9.
//
// "One-cell-wide" is read as "the loop is a line of single cells that never
// branches or overlaps", not as a ban on 2x2 blocks of loop cells: the same
// sentence explicitly allows the loop to touch itself ORTHOGONALLY, which is
// what a 2x2 hairpin is.

// --- Loop model ------------------------------------------------------------
// Each cell carries the direction of the loop step that leaves it (VL), and the
// position it holds along the loop counted modulo half the loop length (VP).
const OFF = 1;                              // VL: this cell is not on the loop
const E = 2, S = 3, W = 4, N = 5;           // VL: direction of the outgoing step
const STEPS = [[E, 0, 1], [S, 1, 0], [W, 0, -1], [N, -1, 0]];
const OPPOSITE = { [E]: W, [S]: N, [W]: E, [N]: S };

// The loop has exactly 18 cells, so partners are the two cells sharing a
// position residue modulo 9. Derivation, from the rules alone:
//   * A cycle in a grid graph alternates cell colours, so its length L is even
//     and it has L/2 partner pairs.
//   * The L/2 differences are distinct values in 0..8, so L <= 18.
//   * The loop meets box 1 and box 9; the closest such cells are R3C3 and R7C7,
//     8 apart, and a cycle through two cells is at least twice their distance,
//     so L >= 16.
//   * L = 16 forces every loop cell into rows 3-7 and columns 3-7 with R3C3,
//     R7C7, R3C7 and R7C3 all on it, which leaves only the perimeter of that
//     5x5 block -- and that misses box 5. So L = 18.
const HALF = 9;                             // L / 2; also the VP modulus
const NO_POS = 10;                          // VP: this cell is not on the loop

const shape = new Shape('9x9', 10);         // widened for the VP sentinel
const graph = cellGraph(shape);
const gridCells = graph.cells();
const loop = graph.makeOverlay('VL');
const pos = graph.makeOverlay('VP');
const difference = new Var('F', 'partner difference', HALF);

const memo = (fn) => { const m = new Map(); return k => (m.has(k) ? m : m.set(k, fn(k))).get(k); };
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

// The widened alphabet exists only for VP's sentinel: board digits and the
// difference variables stay 1-9.
const domains = [
  graph.makeReplicate(new Given(gridCells[0], ...DIGITS)),
  ...difference.cells().map(cell => new Given(cell, ...DIGITS)),
  // A cell may only step to a neighbour that exists.
  ...gridCells.map(cell => new Given(loop.at(cell), OFF,
    ...STEPS.filter(([, dR, dC]) => graph.step(cell, dR, dC)).map(([dir]) => dir))),
];

// A cell has a loop position exactly when it is on the loop.
const onLoopKey = Pair.fnToKey((dir, p) => (dir === OFF) === (p === NO_POS), shape);
const onLoop = gridCells.map(cell =>
  new Pair(onLoopKey, 'on-loop', loop.at(cell), pos.at(cell)));

// In-degree: a loop cell is entered exactly once, an off-loop cell never.
// Reads [VL(cell), VL(neighbour)...]; `incoming[i]` is the direction value that
// means neighbour i steps into this cell.
const inDegreeSpec = memo(key => {
  const incoming = key.split(',').map(Number);
  return NFA.encodeSpec({
    startState: { phase: 'self' },
    transition: (state, value) => {
      if (state.phase === 'self') return { i: 0, count: 0, on: value !== OFF };
      const count = state.count + (value === incoming[state.i] ? 1 : 0);
      return count > 1 ? undefined : { i: state.i + 1, count, on: state.on };
    },
    accept: ({ count, on }) => count === (on ? 1 : 0),
    maxDepth: incoming.length + 1,
  }, shape);
});
const inDegrees = gridCells.map(cell => {
  const sources = STEPS
    .map(([dir, dR, dC]) => ({ cell: graph.step(cell, dR, dC), enters: OPPOSITE[dir] }))
    .filter(source => source.cell);
  return new NFA(inDegreeSpec(sources.map(source => source.enters).join(',')), 'in-degree',
    loop.at(cell), ...loop.at(sources.map(source => source.cell)));
});

// Positions advance by one (mod HALF) along each step. Reads
// [VL(cell), VP(cell), VP(neighbour)...] with the neighbours in `dirs` order, so
// the outgoing direction names which neighbour's position is checked.
const advanceSpec = memo(key => {
  const dirs = key.split(',').map(Number);
  return NFA.encodeSpec({
    startState: { phase: 'dir' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'dir': {
          if (value === OFF) return { phase: 'done' };
          const i = dirs.indexOf(value);
          return i < 0 ? undefined : { phase: 'pos', i };
        }
        case 'pos':
          if (value === NO_POS) return undefined;
          return { phase: 'scan', i: state.i, want: value % HALF + 1 };
        case 'scan':
          if (state.i > 0) return { phase: 'scan', i: state.i - 1, want: state.want };
          return value === state.want ? { phase: 'done' } : undefined;
        case 'done':
          return { phase: 'done' };
      }
    },
    accept: ({ phase }) => phase === 'done',
  }, shape);
});
const advances = gridCells.map(cell => {
  const targets = STEPS
    .map(([dir, dR, dC]) => ({ dir, cell: graph.step(cell, dR, dC) }))
    .filter(target => target.cell);
  return new NFA(advanceSpec(targets.map(target => target.dir).join(',')), 'advance',
    loop.at(cell), pos.at(cell), ...pos.at(targets.map(target => target.cell)));
});

// Every box holds at least one loop cell.
const visitsSpec = NFA.encodeSpec({
  startState: { any: false },
  transition: ({ any }, value) => ({ any: any || value !== OFF }),
  accept: ({ any }) => any,
}, shape);
const boxVisits = graph.boxes().map(box =>
  new NFA(visitsSpec, 'box-visit', ...loop.at(box)));

// Partners. With 18 loop cells numbered modulo 9, each residue is held by
// exactly two cells and they are 9 steps apart in both directions, so they are
// exactly one partner pair. One machine per residue scans the whole board as
// [VF(residue), VP(cell), digit(cell), ...], finds the two cells holding that
// residue and checks their difference against the residue's VF variable, which
// stores the difference plus one.
const partnersSpec = memo(residue => NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    const { target, seen, first } = state;
    switch (state.phase) {
      case 'target':
        if (value === NO_POS) return undefined;
        return { phase: 'pos', target: value - 1, seen: 0, first: null };
      case 'pos':
        return { phase: value === residue ? 'partner' : 'other', target, seen, first };
      case 'other':
        return { phase: 'pos', target, seen, first };
      case 'partner':
        if (seen === 0) return { phase: 'pos', target, seen: 1, first: value };
        if (seen === 1) {
          return Math.abs(first - value) === target
            ? { phase: 'pos', target, seen: 2, first: null } : undefined;
        }
        return undefined;    // a third cell may not hold this residue
    }
  },
  accept: ({ phase, seen }) => phase === 'pos' && seen === 2,
}, shape));
const partners = difference.cells().map((varCell, i) =>
  new NFA(partnersSpec(i + 1), 'partners',
    varCell, ...gridCells.flatMap(cell => [pos.at(cell), cell])));

// Nothing in the rules picks a start cell or a travel direction for the
// numbering, so pin one representative: the first loop cell in reading order
// gets position 1 and steps east. Its northern and western neighbours come
// earlier in reading order and so are off the loop, which leaves its eastern and
// southern neighbours as its two loop connections -- east is always available.
const seamSpec = NFA.encodeSpec({
  startState: { phase: 'dir' },
  transition: ({ phase }, value) => {
    switch (phase) {
      case 'dir': return value === OFF ? { phase: 'pos' } : (value === E ? { phase: 'seam' } : undefined);
      case 'pos': return { phase: 'dir' };
      case 'seam': return value === 1 ? { phase: 'done' } : undefined;
      case 'done': return { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, shape);
const seam = new NFA(seamSpec, 'seam',
  ...gridCells.flatMap(cell => [loop.at(cell), pos.at(cell)]));

// --- Circles ---------------------------------------------------------------
// Keyed by the top-left cell of the 2x2 the circle sits on; values are the
// digits printed inside it.
const circles = [
  ['R1C1', 3, 4, 5, 6],
  ['R1C8', 1, 2, 4, 8],
  ['R2C4', 1, 3],
  ['R4C4', 2, 4, 7, 9],
  ['R6C2', 5, 8],
  ['R6C7', 5, 7],
  ['R7C5', 8, 9],
  ['R8C1', 2, 3, 4, 7],
  ['R8C8', 4, 6, 7, 8],
];

return [
  shape,
  loop.toVar('loop step'),
  pos.toVar('loop position'),
  difference,
  ...domains,
  ...onLoop,
  ...inDegrees,
  ...advances,
  // The loop cells are one orthogonally connected region of 18 cells.
  new ConnectedValues('VL', [E, S, W, N], 2 * HALF),
  ...boxVisits,
  ...partners,
  new AllDifferent(...difference.cells()),
  seam,
  ...circles.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
];
