// Title: Hydra Sudoku
// Author: Derek Neal
// Video: https://www.youtube.com/watch?v=xMO8_WN7v5g
// Source: https://cracking-the-cryptic.web.app/sudoku/3RbtF8Hmf8

// Rules encoded below:
//   Normal sudoku: digits 1-9 once each in every row, column and box (the
//   payload's 9 regions are the default 3x3 tiling).
//   Four coloured snakes each trace an orthogonally-connected path of 9
//   cells holding the digits 1-9 in increasing order (one cell per digit,
//   consecutive cells on a snake orthogonally adjacent, each step +1), never
//   using a grey cell. The rules do not say the snakes are one cell wide,
//   self-avoiding, or mutually disjoint (no drawn lines record their actual
//   routes, only one anchor cell per colour), so none of that is assumed:
//   only membership-implies-value-chain and the grey exclusion are encoded.

// Underlay colours (source's coloured squares) pin one already-known-digit
// cell onto each snake: deepskyblue R1C1(=3), mediumorchid R8C2(=5),
// yellowgreen R1C9(=4), red R9C9(=5). Four more coloured squares (grey:
// R3C9, R4C3, R9C2, R7C7) are the cells no snake may use.
const GREY = ['R3C9', 'R4C3', 'R9C2', 'R7C7'];
const SNAKES = [
  { pathPrefix: 'VPB', onPrefix: 'VOB', anchor: 'R1C1' },
  { pathPrefix: 'VPP', onPrefix: 'VOP', anchor: 'R8C2' },
  { pathPrefix: 'VPG', onPrefix: 'VOG', anchor: 'R1C9' },
  { pathPrefix: 'VPR', onPrefix: 'VOR', anchor: 'R9C9' },
];

// A snake's cells are exactly its digit values, so no separate position
// counter is needed: the grid digit itself is the position along the path.
// Each on-snake cell stores, in a VP-style overlay, the direction of the
// grid neighbour holding the next-lower digit (its "predecessor"), or START
// if it holds digit 1. This needs a value the default 1-9 alphabet has no
// room for (OFF=0), so the shape is widened to 0-9 and every real grid cell
// is pinned back to 1-9.
const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const gridCells = graph.cells();

const OFF = 0, START = 1, FROM_N = 2, FROM_E = 3, FROM_S = 4, FROM_W = 5;
const DIRS = [
  { code: FROM_N, dr: -1, dc: 0, back: FROM_S },
  { code: FROM_E, dr: 0, dc: 1, back: FROM_W },
  { code: FROM_S, dr: 1, dc: 0, back: FROM_N },
  { code: FROM_W, dr: 0, dc: -1, back: FROM_E },
];
const neighbourDirs = (cell) => DIRS
  .map(d => ({ ...d, cell: graph.step(cell, d.dr, d.dc) }))
  .filter(d => d.cell);

// Successor-count NFA, shared by every snake: reads a cell's own on/off
// status, its own digit, then each neighbour's (predecessor code, digit)
// pair in canonical N/E/S/W order (neighbourDirs' own order). A cell that is
// on-path and not holding 9 must have exactly one neighbour naming it as
// predecessor (its successor); on 9 it must have none; off it must have
// none either -- this is what stops a second, disconnected run of the same
// colour from also satisfying the local rules (paired below with a hard
// count of 9 on-cells).
// Whenever more than one neighbour happens to hold self-digit+1 (a value
// coincidence, not something the rules speak to), more than one routing
// through that cell reads as a valid "1 to 9" path. The rules never draw the
// snakes, so which such reading is "the" path is an artifact of choosing to
// model the route explicitly at all -- the same kind of freedom a Yin-Yang
// colour swap has. It is pinned the same way: the claiming neighbour must be
// the first, in canonical order, that qualifies (digit = self + 1); a
// qualifying neighbour seen earlier in the scan that did not claim rejects.
const degreeSpecs = new Map();
const degreeSpec = (backCodes) => {
  const key = backCodes.join(',');
  if (!degreeSpecs.has(key)) {
    degreeSpecs.set(key, NFA.encodeSpec({
      startState: { stage: 0 },
      transition: (state, v) => {
        if (state.stage === 0) return { stage: 1, on: v !== OFF };
        if (state.stage === 1) {
          const target = state.on ? (v === 9 ? 0 : 1) : 0;
          return { stage: 2, on: state.on, digit: v, target, n: 0, seenQualifying: false };
        }
        const slot = state.stage - 2;
        if (slot % 2 === 0) {
          // Neighbour predecessor code: remember whether it claims us.
          return { ...state, stage: state.stage + 1, claims: v === backCodes[slot / 2] };
        }
        // Neighbour digit: resolve the pending claim against the tie-break.
        const qualifies = v === state.digit + 1;
        if (state.claims) {
          if (state.seenQualifying) return undefined;
          const n = state.n + 1;
          if (n > state.target) return undefined;
          return { ...state, stage: state.stage + 1, n, seenQualifying: state.seenQualifying || qualifies };
        }
        return { ...state, stage: state.stage + 1, seenQualifying: state.seenQualifying || qualifies };
      },
      accept: (state) => state.n === state.target,
      maxDepth: 2 + 2 * backCodes.length,
    }, shape));
  }
  return degreeSpecs.get(key);
};

