// Title: Snake Pit
// Author: Unknown
// Video: https://www.youtube.com/watch?v=mpTEsEAw7hA
// Source: https://cracking-the-cryptic.web.app/sudoku/bHfFdBNTmM

// Rules encoded here (read from a frame of the video's on-screen rules
// panel -- the payload itself carries no rules text at all):
//   Divide the grid into some one-cell-wide "snakes" so that each given
//   number represents the size of the snake that contains it. Each snake
//   consists of at least 2 cells and must not touch itself (even
//   diagonally). Each snake may contain any number of given numbers
//   (including zero). Two snakes of the same length cannot share an edge.
//
// Reading notes:
//  * "Divide the grid" is a full partition: every cell belongs to exactly
//    one snake -- there is no leftover/ungrouped cell class anywhere in the
//    rules or the payload.
//  * A "snake" is read as an open path (a head and a tail, the ordinary
//    meaning of the word, and how CTC's other Snake constraints always give
//    a snake a "tail"): one-cell-wide and connected means every cell has at
//    most 2 same-snake orthogonal neighbours. A closed loop is excluded --
//    not by a separate clause, but because this encoding's rooted-tree
//    construction below cannot represent one (a spanning tree has no cycle).
//  * "Must not touch itself, even diagonally" forbids a same-snake diagonal
//    adjacency between two cells that are not consecutive along the path --
//    except the one diagonal pair created at every 90-degree bend (the
//    bend's own predecessor and successor cells), which is geometrically
//    unavoidable for any turning path and so is not a self-touch. Without
//    this exemption no snake could ever turn.
//  * "Share an edge" is read as orthogonal adjacency only, the vocabulary
//    the rest of the rules already use (a snake is itself built from
//    edge-sharing cells): two equal-length snakes may still meet at a
//    shared corner, and two unequal-length snakes may share a full edge.
//
// Omitted: snake sizes above MAX_AREA (9) are not modelled. ISS hard-caps
// any one Shape's value alphabet at 16 (CellGeometry.MAX_SIZE), and this
// construction's size/depth/subtree-count overlays all have to share one
// alphabet with a 0 sentinel -- and MAX_AREA is additionally capped here,
// well inside that limit, at 9 (matching the printed-digit range every
// given on this puzzle actually uses) to keep the search tractable. The
// rules place no upper bound on an unclued snake's size, and a hand-built
// example shows the true bound is well past either cap: row 1 in full (9
// cells), a single connector cell down to row 3, row 3 in full the other
// way, and so on down through rows 5, 7 and 9, is one legal 49-cell snake
// that never touches itself. Blocker #1618 hits the identical MAX_SIZE cap
// on another size-per-cell puzzle (Poker Fillomino, W6v-8Y6_Kkk). Every one
// of this puzzle's 40 given numbers is a single printed digit (2-9), so
// every *clued* snake is fully modelled regardless of either cap -- only an
// unclued snake could exceed 9 cells and go unconstrained by this encoding.

const MAX_AREA = 9;
const EMPTY = 0;
const SIZES = Array.from({ length: MAX_AREA - 1 }, (_, i) => i + 2); // 2..9

// Raw: no Sudoku layer at all (the rules never mention rows/columns/boxes,
// and the given numbers already repeat within rows and columns). Widened to
// 0-9 so the internal size/depth/subtree overlays below can share one
// alphabet with the printed digits.
const shape = new Shape('9x9', '0-9', 'Raw');
const graph = cellGraph(shape);
const cells = graph.cells();

// Transcribed from the payload's 40 given cells.
const GIVENS = [
  [1, 2, 7], [1, 3, 7], [1, 4, 4], [1, 5, 4], [1, 6, 3], [1, 7, 6], [1, 8, 6],
  [2, 1, 7], [2, 9, 4],
  [3, 1, 4], [3, 4, 7], [3, 5, 4], [3, 6, 3], [3, 9, 2],
  [4, 1, 4], [4, 3, 3], [4, 7, 6], [4, 9, 2],
  [5, 1, 6], [5, 3, 2], [5, 7, 4], [5, 9, 4],
  [6, 1, 2], [6, 3, 2], [6, 7, 2], [6, 9, 4],
  [7, 1, 2], [7, 4, 6], [7, 5, 7], [7, 6, 2], [7, 9, 3],
  [8, 1, 7], [8, 9, 6],
  [9, 2, 2], [9, 3, 2], [9, 4, 3], [9, 5, 3], [9, 6, 3], [9, 7, 6], [9, 8, 6],
];
const givenAt = new Map(GIVENS.map(([r, c, v]) => [makeCellId(r, c), v]));

