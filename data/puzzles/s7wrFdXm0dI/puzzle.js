// Title: Around the World in 80 Days: the Sudoku
// Author: Liam McG
// Video: https://www.youtube.com/watch?v=s7wrFdXm0dI
// Source: https://sudokupad.app/wq1p4nwud6
//
// Normal sudoku. Fog is solving UI only (it lifts progressively as digits go
// in) and has no effect on the finished grid, so it is not encoded.
//
// White Kropki dots: consecutive pairs, given exhaustively -- no black dots
// are used, so only the consecutive relation is negated on every other
// orthogonally adjacent pair.
//
// Killer cages: printed-total cages use Cage (which also enforces
// all-different); no-total cages are AllDifferent only.
//
// Detective Fix: box n's cell holding digit n ("Fix") may not be a cage cell,
// and must be orthogonally adjacent, within the box, to a cage cell. Encoded
// by forbidding digit n at every box-n cell that fails this test -- the test
// is computed once from the drawn cages below, never re-derived by search.
//
// Path: a single orthogonally-connected loop over cell centres. "Form a
// loop" gives the baseline closure: ON/OFF membership, degree-2 (so no
// branching), plus ConnectedValues (single component) forces exactly one
// simple cycle. Diagonal self-touch is not
// otherwise forbidden by the rules text, so it is left legal; the text's own
// extra clause ("never forms a 2x2 block") is encoded separately and
// directly, since degree-2 alone does not rule out a full 2x2 of on-loop
// cells. The loop must also visit every box (>=1 on-loop cell per box), put
// every white-dot cell on the loop, and contain exactly one "Fix" cell and
// exactly one cage cell among its on-loop cells.
//
// The "Total Days" sum and "International Date Line" crossing clauses are
// flavour: the rules explicitly forbid assuming any particular total, so no
// numeric target exists for the loop's digit sum. Both clauses are omitted
// as carrying no constraint on the digits.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const boxes = graph.boxes();

// --- Cages --- (cells transcribed from the drawn killer cages)
const cagesWithTotal = [
  [15, ['R8C3', 'R9C3']],
  [12, ['R9C5', 'R9C6']],
  [18, ['R5C7', 'R5C8', 'R6C8']],
  [14, ['R7C8', 'R7C9', 'R8C8', 'R9C8']],
  [13, ['R5C2', 'R6C2']],
  [9, ['R8C1', 'R9C1', 'R9C2']],
];
const cagesNoTotal = [
  ['R1C5', 'R1C6', 'R2C6', 'R3C6'],
  ['R2C2', 'R3C1', 'R3C2'],
  ['R5C4', 'R5C5'],
  ['R1C7', 'R1C8', 'R2C8'],
];
const allCageCells = [
  ...cagesWithTotal.flatMap(([, cells]) => cells),
  ...cagesNoTotal.flat(),
];
const cages = [
  ...cagesWithTotal.map(([sum, cells]) => new Cage(sum, ...cells)),
  ...cagesNoTotal.map(cells => new AllDifferent(...cells)),
];

// --- White Kropki dots --- (edge marks transcribed from the drawn dots)
const whiteDotPairs = [
  ['R2C3', 'R2C4'],
  ['R4C6', 'R4C7'],
  ['R4C6', 'R5C6'],
  ['R6C6', 'R6C7'],
  ['R8C6', 'R8C7'],
  ['R8C4', 'R8C5'],
  ['R7C3', 'R7C4'],
  ['R7C4', 'R8C4'],
];
const dotCells = [...new Set(whiteDotPairs.flat())];
const dotPairKeys = new Set(whiteDotPairs.map(([a, b]) => [a, b].sort().join('-')));
const dots = whiteDotPairs.map(([a, b]) => new WhiteDot(a, b));

// Every other orthogonally adjacent pair must NOT be consecutive. One
// template per direction, replicated over every origin whose pair in that
// direction both stays in-grid and carries no drawn dot.
const notConsecutiveKey = Pair.fnToKey(
  (a, b) => a !== b + 1 && a !== b - 1, geometry.numValues);
const isDotPair = (a, b) => dotPairKeys.has([a, b].sort().join('-'));
const strictWhiteDots = [[0, 1], [1, 0]].map(([dR, dC]) => {
  const origin = gridCells[0];
  const template = new Pair(
    notConsecutiveKey, 'no other white dot', origin, graph.step(origin, dR, dC));
  const targets = gridCells.filter(cell => {
    const other = graph.step(cell, dR, dC);
    return other && !isDotPair(cell, other);
  });
  return graph.makeReplicate(template, targets);
});

