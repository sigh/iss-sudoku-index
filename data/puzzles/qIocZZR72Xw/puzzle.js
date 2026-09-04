// Title: Ein echtes Schachsudoku
// Author: Christian Konig (CJK)
// Video: https://www.youtube.com/watch?v=qIocZZR72Xw
// Source: https://app.crackingthecryptic.com/sudoku/jMQR24JRBN

// Rules: an 8x8 sudoku (digits 1-8 once in every row, column and 2x4 box)
// drawn over a chess game. The 32 pieces are shown on their starting squares;
// the game has continued by standard chess rules with no capture and no
// castling, and every piece has moved at most once. Each piece carries a
// digit, which must be the digit in the square the piece stands on now. The
// grid is the board seen from White's side: R8 is White's back rank, R1
// Black's, C1..C8 are files a..h.
//
// Encoding. A piece is either on its start square or on the one square it
// moved to, so the history is one destination per piece plus an order in
// which the moves were made. A square is vacated only by its original
// occupant leaving and filled only by the one piece that lands on it, so a
// move is legal exactly when every square on its path was vacated earlier
// and is filled (if at all) later. Those "must move first" relations must
// admit an order, i.e. be acyclic, which the depth codes below witness.
// Per piece: VD = index into its list of single moves (pinned to 1 while the
// piece is unmoved); VC = depth code, 1 = unmoved, 2 = moved with nothing
// forced to move before it, d+1 = moved after a piece of code d that had to
// move first (the longest chain of forced predecessors, so a position has
// exactly one code assignment). Per square: VA = code of the piece that
// landed there (1 = nobody), VP = highest code among the pieces that slid
// through it (1 = nobody). VS = side to move (1 White, 2 Black), fixed by
// the move counts.
//
// Omitted: strict alternation of the colours is kept only as its count
// consequence (White moved as often as Black or once more, and at least
// once); of the check rules only "the side that just moved is not in check
// in the current position" is kept, not that no earlier position broke
// them; and nothing says the game is not already over (checkmate or
// stalemate on the board).
//
// Depth codes stop at the 16-value range, so a position needing a chain of
// more than 15 forced predecessors cannot be represented.

const shape = new Shape('8x8', 16);
const graph = cellGraph(shape);
const MAX_CODE = 16;
const CODES = Array.from({ length: MAX_CODE }, (_, i) => i + 1);
const MOVED_CODES = CODES.slice(1);

// Pieces: start cell, side, type, carried digit -- from the 32 piece glyphs
// (white on R7-R8, black on R1-R2) and the numeral drawn in the top-left
// corner of each glyph's cell.
const PIECES = [
  ['R8C1', 'w', 'R', 6], ['R8C2', 'w', 'N', 8], ['R8C3', 'w', 'B', 5],
  ['R8C4', 'w', 'Q', 3], ['R8C5', 'w', 'K', 3], ['R8C6', 'w', 'B', 4],
  ['R8C7', 'w', 'N', 8], ['R8C8', 'w', 'R', 6],
  ['R7C1', 'w', 'P', 5], ['R7C2', 'w', 'P', 8], ['R7C3', 'w', 'P', 7],
  ['R7C4', 'w', 'P', 5], ['R7C5', 'w', 'P', 2], ['R7C6', 'w', 'P', 5],
  ['R7C7', 'w', 'P', 7], ['R7C8', 'w', 'P', 7],
  ['R1C1', 'b', 'R', 5], ['R1C2', 'b', 'N', 5], ['R1C3', 'b', 'B', 6],
  ['R1C4', 'b', 'Q', 3], ['R1C5', 'b', 'K', 3], ['R1C6', 'b', 'B', 7],
  ['R1C7', 'b', 'N', 1], ['R1C8', 'b', 'R', 3],
  ['R2C1', 'b', 'P', 1], ['R2C2', 'b', 'P', 4], ['R2C3', 'b', 'P', 6],
  ['R2C4', 'b', 'P', 3], ['R2C5', 'b', 'P', 7], ['R2C6', 'b', 'P', 6],
  ['R2C7', 'b', 'P', 1], ['R2C8', 'b', 'P', 5],
].map(([start, side, type, digit]) => ({ start, side, type, digit }));