// The main grid carries only the printed digits and nothing else: every
// cell's printed/blank status is a payload fact, not a solver choice, so
// every one of the 81 cells is pinned outright.
const boardGivens = cells.map(
  cell => new Given(cell, givenAt.get(cell) ?? EMPTY));

// ---------------------------------------------------------- snake shape ---

// One size per cell: the snake containing a cell is the orthogonally
// connected run of equal sizes containing it (see the rooted-tree
// construction just below), so "a piece's own value is its cell count" plus
// "equal sizes merge into one piece" together say exactly that such a run
// has as many cells as its own value, and that two differently-rooted
// equal-size runs can never end up orthogonally adjacent.
const size = graph.makeOverlay('VZ');
const sizeVar = size.toVar('snake size');
const sizeDomain = size.makeReplicate(new Given(size.cells()[0], ...SIZES));
const sizeGivens = GIVENS.map(
  ([r, c, v]) => new Given(sizeVar.cell(r, c), v));

// Each piece is modelled as a rooted tree over its own cells (the same
// construction a Fillomino-style size-per-cell puzzle needs). Five
// bookkeeping overlays carry it:
//   parent  - ROOT, or the direction of the cell one step nearer the root;
//   subtree - how many cells hang below this one, itself included;
//   rootRow
//   rootCol - which cell is the root of this cell's piece;
//   depth   - steps from the root, counting the root as 1.
// A root's subtree is its whole piece and equals the size written there; a
// non-root hangs off a same-size neighbour; two same-size neighbours must
// name the same root (so two differently-rooted equal-size pieces can never
// be orthogonally adjacent -- the puzzle's own "two snakes of the same
// length cannot share an edge"); and depth strictly decreases towards a
// root, so the pointers cannot cycle -- which also rules out a snake
// closing into a loop, with no separate clause needed.
const ROOT = 1;
const DIRS = [
  // `back` is the pointer value a neighbour in this direction uses to point
  // back at the cell we started from.
  { code: 2, back: 3, dRow: -1, dCol: 0 },
  { code: 3, back: 2, dRow: 1, dCol: 0 },
  { code: 4, back: 5, dRow: 0, dCol: -1 },
  { code: 5, back: 4, dRow: 0, dCol: 1 },
];
const parent = graph.makeOverlay('VP');
const subtree = graph.makeOverlay('VS');
const rootRow = graph.makeOverlay('VR');
const rootCol = graph.makeOverlay('VC');
const depth = graph.makeOverlay('VD');

const neighboursOf = cell => DIRS
  .map(dir => ({ dir, other: graph.step(cell, dir.dRow, dir.dCol) }))
  .filter(entry => entry.other);

// Reads [subtree(cell), then parent(n), subtree(n) for each neighbour n in a
// fixed order]. `expected[i]` is the pointer value that makes neighbour i a
// child of this cell. The state carries only how much of the cell's own
// subtree count is still unaccounted for, so it never climbs past
// MAX_AREA - 1.
const subtreeSpecs = new Map();
const subtreeSpec = expected => {
  const key = expected.join('_');
  if (!subtreeSpecs.has(key)) {
    subtreeSpecs.set(key, NFA.encodeSpec({
      startState: { i: -1, rem: null, child: null },
      transition: (state, value) => {
        if (state.i === -1) return { i: 0, rem: value - 1, child: null };
        if (state.i >= expected.length) return undefined;
        if (state.child === null) {
          return { i: state.i, rem: state.rem, child: value === expected[state.i] };
        }
        const rem = state.child ? state.rem - value : state.rem;
        return rem < 0 ? undefined : { i: state.i + 1, rem, child: null };
      },
      accept: state => state.i === expected.length && state.rem === 0,
    }, shape));
  }
  return subtreeSpecs.get(key);
};

const subtreeSums = cells.map(cell => {
  const neighbours = neighboursOf(cell);
  return new NFA(
    subtreeSpec(neighbours.map(entry => entry.dir.back)),
    'subtree size',
    subtree.at(cell),
    ...neighbours.flatMap(
      ({ other }) => [parent.at(other), subtree.at(other)]));
});