// --- Detective Fix ---
// A box-n cell may hold digit n only if it is not a cage cell and has an
// orthogonal neighbour, within the same box, that is a cage cell.
const cageCellSet = new Set(allCageCells);
const fixForbiddenCells = boxes.map((box, i) => {
  const n = i + 1;
  return box.filter(cell => {
    if (cageCellSet.has(cell)) return true;
    const hasInBoxCageNeighbour = graph.neighbours(cell)
      .some(nb => box.includes(nb) && cageCellSet.has(nb));
    return !hasInBoxCageNeighbour;
  });
});
const fixForbidNFAs = fixForbiddenCells.map((cells, i) => {
  const n = i + 1;
  const spec = NFA.encodeSpec({
    startState: 'ok',
    transition: (state, value) => (value === n ? undefined : state),
    accept: () => true,
  }, geometry.numValues);
  return new NFA(spec, 'fix-forbidden', ...cells);
});

// --- Path: loop membership overlay (ON = on the loop, OFF = not) ---
const loop = graph.makeOverlay('VP');
const loopOrigin = loop.cells()[0];
const loopMembership = [
  loop.makeReplicate(new Given(loopOrigin, ON, OFF)),
  ...dotCells.map(cell => new Given(loop.at(cell), ON)),
];

// Degree-2 on-loop / degree-0 off-loop.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  ...loop.at([cell, ...graph.neighbours(cell)])));

// Never a fully on-loop 2x2 block.
const no2x2Machine = NFA.encodeSpec({
  startState: { count: 0 },
  // Clamp at 4: once all four seen so far are ON, later symbols cannot
  // matter, and clamping is what keeps this state count finite.
  transition: ({ count }, value) => (
    { count: Math.min(count + (value === ON ? 1 : 0), 4) }),
  accept: ({ count }) => count < 4,
}, geometry.numValues);
const no2x2Template = new NFA(no2x2Machine, 'no-2x2',
  ...loop.at(graph.block(gridCells[0], 2, 2)));
const no2x2Targets = loop.at(
  gridCells.filter(cell => graph.block(cell, 2, 2) !== null));
const no2x2Blocks = loop.makeReplicate(no2x2Template, no2x2Targets);

// Visits every box at least once.
const boxCoverage = boxes.map(box => new ContainAtLeast('1', ...loop.at(box)));

// Exactly one cage cell is on the loop.
const exactlyOneCageOnLoop = new ContainExact('1', ...loop.at(allCageCells));

// Exactly one "Fix" cell (a box's own digit-n cell) is on the loop.
// One auxiliary Var per box: fixHit[i] = ON iff the cell in box i+1 holding
// digit i+1 is itself on the loop. Each box's NFA reads (digit, on-loop) for
// every one of its 9 cells, in lockstep, then checks the auxiliary Var
// against whatever it accumulated.
const fixHit = graph.makeOverlay('VF', boxes.map(box => box[0]));
const fixHitCells = fixHit.cells();
const fixHitMembership = fixHit.makeReplicate(new Given(fixHitCells[0], ON, OFF));
const fixHitNFAs = boxes.map((box, i) => {
  const n = i + 1;
  const spec = NFA.encodeSpec({
    // `pairsSeen` counts full (digit, on-loop) pairs read so far; once it
    // reaches the box size the next (and last) symbol is the auxiliary Var,
    // checked against `hit` rather than folded into it.
    startState: { phase: 'digit', hit: 0, pairsSeen: 0 },
    transition: (state, value) => {
      if (state.pairsSeen === box.length) {
        const wantOn = state.hit === 1;
        return (value === ON) === wantOn ? { done: true } : undefined;
      }
      if (state.phase === 'digit') {
        return {
          phase: 'onLoop', hit: state.hit, pairsSeen: state.pairsSeen,
          pendingMatch: value === n,
        };
      }
      const newHit = state.hit === 1 || (state.pendingMatch && value === ON) ? 1 : 0;
      return { phase: 'digit', hit: newHit, pairsSeen: state.pairsSeen + 1 };
    },
    accept: state => state.done === true,
  }, geometry.numValues);
  const interleaved = box.flatMap(cell => [cell, loop.at(cell)]);
  return new NFA(spec, 'fix-hit', ...interleaved, fixHitCells[i]);
});
const exactlyOneFixOnLoop = new ContainExact('1', ...fixHitCells);

return [
  new Shape('9x9'),
  ...cages,
  ...dots,
  ...strictWhiteDots,
  ...fixForbidNFAs,
  loop.toVar('loop'),
  ...loopMembership,
  new ConnectedValues('VP', ON),
  ...degrees,
  no2x2Blocks,
  ...boxCoverage,
  exactlyOneCageOnLoop,
  fixHit.toVar('fixHit'),
  fixHitMembership,
  ...fixHitNFAs,
  exactlyOneFixOnLoop,
];
