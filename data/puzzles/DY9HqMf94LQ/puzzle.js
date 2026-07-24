// Title: Wallfacer
// Author: M.K.
// Video: https://www.youtube.com/watch?v=DY9HqMf94LQ
// Source: https://sudokupad.app/uz9llk6x4x

// Normal sudoku + dots. Fog is a UI mechanic (correctly placed digits clear
// it), not a rule, so it is omitted.
//
// The 1-cell-wide wall is modelled as a whole-grid overlay Var (side: 1 =
// white-dot side, 2 = black-dot side, 3 = wall). The colours themselves break
// the otherwise-arbitrary side-label symmetry, so pinning white dots to side 1
// and black dots to side 2 is not an out-of-band selection. Each side is
// forced into a single connected region via ConnectedValues, and a per-edge
// NFA forbids a side-1 cell from directly touching a side-2 cell, so any
// 1/2 boundary must run through wall cells -- exactly the "wall divides white
// from black" rule. Per dot, "may touch the wall but cannot sit on top of it"
// is read literally: at most one of the dot's two cells may itself be a wall
// cell (touching), never both (on top of); whichever cell is not the wall
// must carry the dot's side. (One white dot -- R8C2/R8C3 -- is orthogonally
// adjacent to a black dot's cell -- R8C4 -- so both dot cells being forced
// onto fixed sides is unsatisfiable: no wall could separate two already-
// adjacent non-wall cells. Letting the shared cell be the wall itself
// resolves it, and only that reading keeps every clause -- including the
// wall's own digit rules -- simultaneously satisfiable.) The wall itself is
// also required to be one connected region; combined with a degree<=2
// no-branch rule and a no-diagonal-self-touch rule (the same closure used
// for unknown loops: connectivity + bounded degree + no-touch => a single
// simple path/cycle), this reproduces "the wall cannot branch or touch
// itself". A final per-edge NFA enforces the two digit rules that depend on
// wall membership: a digit adjacent to a wall cell is at least 4 lower than
// that wall cell, and adjacent wall cells are consecutive.

const WHITE_SIDE = 1;
const BLACK_SIDE = 2;
const WALL = 3;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const side = graph.makeOverlay('VW');
const sideCell = cell => side.at(cell);
const gridCells = graph.cells();

const whiteDots = [
  ['R1C1', 'R2C1'],
  ['R2C2', 'R2C3'],
  ['R1C4', 'R2C4'],
  ['R2C4', 'R3C4'],
  ['R3C3', 'R3C4'],
  ['R6C2', 'R6C3'],
  ['R6C3', 'R7C3'],
  ['R8C2', 'R8C3'],
  ['R3C5', 'R4C5'],
];
const blackDots = [
  ['R8C4', 'R8C5'],
  ['R7C5', 'R7C6'],
  ['R9C5', 'R9C6'],
  ['R8C7', 'R8C8'],
  ['R4C8', 'R4C9'],
  ['R5C8', 'R5C9'],
  ['R2C8', 'R2C9'],
];

// A dot's two cells must each be either the dot's side or the wall, and not
// both the wall (a dot cannot sit on top of it).
const dotSideKey = targetSide => Pair.fnToKey((a, b) => {
  const valid = v => v === targetSide || v === WALL;
  return valid(a) && valid(b) && !(a === WALL && b === WALL);
}, geometry.numValues);
const whiteDotSideKey = dotSideKey(WHITE_SIDE);
const blackDotSideKey = dotSideKey(BLACK_SIDE);

// Every side Var is one of {white side, black side, wall}.
const firstSide = side.cells()[0];
const replicateConstraint = side.makeReplicate(
  [new Given(firstSide, WHITE_SIDE, BLACK_SIDE, WALL)]);

// No branch: a wall cell has at most two orthogonal wall neighbours.
const wallDegreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === WALL ? { phase: 'wall', onNeighbours: 0 } : { phase: 'other' };
    }
    if (phase === 'other') return { phase: 'other' };
    const count = onNeighbours + (membership === WALL ? 1 : 0);
    return count > 2 ? undefined : { phase: 'wall', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'other' || onNeighbours <= 2,
}, geometry.numValues);

// No self-touch, even diagonally: forbid a 2x2 block whose only wall cells
// are a diagonal pair.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === WALL];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);

// Wall-adjacent digit rules: a non-wall digit sharing an edge with a wall
// cell is at least 4 lower than that wall cell's digit; two orthogonally
// adjacent wall cells hold consecutive digits.
const wallDigitMachine = NFA.encodeSpec({
  startState: { phase: 'mA' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'mA':
        return { phase: 'dA', mA: value };
      case 'dA':
        return { phase: 'mB', mA: state.mA, dA: value };
      case 'mB':
        return { phase: 'dB', mA: state.mA, dA: state.dA, mB: value };
      case 'dB': {
        const { mA, dA, mB } = state;
        const dB = value;
        if ((mA === WHITE_SIDE && mB === BLACK_SIDE) || (mA === BLACK_SIDE && mB === WHITE_SIDE)) {
          return undefined;
        }
        if (mA === WALL && mB === WALL) {
          return Math.abs(dA - dB) === 1 ? { phase: 'done' } : undefined;
        }
        if (mA === WALL || mB === WALL) {
          const wallDigit = mA === WALL ? dA : dB;
          const otherDigit = mA === WALL ? dB : dA;
          return wallDigit - otherDigit >= 4 ? { phase: 'done' } : undefined;
        }
        return { phase: 'done' };
      }
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);

// No self-touch is the same shifted 2x2 check at every anchor (a block's
// top-left cell); stamp it as one Replicate instead of 64 copies.
const noTouchAnchors = gridCells.filter(cell => graph.block(cell, 2, 2));
const noTouchReplicate = side.makeReplicate(
  [new NFA(noDiagonalTouchMachine, 'wall-no-touch',
    ...side.at(graph.block(noTouchAnchors[0], 2, 2)))],
  side.at(noTouchAnchors));

return [
  new Shape('9x9'),
  side.toVar('side'),
  replicateConstraint,
  // Each side and the wall itself are each a single connected region.
  new ConnectedValues('VW', WHITE_SIDE),
  new ConnectedValues('VW', BLACK_SIDE),
  new ConnectedValues('VW', WALL),
  ...whiteDots.flatMap(([a, b]) => [
    new WhiteDot(a, b),
    new Pair(whiteDotSideKey, 'white-dot-side', sideCell(a), sideCell(b)),
  ]),
  ...blackDots.flatMap(([a, b]) => [
    new BlackDot(a, b),
    new Pair(blackDotSideKey, 'black-dot-side', sideCell(a), sideCell(b)),
  ]),
  ...gridCells.map(cell =>
    new NFA(wallDegreeMachine, 'wall-degree',
      sideCell(cell), ...side.at(graph.neighbours(cell)))
  ),
  noTouchReplicate,
  ...gridCells.flatMap(cell =>
    [[0, 1], [1, 0]].flatMap(([dR, dC]) => {
      const other = graph.step(cell, dR, dC);
      return other ? [new NFA(wallDigitMachine, 'wall-digit-rule',
        sideCell(cell), cell, sideCell(other), other)] : [];
    })
  ),
];