// Reads [size(a), size(b), label(a), label(b)] for one orthogonal edge:
// neighbours of the same size are in the same piece and so must name the
// same root. Used once for the root's row and once for its column.
const rootEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) return { phase: 3, same: state.same, label: value };
    if (state.phase === 3) {
      return (!state.same || value === state.label) ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

// Reads [size(a), size(b), depth(a), depth(b)]: within a piece no step may
// change the distance to the root by more than one, which is what makes
// `depth` the true distance rather than any descending chain.
const depthEdgeSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) return { phase: 3, same: state.same, depth: value };
    if (state.phase === 3) {
      return (!state.same || Math.abs(value - state.depth) <= 1)
        ? { phase: 4 } : undefined;
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

const edges = cells.flatMap(cell => DIRS
  .filter(dir => dir.dRow > 0 || dir.dCol > 0)   // each edge once
  .flatMap(dir => {
    const other = graph.step(cell, dir.dRow, dir.dCol);
    return other ? [{ cell, other }] : [];
  }));

const pieceEdges = edges.flatMap(({ cell, other }) => [
  new NFA(rootEdgeSpec, 'same piece root row',
    size.at(cell), size.at(other), rootRow.at(cell), rootRow.at(other)),
  new NFA(rootEdgeSpec, 'same piece root column',
    size.at(cell), size.at(other), rootCol.at(cell), rootCol.at(other)),
  new NFA(depthEdgeSpec, 'depth changes by one',
    size.at(cell), size.at(other), depth.at(cell), depth.at(other)),
]);

// Reads [size(cell), size(other), depth(cell), depth(other)] and rejects
// the case where `other` could have served as the parent. Placed on the
// earlier directions of each branch, it makes the parent the first
// eligible neighbour in DIRS order, so the tree is fixed by the piece
// rather than chosen.
const notParentSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    if (state.phase === 0) return { phase: 1, mine: value };
    if (state.phase === 1) return { phase: 2, same: value === state.mine };
    if (state.phase === 2) return { phase: 3, same: state.same, depth: value };
    if (state.phase === 3) {
      return (state.same && value === state.depth - 1) ? undefined : { phase: 4 };
    }
    return undefined;
  },
  accept: state => state.phase === 4,
}, shape);

const depthStep = Pair.fnToKey((mine, other) => other === mine - 1, shape);

const parentChoice = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const neighbours = neighboursOf(cell);
  return new Or([
    new And([
      new Given(parent.at(cell), ROOT),
      new Given(depth.at(cell), 1),
      new Given(rootRow.at(cell), row),
      new Given(rootCol.at(cell), col),
      new SameValues(2, subtree.at(cell), size.at(cell)),
    ]),
    ...neighbours.map(({ dir, other }, k) => new And([
      new Given(parent.at(cell), dir.code),
      new SameValues(2, size.at(cell), size.at(other)),
      new SameValues(2, rootRow.at(cell), rootRow.at(other)),
      new SameValues(2, rootCol.at(cell), rootCol.at(other)),
      new Pair(depthStep, 'one step nearer the root',
        depth.at(cell), depth.at(other)),
      ...neighbours.slice(0, k).map(earlier => new NFA(
        notParentSpec, 'earlier neighbour is not a parent',
        size.at(cell), size.at(earlier.other),
        depth.at(cell), depth.at(earlier.other))),
    ])),
  ]);
});

// Which cell of a piece carries the root is this model's choice, not the
// puzzle's, so it is pinned to the piece's first cell in reading order: a
// cell's root never comes after the cell itself.
const rootOrderKeys = new Map();
const rootOrderKey = (row, col) => {
  const key = row + '_' + col;
  if (!rootOrderKeys.has(key)) {
    rootOrderKeys.set(key, Pair.fnToKey(
      (r, c) => r < row || (r === row && c <= col), shape));
  }
  return rootOrderKeys.get(key);
};

const onBoard = Array.from({ length: 9 }, (_, i) => i + 1);
const rootDomains = [
  rootRow.makeReplicate(new Given(rootRow.cells()[0], ...onBoard)),
  rootCol.makeReplicate(new Given(rootCol.cells()[0], ...onBoard)),
  ...cells.map(cell => {
    const { row, col } = parseCellId(cell);
    return new Pair(rootOrderKey(row, col), 'root comes first in reading order',
      rootRow.at(cell), rootCol.at(cell));
  }),
];

// No piece holds more than MAX_AREA cells, so neither a subtree count nor a
// depth can exceed it.
const counterValues = Array.from({ length: MAX_AREA }, (_, i) => i + 1);
const counterDomains = [
  subtree.makeReplicate(new Given(subtree.cells()[0], ...counterValues)),
  depth.makeReplicate(new Given(depth.cells()[0], ...counterValues)),
];

