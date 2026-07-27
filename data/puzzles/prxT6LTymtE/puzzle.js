// Title: Build Your Own Hitlines
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=prxT6LTymtE
// Source: https://sudokupad.app/u10p16g8n5

// Normal sudoku. From each of the 18 marked squares a "hitline" is drawn
// through cell centres: at least two cells, king-steps (orthogonal or
// diagonal), no branching, no shared cells between or within a line, and no
// two line segments crossing. Digits may not repeat on a hitline. A square's
// clue is the sum of the digits on its hitline that equal their position
// number, the square itself being position 1.
//
// The line layout is solver-discovered, so it is carried in eight Var
// overlays over the grid:
//   VT  successor direction of this cell's line (0 = none), codes below
//   VP  position on its hitline (0 = the cell is on no hitline)
//   VM  the cell's clue contribution: its digit when digit == VP, else 0
//   VA/VB  quota = 8*VA + VB, the clue total still owed from this cell on
//          (split over two Vars because the grid allows at most 16 values
//          and the quota reaches 45)
//   VD/VE/VF  bitmask of the digits already used on the line at this cell,
//             for digits 1-4, 5-8 and 9 respectively
// The value range is widened to 0-15 to hold that state; grid cells are
// restricted back to 1-9.

// Clue squares: the 18 tan cell-sized squares, keyed to the small white
// number drawn in each one's lower-left corner.
const CLUES = {
  R1C1: 41, R1C2: 3, R1C3: 2,
  R2C6: 1, R2C9: 2,
  R4C2: 8, R4C9: 0,
  R5C6: 2, R5C9: 4,
  R6C1: 4, R6C4: 3, R6C5: 2,
  R8C4: 3,
  R9C1: 42, R9C2: 5, R9C3: 9, R9C4: 4, R9C9: 12,
};

// Successor direction codes. 0 means "no successor"; 1-8 are the king steps,
// arranged so that OPP(d) = 9 - d is the reverse step.
const STEPS = [null, [-1, -1], [-1, 0], [-1, 1], [0, -1],
  [0, 1], [1, -1], [1, 0], [1, 1]];
const OPP = (d) => 9 - d;
const DIRS = [1, 2, 3, 4, 5, 6, 7, 8];

const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

const shape = new Shape('9x9', '0-15');
const graph = cellGraph(shape);
const cells = graph.cells();
const squares = Object.keys(CLUES);
const nonSquares = cells.filter((cell) => !(cell in CLUES));

const T = graph.makeOverlay('VT');
const P = graph.makeOverlay('VP');
const M = graph.makeOverlay('VM');
const A = graph.makeOverlay('VA');
const B = graph.makeOverlay('VB');
const D = graph.makeOverlay('VD');
const E = graph.makeOverlay('VE');
const F = graph.makeOverlay('VF');

// Every directed king step that stays on the grid, as [from, code, to].
const edges = cells.flatMap(
  (cell) => DIRS.map((d) => [cell, d, graph.step(cell, ...STEPS[d])])
    .filter(([, , to]) => to !== null));
const stepsFrom = new Map(cells.map((cell) => [cell, []]));
for (const [from, d] of edges) stepsFrom.get(from).push(d);

// Bit of the seen-mask that digit v occupies, per mask layer.
const maskBit = (v, layer) => (
  layer === 0 ? (v <= 4 ? 1 << (v - 1) : 0)
    : layer === 1 ? (v >= 5 && v <= 8 ? 1 << (v - 5) : 0)
      : (v === 9 ? 1 : 0));

// VM = digit when the digit equals the position, else 0. Read as
// [digit, VP, VM]: the state carries the digit, then the required VM.
const matchSpec = NFA.encodeSpec({
  startState: 'digit',
  transition: (s, v) => {
    if (s === 'digit') return { want: null, digit: v };
    if (s.want === null) return { want: v === s.digit ? s.digit : 0 };
    return v === s.want ? 'ok' : [];
  },
  accept: (s) => s === 'ok',
  maxDepth: 3,
}, shape);