const buildSnake = ({ pathPrefix, onPrefix, anchor }) => {
  const path = graph.makeOverlay(pathPrefix);
  const on = graph.makeOverlay(onPrefix);

  const codesFor = (cell) => [OFF, START, ...neighbourDirs(cell).map(d => d.code)];

  // Domain: grey cells are always off this snake; the anchor is always on
  // it; every other cell may be off, the low end (START), or arrived-from
  // one of its real neighbours.
  const domains = gridCells.map(cell => {
    if (GREY.includes(cell)) return new Given(path.at(cell), OFF);
    if (cell === anchor) {
      return new Given(path.at(cell), START, ...neighbourDirs(cell).map(d => d.code));
    }
    return new Given(path.at(cell), ...codesFor(cell));
  });

  // on(cell) mirrors path(cell) != OFF as a 0/1 flag, purely so a plain Sum
  // can cap the snake at exactly 9 cells.
  const onTies = gridCells.map(cell => new Or([
    new And([new Given(path.at(cell), OFF), new Given(on.at(cell), 0)]),
    new And([new Given(path.at(cell), START, ...neighbourDirs(cell).map(d => d.code)),
      new Given(on.at(cell), 1)]),
  ]));
  const cardinality = new Sum(9, ...on.at(gridCells));

  // Low end of the chain: on-snake and holding 1 iff no predecessor (START).
  const rootTies = gridCells.map(cell => new Or([
    new And([new Given(cell, 1), new Given(path.at(cell), OFF, START)]),
    new And([new Given(cell, 2, 3, 4, 5, 6, 7, 8, 9),
      new Given(path.at(cell), OFF, ...neighbourDirs(cell).map(d => d.code))]),
  ]));

  // High end of the chain, no branching, and the priority tie-break: see
  // degreeSpec above.
  const degrees = gridCells.map(cell => {
    const dirs = neighbourDirs(cell);
    return new NFA(
      degreeSpec(dirs.map(d => d.back)), 'successor count and priority',
      path.at(cell), cell, ...dirs.flatMap(d => [path.at(d.cell), d.cell]));
  });

  // The actual "1 to 9" rule: a cell arrived-from a neighbour is exactly one
  // more than that neighbour.
  const chaining = gridCells.flatMap(cell => neighbourDirs(cell).map(d => new Or([
    new Given(path.at(cell), ...codesFor(cell).filter(c => c !== d.code)),
    new Sum(1, [cell, 1], [d.cell, -1]),
  ])));

  return [
    path.toVar(`${pathPrefix} predecessor direction`),
    on.toVar(`${onPrefix} on-snake flag`),
    ...domains, ...onTies, cardinality, ...rootTies, ...degrees, ...chaining,
  ];
};

return [
  shape,
  graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  new Given('R1C1', 3), new Given('R1C9', 4), new Given('R4C5', 2),
  new Given('R5C4', 7), new Given('R5C6', 4), new Given('R6C5', 5),
  new Given('R8C2', 5), new Given('R9C9', 5),
  ...SNAKES.flatMap(buildSnake),
];