const DIAGONALS = [[1, 1], [1, -1], [-1, 1], [-1, -1]];
const RANK_DIRS = [[0, 1], [0, -1]];
const FILE_DIRS = [[1, 0], [-1, 0]];
const KNIGHT_JUMPS = [[1, 2], [2, 1], [-1, 2], [-2, 1], [1, -2], [2, -1], [-1, -2], [-2, -1]];
const forwardOf = side => (side === 'w' ? -1 : 1);

// Sliding moves along the given directions: each square of a ray, with the
// squares before it on the ray as the path that must be empty.
function slides(start, dirs, limit = Infinity) {
  return dirs.flatMap(([dR, dC]) => {
    const ray = graph.ray(start, dR, dC).slice(1, 1 + limit);
    return ray.map((dest, i) => ({ dest, path: ray.slice(0, i + 1) }));
  });
}

// Every single move a piece could make on an otherwise empty board, as
// {dest, path}, where path is the squares (ending in dest) that must be empty
// when the move is made. Pawns move straight (no captures): one square, or
// two from the start rank through the square between. The queen's own file
// is cut at two squares: the pawn in front of her is the only piece that can
// vacate the square she starts behind, and it lands on one of the next two
// squares of that file, so every longer file move is blocked; the cut keeps
// her at 16 moves, the most an index cell can hold.
function moves({ start, side, type }) {
  const forward = forwardOf(side);
  switch (type) {
    case 'P': {
      const one = graph.step(start, forward, 0);
      const two = graph.step(start, 2 * forward, 0);
      return [{ dest: one, path: [one] }, { dest: two, path: [one, two] }];
    }
    case 'N':
      return KNIGHT_JUMPS.map(([dR, dC]) => graph.step(start, dR, dC))
        .filter(dest => dest !== null).map(dest => ({ dest, path: [dest] }));
    case 'K':
      return graph.kingNeighbours(start).map(dest => ({ dest, path: [dest] }));
    case 'B':
      return slides(start, DIAGONALS);
    case 'R':
      return slides(start, [...RANK_DIRS, ...FILE_DIRS]);
    case 'Q':
      return [...slides(start, [...DIAGONALS, ...RANK_DIRS]), ...slides(start, [[forward, 0]], 2)];
  }
}

for (const piece of PIECES) piece.moves = moves(piece);

const occupantOf = new Map(PIECES.map(p => [p.start, p]));
const startCells = PIECES.map(p => p.start);
const dest = graph.makeOverlay('VD', startCells);
const code = graph.makeOverlay('VC', startCells);

// Squares some piece can land on, and squares some piece can slide through
// on the way to a square another piece can land on.
const landable = [...new Set(PIECES.flatMap(p => p.moves.map(m => m.dest)))];
const passable = [...new Set(PIECES.flatMap(
  p => p.moves.flatMap(m => m.path.slice(0, -1))))]
  .filter(sq => landable.includes(sq));
const arrival = graph.makeOverlay('VA', landable);
const pass = graph.makeOverlay('VP', passable);
const SIDE_CELL = 'VS';

// Pair keys (first cell, second cell).
const movedBeforeKey = Pair.fnToKey((o, r) => o >= 2 && o < r, shape);
const landsAfterKey = Pair.fnToKey((a, r) => a === 1 || a > r, shape);
const landsHereKey = Pair.fnToKey((a, r) => a === r, shape);

// The mover's code is one more than the largest code among the pieces that
// had to move first: the original occupants of its path squares and, via VP,
// the pieces that slid through its destination. Reads the mover's code r,
// then each of those; a read of 1 (unmoved / nobody) contributes nothing,
// and the Pair above already rejects an unmoved path occupant.
const depthSpec = NFA.encodeSpec({
  startState: { r: 0, found: false },
  transition: ({ r, found }, v) => {
    if (r === 0) return { r: v, found: false };
    if (v >= r) return undefined;
    return { r, found: found || v === r - 1 };
  },
  accept: ({ r, found }) => r >= 2 && (found || r === 2),
}, shape);