// A square's seen-mask starts as just its own digit. Read as
// [digit, VD, VE, VF].
const seedSpec = NFA.encodeSpec({
  startState: 'digit',
  transition: (s, v) => {
    if (s === 'digit') return { digit: v, layer: 0 };
    if (v !== maskBit(s.digit, s.layer)) return [];
    return s.layer === 2 ? 'ok' : { digit: s.digit, layer: s.layer + 1 };
  },
  accept: (s) => s === 'ok',
  maxDepth: 4,
}, shape);

// One spec per direction code: when VT of the first cell is that code, the
// step's own cell and the cell stepped into must agree. Read as
// [VT, digit of the next cell, VP, VP', VD, VD', VE, VE', VF, VF'];
// a VT that is not this code puts the machine in a state that accepts
// anything, so the spec only bites on the step actually drawn.
const stepSpec = (d) => NFA.encodeSpec({
  startState: 'start',
  transition: (s, v) => {
    if (s === 'skip') return 'skip';
    if (s === 'start') return v === d ? { k: 1 } : 'skip';
    // The next cell's digit, then this cell's position: a cell with a
    // successor is on a line and its successor sits one position later.
    if (s.k === 1) return (v >= 1 && v <= 9) ? { k: 2, digit: v } : [];
    if (s.k === 2) return (v >= 1 && v <= 8) ? { k: 3, digit: s.digit, want: v + 1 } : [];
    if (s.k === 3) return v === s.want ? { k: 4, digit: s.digit, layer: 0 } : [];
    // Three mask layers: the digit must be unseen here, and set there.
    if (s.k === 4) {
      const bit = maskBit(s.digit, s.layer);
      return (v & bit) ? [] : { k: 5, digit: s.digit, layer: s.layer, want: v | bit };
    }
    if (s.k === 5) {
      if (v !== s.want) return [];
      return s.layer === 2 ? 'ok' : { k: 4, digit: s.digit, layer: s.layer + 1 };
    }
    return [];
  },
  accept: (s) => s === 'ok' || s === 'skip',
  maxDepth: 10,
}, shape);
const stepSpecs = new Map(DIRS.map((d) => [d, stepSpec(d)]));

// Exactly one cell steps into a cell that is at position 2 or later, and none
// steps into a position-1 square or an unused cell. Read as
// [VP, VT of each in-grid king neighbour in a fixed order]; `codes[i]` is the
// VT value that would make neighbour i step into this cell.
const predSpec = (codes) => NFA.encodeSpec({
  startState: 'pos',
  transition: (s, v) => {
    if (s === 'pos') return { i: 0, count: 0, need: v >= 2 ? 1 : 0 };
    const count = s.count + (v === codes[s.i] ? 1 : 0);
    return count > s.need ? [] : { i: s.i + 1, count, need: s.need };
  },
  accept: (s) => s !== 'pos' && s.count === s.need,
  maxDepth: codes.length + 1,
}, shape);
const predSpecs = new Map();
const predSpecFor = (codes) => {
  const key = codes.join(',');
  if (!predSpecs.has(key)) predSpecs.set(key, predSpec(codes));
  return predSpecs.get(key);
};

const notZero = Pair.fnToKey((a, b) => !(a === 0 && b !== 0), shape);