// -------------------------------------------------- path shape (degree) ---

// A same-size orthogonal neighbour is always the same piece (rootEdgeSpec
// above forces the merge), so counting same-size orthogonal neighbours is
// exactly counting same-snake orthogonal neighbours. Capping it at 2 is
// "one-cell-wide, no branching": a connected, max-degree-2 shape is a
// simple path (a cycle is separately excluded by the rooted-tree
// construction above, which has no representation for one).
const degreeSpec = NFA.encodeSpec({
  startState: { phase: 'own' },
  transition: (state, value) => {
    if (state.phase === 'own') return { phase: 'count', own: value, count: 0 };
    const count = state.count + (value === state.own ? 1 : 0);
    return count > 2 ? undefined : { phase: 'count', own: state.own, count };
  },
  accept: () => true,
}, shape);
const degrees = cells.map(cell => new NFA(degreeSpec, 'snake path degree',
  ...size.at([cell, ...graph.neighbours(cell)])));

// ------------------------------------------- no self-touch, except bends ---

// For a diagonal pair (A, B): if they are the same piece (same root), that
// piece can only reach both A and B through one of the two cells (K1, K2)
// orthogonally adjacent to both -- and only if that cell is genuinely a
// bend joining them (same size as both A and B, hence same piece as both,
// by the same-size-merges rule above). That is exactly the one diagonal
// pair every 90-degree turn creates; any other same-piece diagonal pair is
// a real self-touch and is rejected. Different pieces are never restricted
// here (only a *self*-touch is read), matching "share an edge" being
// orthogonal-only in the rules.
//
// Reads, in order: size(A), size(B), size(K1), size(K2), rootRow(A),
// rootCol(A), rootRow(B), rootCol(B). The state keeps only what later
// phases still need (e.g. size(A)/size(B) are dropped once both turn
// checks are done), so it never grows past a few hundred reachable states.
const selfTouchSpec = NFA.encodeSpec({
  startState: { phase: 0 },
  transition: (state, value) => {
    switch (state.phase) {
      case 0: return { phase: 1, sA: value };
      case 1: return { phase: 2, sA: state.sA, sB: value };
      case 2: return {
        phase: 3, sA: state.sA, sB: state.sB,
        turn1: value === state.sA && value === state.sB,
      };
      case 3: {
        const turn2 = value === state.sA && value === state.sB;
        return { phase: 4, turnEither: state.turn1 || turn2 };
      }
      case 4: return { phase: 5, turnEither: state.turnEither, rrA: value };
      case 5: return {
        phase: 6, turnEither: state.turnEither, rrA: state.rrA, rcA: value,
      };
      case 6: return {
        phase: 7, turnEither: state.turnEither, rcA: state.rcA,
        rowSame: value === state.rrA,
      };
      case 7: {
        const samePiece = state.rowSame && state.rcA === value;
        return { phase: 8, ok: !samePiece || state.turnEither };
      }
      default: return undefined;
    }
  },
  accept: state => state.phase === 8 && state.ok,
}, shape);

// Each 2x2 block contributes its two diagonals; walking only the
// down-right and down-left offsets from every cell covers each diagonal
// pair exactly once, and both corner cells (K1, K2) always exist whenever
// the diagonal pair itself does (the 2x2 block is then fully on-grid).
const DIAGS = [[1, 1], [1, -1]];
const selfTouch = cells.flatMap(cell => DIAGS.flatMap(([dR, dC]) => {
  const other = graph.step(cell, dR, dC);
  if (!other) return [];
  const k1 = graph.step(cell, dR, 0);
  const k2 = graph.step(cell, 0, dC);
  return [new NFA(selfTouchSpec, 'snake self-touch (diagonal, turn-exempt)',
    size.at(cell), size.at(other), size.at(k1), size.at(k2),
    rootRow.at(cell), rootCol.at(cell), rootRow.at(other), rootCol.at(other))];
}));

return [
  shape,
  sizeVar,
  parent.toVar('parent pointer'),
  subtree.toVar('subtree size'),
  rootRow.toVar('root row'),
  rootCol.toVar('root column'),
  depth.toVar('depth from root'),
  ...boardGivens,
  sizeDomain,
  ...sizeGivens,
  ...counterDomains,
  ...rootDomains,
  ...parentChoice,
  ...subtreeSums,
  ...pieceEdges,
  ...degrees,
  ...selfTouch,
];