// One branch per candidate square: it pins the index, the digit in that
// square, and the legality of the move relative to the other pieces.
function pieceBranches(piece) {
  const d = dest.at(piece.start);
  const c = code.at(piece.start);
  const unmoved = new And([new Given(d, 1), new Given(c, 1), new Given(piece.start, piece.digit)]);
  const moved = piece.moves.map(({ dest: sq, path }, i) => {
    const occupants = path.map(q => occupantOf.get(q)).filter(o => o !== undefined);
    const through = path.slice(0, -1);
    const depthReads = [
      ...occupants.map(o => code.at(o.start)),
      ...(pass.at(sq) ? [pass.at(sq)] : []),
    ];
    return new And([
      new Given(d, i + 1),
      new Given(sq, piece.digit),
      ...occupants.map(o => new Pair(movedBeforeKey, 'vacated-first', code.at(o.start), c)),
      ...through.filter(q => arrival.at(q) !== null)
        .map(q => new Pair(landsAfterKey, 'filled-later', arrival.at(q), c)),
      new Pair(landsHereKey, 'arrives', arrival.at(sq), c),
      depthReads.length === 0
        ? new Given(c, 2)
        : new NFA(depthSpec, 'depth', c, ...depthReads),
    ]);
  });
  return [unmoved, ...moved];
}

// A piece's (index, code) pair says it is on move `index` when its code is
// 2 or more; an unmoved piece has code 1 and its index pinned to 1.

// VA for a square: reads its own value, then (index, code) of every piece
// that could land there. Exactly one of them lands there when the value is
// a code, none when it is 1, and the landing piece's code is the value.
function arrivalConstraint(sq) {
  const landers = PIECES.map(p => ({ p, index: p.moves.findIndex(m => m.dest === sq) + 1 }))
    .filter(({ index }) => index >= 1);
  const wanted = landers.map(l => l.index);
  const spec = NFA.encodeSpec({
    startState: { a: 0, k: 0, pend: null, cnt: 0 },
    transition: ({ a, k, pend, cnt }, v) => {
      if (a === 0) return { a: v, k: 0, pend: null, cnt: 0 };
      if (pend === null) return k < wanted.length ? { a, k, pend: v === wanted[k], cnt } : undefined;
      if (!pend || v === 1) return { a, k: k + 1, pend: null, cnt };
      if (cnt === 1 || v !== a) return undefined;
      return { a, k: k + 1, pend: null, cnt: 1 };
    },
    accept: ({ a, pend, cnt }) => pend === null && (a === 1) === (cnt === 0),
    maxDepth: 1 + 2 * landers.length,
  }, shape);
  return new NFA(spec, 'landing', arrival.at(sq),
    ...landers.flatMap(({ p }) => [dest.at(p.start), code.at(p.start)]));
}

// VP for a square: reads its own value, then (index, code) of every piece
// whose path could pass through it. The value is the largest code among the
// pieces that do pass through, or 1 when none does.
function passConstraint(sq) {
  const passers = PIECES.map(p => ({
    p,
    indices: new Set(p.moves.flatMap((m, i) => m.path.slice(0, -1).includes(sq) ? [i + 1] : [])),
  })).filter(({ indices }) => indices.size > 0);
  const wanted = passers.map(x => [...x.indices]);
  const spec = NFA.encodeSpec({
    startState: { m: 0, k: 0, pend: null, found: false },
    transition: ({ m, k, pend, found }, v) => {
      if (m === 0) return { m: v, k: 0, pend: null, found: false };
      if (pend === null) return k < wanted.length ? { m, k, pend: wanted[k].includes(v), found } : undefined;
      if (!pend || v === 1) return { m, k: k + 1, pend: null, found };
      if (v > m) return undefined;
      return { m, k: k + 1, pend: null, found: found || v === m };
    },
    accept: ({ m, pend, found }) => pend === null && (m === 1 || found),
    maxDepth: 1 + 2 * passers.length,
  }, shape);
  return new NFA(spec, 'passing', pass.at(sq),
    ...passers.flatMap(({ p }) => [dest.at(p.start), code.at(p.start)]));
}

// Move counts, read over the 16 White then the 16 Black codes (a code of 2
// or more is a moved piece) and then VS: White moved at least once, and as
// often as Black (White to move, VS = 1) or once more (Black to move,
// VS = 2).
const NUM_WHITE = PIECES.filter(p => p.side === 'w').length;
const countSpec = NFA.encodeSpec({
  startState: { i: 0, diff: 0, any: false },
  transition: ({ i, diff, any }, v) => {
    if (i === PIECES.length) {
      return any && ((diff === 0 && v === 1) || (diff === 1 && v === 2))
        ? { i: i + 1, diff, any } : undefined;
    }
    const moved = v >= 2 ? 1 : 0;
    if (i < NUM_WHITE) return { i: i + 1, diff: diff + moved, any: any || moved === 1 };
    if (diff - moved < 0) return undefined;
    return { i: i + 1, diff: diff - moved, any };
  },
  accept: ({ i }) => i === PIECES.length + 1,
  maxDepth: PIECES.length + 1,
}, shape);