return [
  shape,
  T.toVar('succ'), P.toVar('pos'), M.toVar('match'),
  A.toVar('quotaHi'), B.toVar('quotaLo'),
  D.toVar('seen1-4'), E.toVar('seen5-8'), F.toVar('seen9'),

  // Domains. Positions run 0-9 and the quota 8*VA + VB reaches 45, because a
  // hitline's digits are distinct and drawn from 1-9, so it is at most nine
  // cells long and its clue is at most 1+2+...+9. VT is restricted to the
  // steps that stay on the grid; VP is 1 on a square and 0 or 2-9 elsewhere,
  // so position 1 marks exactly the squares.
  graph.makeReplicate(new Given(cells[0], ...range(1, 9))),
  ...cells.map((cell) => new Given(T.at(cell), 0, ...stepsFrom.get(cell))),
  M.makeReplicate(new Given(M.at(cells[0]), ...range(0, 9))),
  A.makeReplicate(new Given(A.at(cells[0]), ...range(0, 5))),
  B.makeReplicate(new Given(B.at(cells[0]), ...range(0, 7))),
  F.makeReplicate(new Given(F.at(cells[0]), 0, 1)),
  P.makeReplicate(
    new Given(P.at(cells[0]), 0, ...range(2, 9)), P.at(nonSquares)),

  // Each square: position 1, at least one more cell, and a quota equal to its
  // clue, held as 8*VA + VB.
  ...squares.map((cell) => new Given(P.at(cell), 1)),
  ...squares.map((cell) => new Given(T.at(cell), ...DIRS)),
  ...squares.map((cell) => new Given(A.at(cell), CLUES[cell] >> 3)),
  ...squares.map((cell) => new Given(B.at(cell), CLUES[cell] & 7)),
  ...squares.map((cell) => new NFA(
    seedSpec, 'mask seed', [cell, D.at(cell), E.at(cell), F.at(cell)])),

  ...cells.map((cell) => new NFA(
    matchSpec, 'match', [cell, P.at(cell), M.at(cell)])),

  // A cell on no hitline carries no line state at all.
  ...cells.map((cell) => new Pair(notZero, 'unused: no successor',
    P.at(cell), T.at(cell))),
  ...cells.flatMap((cell) => [D, E, F].map((layer) => new Pair(
    notZero, 'unused: empty mask', P.at(cell), layer.at(cell)))),

  // The last cell of a line owes only its own contribution.
  ...cells.map((cell) => new Or([
    new And([
      new Given(T.at(cell), 0),
      new Sum(0, [A.at(cell), 8], [B.at(cell), 1], [M.at(cell), -1]),
    ]),
    new Given(T.at(cell), ...stepsFrom.get(cell)),
  ])),

  // Along a drawn step: positions, digit repeats and masks.
  ...edges.map(([from, d, to]) => new NFA(
    stepSpecs.get(d), `step ${d}`,
    [T.at(from), to, P.at(from), P.at(to),
      D.at(from), D.at(to), E.at(from), E.at(to), F.at(from), F.at(to)])),

  // ... and the quota handed on to the next cell.
  ...edges.map(([from, d, to]) => new Or([
    new And([
      new Given(T.at(from), d),
      new Sum(0, [A.at(from), 8], [B.at(from), 1],
        [A.at(to), -8], [B.at(to), -1], [M.at(from), -1]),
    ]),
    new Given(T.at(from), 0, ...stepsFrom.get(from).filter((e) => e !== d)),
  ])),

  // No branching and no shared cells: a cell is stepped into exactly once when
  // it is at position 2 or later, and never otherwise.
  ...cells.map((cell) => {
    const present = DIRS.filter((d) => graph.step(cell, ...STEPS[d]) !== null);
    return new NFA(
      predSpecFor(present.map(OPP)), 'one predecessor',
      [P.at(cell), ...present.map((d) => T.at(graph.step(cell, ...STEPS[d])))]);
  }),

  // No crossing: within a 2x2 block the two diagonals cannot both be drawn.
  // A diagonal is drawn if either of its cells steps to the other.
  ...cells.flatMap((cell) => {
    const { row, col } = parseCellId(cell);
    if (row === 9 || col === 9) return [];
    const [a, b, c, e] = [cell, makeCellId(row, col + 1),
      makeCellId(row + 1, col), makeCellId(row + 1, col + 1)];
    const without = (target, d) => new Given(
      T.at(target), 0, ...stepsFrom.get(target).filter((x) => x !== d));
    return [new Or([
      new And([without(a, 8), without(e, 1)]),
      new And([without(b, 6), without(c, 3)]),
    ])];
  }),
];
