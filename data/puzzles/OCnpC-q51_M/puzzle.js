// Title: 7 loop
// Author: Innocuous
// Video: https://www.youtube.com/watch?v=OCnpC-q51_M
// Source: https://app.crackingthecryptic.com/sudoku/n8gt4Hgprp

// Normal sudoku (standard boxes). In cages, digits sum to the corner clue --
// no uniqueness within a cage is stated, so cages use Sum, not Cage.
//
// Draw a single closed loop through cell centres, orthogonal steps only, that
// visits all 8 outer boxes (the centre box is optional) and does not touch
// itself orthogonally. All loop cells can be grouped into loop-adjacent pairs
// that each sum to 7.
//
// Loop topology: a 'VL' membership overlay (ON/OFF per cell). Because
// self-touch is forbidden, any two orthogonally-adjacent ON cells must be
// consecutive on the loop, so "exactly two ON neighbours" (a degree-2 NFA)
// plus ConnectedValues(ON) forces a single simple cycle -- the same argument
// used for nordschleife.js's non-diagonal-touch loop.
//
// Pairing: a second 'VD' overlay gives each cell the compass direction of its
// loop-partner (or OFF). A pairing of a cycle into loop-adjacent, non-
// overlapping pairs is exactly a perfect matching using only cycle edges, and
// a simple cycle has only two such matchings (the alternating edge sets).
// Encoding that matching needs no global numbering: requiring every ON cell
// to claim exactly one direction (VD != OFF), every claim to be reciprocated
// by the claimed neighbour (edge agreement on VD, as in wendezaune.js's
// edgeAgree), and every reciprocated claim to sum to 7 is already sufficient
// -- it has no satisfying assignment unless the ON cells decompose into a
// consistent alternating matching, which forces even loop length as a
// consequence rather than as a separate rule.

const ON = 1, OFF = 2;                 // 'VL' membership values
const DIR_OFF = 1, DIR_N = 2, DIR_E = 3, DIR_S = 4, DIR_W = 5;   // 'VD' values
const DIRS = [[DIR_N, -1, 0], [DIR_E, 0, 1], [DIR_S, 1, 0], [DIR_W, 0, -1]];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

const membership = graph.makeOverlay('VL');
const pairDir = graph.makeOverlay('VD');

// --- Membership domain: every cell is ON or OFF; no cell is fixed on/off. ---
const membershipDomain = membership.makeReplicate(
  new Given(membership.cells()[0], ON, OFF));

// --- Direction domain: OFF, plus a compass direction only where that
// neighbour exists on the grid (border cells lose the off-grid directions).
const pairDirDomains = gridCells.map(cell => {
  const allowed = [DIR_OFF];
  for (const [dir, dR, dC] of DIRS) {
    if (graph.step(cell, dR, dC)) allowed.push(dir);
  }
  return new Given(pairDir.at(cell), ...allowed);
});

// --- On-loop iff a real pair direction is chosen. A 2-cell relation, so Pair
// rather than NFA (per the sandbox linter).
const onIffDirKey = Pair.fnToKey(
  (membershipValue, dirValue) => (membershipValue === ON) === (dirValue !== DIR_OFF),
  geometry.numValues);
const onIffDir = gridCells.map(cell =>
  new Pair(onIffDirKey, 'on-iff-dir', membership.at(cell), pairDir.at(cell)));

// --- Degree 2: each ON cell has exactly two ON orthogonal neighbours. Since
// self-touch is disallowed, this alone forces a single simple cycle once
// paired with ConnectedValues below (see the header note).
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membershipValue) => {
    if (phase === 'start') {
      return membershipValue === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membershipValue === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...membership.at([cell, ...graph.neighbours(cell)])));

// --- Pair-direction agreement: A claims B as its pair partner iff B claims A
// back. A 2-cell relation (dirA, dirB) for one shared edge, so Pair.
const pairAgree = (dirAB, dirBA) => Pair.fnToKey(
  (a, b) => (a === dirAB) === (b === dirBA), geometry.numValues);

// --- Pair sum: when A claims B (reciprocation checked separately above),
// their digits sum to 7. Reads (dirA, digitA, digitB).
const pairSum = (dirAB) => NFA.encodeSpec({
  startState: { phase: 'dir' },
  transition: (state, value) => {
    if (state.phase === 'dir') return { phase: 'digitA', claims: value === dirAB };
    if (state.phase === 'digitA') return { phase: 'digitB', claims: state.claims, digitA: value };
    if (!state.claims) return { done: true };
    return state.digitA + value === 7 ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

const pairAgreeRight = pairAgree(DIR_E, DIR_W), pairAgreeDown = pairAgree(DIR_S, DIR_N);
const pairSumRight = pairSum(DIR_E), pairSumDown = pairSum(DIR_S);

// pair-agree only reads 'VD' cells, so every instance is a shifted copy of one
// template within that one cell group -- stamp it with Replicate rather than
// by hand (the sandbox linter's stamped-copies check). pair-sum mixes 'VD'
// with main-grid digit cells, two different cell groups, so it cannot be
// Replicated the same way and is left as direct per-edge NFAs.
const horizontalEdgeOrigins = gridCells.filter(cell => graph.step(cell, 0, 1));
const verticalEdgeOrigins = gridCells.filter(cell => graph.step(cell, 1, 0));
const pairAgreements = [
  pairDir.makeReplicate(
    new Pair(pairAgreeRight, 'pair-agree-h', ...pairDir.at(['R1C1', 'R1C2'])),
    pairDir.at(horizontalEdgeOrigins)),
  pairDir.makeReplicate(
    new Pair(pairAgreeDown, 'pair-agree-v', ...pairDir.at(['R1C1', 'R2C1'])),
    pairDir.at(verticalEdgeOrigins)),
];
const pairSums = gridCells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  return [
    ...(right ? [new NFA(pairSumRight, 'pair-sum-h', pairDir.at(cell), cell, right)] : []),
    ...(down ? [new NFA(pairSumDown, 'pair-sum-v', pairDir.at(cell), cell, down)] : []),
  ];
});
const pairRules = [...pairAgreements, ...pairSums];

// --- The loop visits all 8 outer boxes; the centre box (index 4, 0-based) is
// optional, per "may or may not enter the central 3x3 box".
const boxCoverage = graph.boxes()
  .filter((_, i) => i !== 4)
  .map(cells => new ContainAtLeast('1', ...membership.at(cells)));

// --- Givens: the puzzle's three drawn 7s.
const givens = [
  new Given('R2C4', 7),
  new Given('R4C8', 7),
  new Given('R7C3', 7),
];

// --- Cages: digits sum to the corner clue; no in-cage uniqueness is stated.
const cages = [
  new Sum(24, 'R2C3', 'R3C2', 'R3C3'),
  new Sum(6, 'R7C8', 'R8C7', 'R8C8'),
  new Sum(12, 'R8C4', 'R8C5', 'R8C6'),
  new Sum(13, 'R1C8', 'R2C8', 'R2C9'),
  new Sum(8, 'R5C7', 'R6C7', 'R6C8'),
  new Sum(6, 'R1C6', 'R2C6'),
  new Sum(17, 'R5C5', 'R6C4', 'R6C5'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  membership.toVar('loop membership'),
  pairDir.toVar('pair direction'),
  membershipDomain,
  ...pairDirDomains,
  ...onIffDir,
  new ConnectedValues('VL', ON),
  ...degrees,
  ...pairRules,
  ...boxCoverage,
];