// Check shadow. Where a piece may stand: its start square while unmoved,
// else the destination of move `index`.
const stands = piece => [
  { at: piece.start, index: 0 },
  ...piece.moves.map((m, i) => ({ at: m.dest, index: i + 1 })),
];
// Givens that hold when the piece is NOT at that stand.
function notAt(piece, { index }) {
  const d = dest.at(piece.start);
  const c = code.at(piece.start);
  if (index === 0) return [new Given(c, ...MOVED_CODES)];
  const others = piece.moves.map((_, i) => i + 1).filter(i => i !== index);
  return [new Given(c, 1), ...(others.length ? [new Given(d, ...others)] : [])];
}
// Givens that hold when the square is NOT empty; none when nothing can ever
// stand there.
function notEmpty(sq) {
  return [
    ...(arrival.at(sq) ? [new Given(arrival.at(sq), ...MOVED_CODES)] : []),
    ...(occupantOf.has(sq) ? [new Given(code.at(sq), 1)] : []),
  ];
}
// The squares strictly between `from` and `to` when a piece of this type and
// side standing on `from` attacks `to`, or null when it does not.
function attackPath(type, side, from, to) {
  const a = parseCellId(from);
  const b = parseCellId(to);
  const dR = b.row - a.row;
  const dC = b.col - a.col;
  const diagonal = Math.abs(dR) === Math.abs(dC) && dR !== 0;
  const straight = (dR === 0) !== (dC === 0);
  const between = () => graph.ray(from, Math.sign(dR), Math.sign(dC)).slice(1, Math.max(Math.abs(dR), Math.abs(dC)));
  switch (type) {
    case 'P': return dR === forwardOf(side) && Math.abs(dC) === 1 ? [] : null;
    case 'N': return Math.abs(dR) * Math.abs(dC) === 2 ? [] : null;
    case 'K': return Math.max(Math.abs(dR), Math.abs(dC)) === 1 ? [] : null;
    case 'B': return diagonal ? between() : null;
    case 'R': return straight ? between() : null;
    case 'Q': return diagonal || straight ? between() : null;
  }
}
// One constraint per (attacker stand, king stand) with an attack geometry:
// not all of "that side just moved, attacker there, king there, line clear".
function checkConstraints(kingSide) {
  const king = PIECES.find(p => p.side === kingSide && p.type === 'K');
  const sideToMove = kingSide === 'w' ? 1 : 2;
  return PIECES.filter(p => p.side !== kingSide).flatMap(attacker =>
    stands(attacker).flatMap(from => stands(king).flatMap(to => {
      const between = attackPath(attacker.type, attacker.side, from.at, to.at);
      if (between === null) return [];
      return [new Or([
        new Given(SIDE_CELL, sideToMove),
        ...notAt(attacker, from),
        ...notAt(king, to),
        ...between.flatMap(notEmpty),
      ])];
    })));
}

return [
  shape,
  new Given('R5C4', 2),
  new Given('R5C5', 1),
  // Only the Var layers use the widened range; grid cells hold 1-8.
  graph.makeReplicate(new Given('R1C1', 1, 2, 3, 4, 5, 6, 7, 8)),
  dest.toVar('destination'),
  code.toVar('depth'),
  arrival.toVar('arrival'),
  pass.toVar('pass'),
  new Var('S', 'side to move', 1),
  new Given(SIDE_CELL, 1, 2),
  ...PIECES.map(p => new Given(dest.at(p.start), ...p.moves.map((_, i) => i + 1))),
  ...PIECES.map(p => new Or(pieceBranches(p))),
  ...landable.map(arrivalConstraint),
  ...passable.map(passConstraint),
  new NFA(countSpec, 'move-counts', ...PIECES.map(p => code.at(p.start)), SIDE_CELL),
  ...checkConstraints('w'),
  ...checkConstraints('b'),
];
