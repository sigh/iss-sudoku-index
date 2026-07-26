// Title: The Score is Still Q to 12!
// Author: Calvinball
// Video: https://www.youtube.com/watch?v=tWjjsdrjQ8E
// Source: https://sudokupad.app/syjv7l5c1o

// Normal sudoku rules apply.
//
// Snake: a one-cell-wide orthogonal path that may not touch itself
// orthogonally or diagonally. Its cells are a solver-discovered membership
// overlay: endpoint degree 1, all other selected cells degree 2, plus a
// no-diagonal-touch rule and ConnectedValues close this into exactly one
// simple path, exactly as the orthogonal self-touch rule is implied by
// degree + connectivity.
//
// Two zones (drawn as the "ENT"/"GW" cages in the source, no total, purely
// geometric) partition the whole grid and gate the snake's line behaviour
// where both cells of an edge, or all three cells of a run, lie inside one
// zone: German Whisper (adjacent snake digits differ by >= 5) inside the GW
// zone, Entropic (any 3 consecutive snake cells hold one low/one mid/one
// high digit) inside the ENT zone. An edge or triple straddling the zone
// boundary is exempt from both, per the rules text.
//
// Circle cells are the snake's head and tail (degree 1, forced on) and their
// digit equals the count of snake cells in their own box, including
// themselves. Arrow cells are always snake (forced on) and their digit
// equals the total snake-cell count along their drawn ray(s) to the grid
// edge, excluding themselves; a cell with two arrows sums both rays.
//
// White dots mark specific adjacent pairs that must be consecutive; absence
// of a dot elsewhere is not a negative constraint.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const snake = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Head/tail circles, from the two white underlay circles in the source.
const endpoints = ['R5C5', 'R9C2'];
const endpointSet = new Set(endpoints);

// Arrow cells and their drawn direction(s), from the source's short
// off-centre arrowheads. Direction vectors are [dRow, dCol].
const UP = [-1, 0], DOWN = [1, 0], LEFT = [0, -1], RIGHT = [0, 1];
const UP_LEFT = [-1, -1], UP_RIGHT = [-1, 1], DOWN_LEFT = [1, -1], DOWN_RIGHT = [1, 1];
const arrows = [
  { cell: 'R1C1', dirs: [DOWN_RIGHT] },
  { cell: 'R2C4', dirs: [LEFT] },
  { cell: 'R3C8', dirs: [LEFT] },
  { cell: 'R4C2', dirs: [UP] },
  { cell: 'R4C9', dirs: [DOWN_LEFT] },
  { cell: 'R8C6', dirs: [UP, UP_RIGHT] },
  { cell: 'R9C8', dirs: [UP_LEFT] },
  { cell: 'R9C9', dirs: [UP] },
];
const arrowCells = arrows.map(a => a.cell);

// Every forced-on cell (endpoints + arrow cells) is snake; every other cell
// starts unrestricted between ON/OFF.
const membership = [
  snake.makeReplicate(new Given(snake.cells()[0], ON, OFF)),
  ...snake.at([...endpoints, ...arrowCells]).map(cell => new Given(cell, ON)),
];

// Reads the centre cell's membership followed by its orthogonal neighbours.
// An ON endpoint needs one ON neighbour; every other ON cell needs two. Off
// cells are unconstrained. (Same construction as GsT308ot5xU.)
function degreeMachine(requiredDegree) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, value) => {
      if (phase === 'start') {
        return value === ON
          ? { phase: 'on', onNeighbours: 0 }
          : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (value === ON ? 1 : 0);
      return count > requiredDegree
        ? undefined
        : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) =>
      phase === 'off' || onNeighbours === requiredDegree,
  }, geometry.numValues);
}
const endpointDegreeMachine = degreeMachine(1);
const ordinaryDegreeMachine = degreeMachine(2);
const degrees = gridCells.map(cell => new NFA(
  endpointSet.has(cell) ? endpointDegreeMachine : ordinaryDegreeMachine,
  endpointSet.has(cell) ? 'endpoint-degree' : 'degree',
  ...snake.at([cell, ...graph.neighbours(cell)]),
));

// Forbid the diagonal-only pattern in every 2x2: two ON cells on one
// diagonal with both cells of the other diagonal off. Three ON cells stay
// legal -- that is the unavoidable local shape of an orthogonal turn.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { block: [] },
  transition: ({ block }, value) => {
    if (block === null) return { block: null };
    const next = [...block, value === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = snake.makeReplicate(
  new NFA(
    noDiagonalTouchMachine,
    'no-diagonal-touch',
    ...snake.at(graph.block(gridCells[0], 2, 2)),
  ),
  snake.at(blockOrigins),
);

// Zone membership, derived from the two drawn zone cages: the ENT cage is
// R4-R6 C7-C9 plus all of R7-R9; the GW cage is everything else (all of
// R1-R3, plus R4-R6 C1-C6). The two cages partition the whole grid with no
// overlap.
function isEntZone(cell) {
  // parseCellId's row/col are 0-indexed, so R4-R6/C7-C9/R7-R9 become 3-5/6-8/6-8.
  const { row, col } = geometry.parseCellId(cell);
  return (row >= 3 && row <= 5 && col >= 6 && col <= 8) || (row >= 6 && row <= 8);
}

// Reads membership/digit for each end of an orthogonal edge. If both cells
// are on the snake, their digits must differ by at least the whisper gap.
function edgeDifferenceSpec(minDiff) {
  return NFA.encodeSpec({
    startState: { phase: 'a-membership' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'a-membership':
          return value === ON
            ? { phase: 'a-digit' }
            : { phase: 'skip', left: 3 };
        case 'a-digit':
          return { phase: 'b-membership', aDigit: value };
        case 'b-membership':
          return value === ON
            ? { phase: 'b-digit', aDigit: state.aDigit }
            : { phase: 'skip', left: 1 };
        case 'b-digit':
          return Math.abs(state.aDigit - value) >= minDiff
            ? { phase: 'done' }
            : undefined;
        case 'skip':
          return state.left > 1
            ? { phase: 'skip', left: state.left - 1 }
            : { phase: 'done' };
      }
    },
    accept: ({ phase }) => phase === 'done',
  }, geometry.numValues);
}
const whisperMachine = edgeDifferenceSpec(5);
// Each grid edge is visited once, via the right and down steps from every
// cell; only apply the whisper rule to edges lying entirely inside the GW
// zone (a GW/ENT-crossing edge is exempt).
const gwWhispers = gridCells.flatMap(cell => [RIGHT, DOWN]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(other => other && !isEntZone(cell) && !isEntZone(other))
  .map(other => new NFA(
    whisperMachine, 'gw-whisper',
    snake.at(cell), cell, snake.at(other), other,
  )));

// Low/mid/high class of a digit for the entropic rule.
function digitClass(value) {
  return value <= 3 ? 'L' : value <= 6 ? 'M' : 'H';
}

// Reads membership/digit for three cells a, b, c (b's two path neighbours).
// If all three are on the snake they are a consecutive run (ON-ON adjacency
// is always a path edge once degree + connectivity hold); their digits must
// then cover all three low/mid/high classes.
const entropicMachine = NFA.encodeSpec({
  startState: { phase: 'a-membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'a-membership':
        return value === ON
          ? { phase: 'a-digit' }
          : { phase: 'skip', left: 5 };
      case 'a-digit':
        return { phase: 'b-membership', aClass: digitClass(value) };
      case 'b-membership':
        return value === ON
          ? { phase: 'b-digit', aClass: state.aClass }
          : { phase: 'skip', left: 3 };
      case 'b-digit':
        return { phase: 'c-membership', aClass: state.aClass, bClass: digitClass(value) };
      case 'c-membership':
        return value === ON
          ? { phase: 'c-digit', aClass: state.aClass, bClass: state.bClass }
          : { phase: 'skip', left: 1 };
      case 'c-digit': {
        const classes = new Set([state.aClass, state.bClass, digitClass(value)]);
        return classes.size === 3 ? { phase: 'done' } : undefined;
      }
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 }
          : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
// Every unordered pair of orthogonal directions is a candidate local shape
// for the path passing through b (a straight-through pair or a turn); only
// the pair actually realised on the snake bites, the rest stay vacuous
// because at least one neighbour is off. Restrict to triples lying entirely
// inside the ENT zone (b is ENT and both a, c are ENT; a GW/ENT-crossing
// triple is exempt).
const DIRECTION_PAIRS = [
  [UP, DOWN], [LEFT, RIGHT],
  [UP, LEFT], [UP, RIGHT], [DOWN, LEFT], [DOWN, RIGHT],
];
const entropicTriples = gridCells
  .filter(isEntZone)
  .flatMap(b => DIRECTION_PAIRS.flatMap(([d1, d2]) => {
    const a = graph.step(b, ...d1);
    const c = graph.step(b, ...d2);
    if (!a || !c || !isEntZone(a) || !isEntZone(c)) return [];
    return [new NFA(
      entropicMachine, 'entropic-triple',
      snake.at(a), a, snake.at(b), b, snake.at(c), c,
    )];
  }));

// Reads a target digit followed by a sequence of membership values; accepts
// iff the count of ON values equals the target. Used both for an arrow's
// combined ray count and a circle's box count. The running count is clamped
// at target+1 (a "too many already" sink) to keep the compiled state count
// bounded; maxDepth covers the longest instance: 1 target read plus R8C6's
// combined 10-cell two-ray count.
const countOnEqualsDigitMachine = NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    if (state.phase === 'target') return { phase: 'count', target: value, count: 0 };
    const hit = value === ON ? 1 : 0;
    return { phase: 'count', target: state.target, count: Math.min(state.count + hit, state.target + 1) };
  },
  accept: (state) => state.phase === 'count' && state.count === state.target,
  maxDepth: 11,
}, geometry.numValues);

// Arrow rays: cast to the grid edge and drop the arrow cell itself (index 0
// of graph.ray) since arrows do not count themselves; a two-arrow cell
// concatenates both rays into one combined count.
const arrowSights = arrows.map(({ cell, dirs }) => {
  const rayCells = dirs.flatMap(([dRow, dCol]) => graph.ray(cell, dRow, dCol).slice(1));
  return new NFA(
    countOnEqualsDigitMachine, 'arrow-sight',
    cell, ...snake.at(rayCells),
  );
});

// Circle box counts, including the circle cell itself.
const circleBoxCounts = endpoints.map(cell => {
  const box = graph.boxes().find(region => region.includes(cell));
  return new NFA(
    countOnEqualsDigitMachine, 'circle-box-count',
    cell, ...snake.at(box),
  );
});

// White dots: R6C1-R7C1 and R1C8-R1C9 (source overlays' edge marks).
const whiteDots = [
  new WhiteDot('R6C1', 'R7C1'),
  new WhiteDot('R1C8', 'R1C9'),
];

return [
  new Shape('9x9'),
  snake.toVar('snake membership'),
  ...membership,
  new ConnectedValues('VS', ON),
  ...degrees,
  noDiagonalTouches,
  ...gwWhispers,
  ...entropicTriples,
  ...arrowSights,
  ...circleBoxCounts,
  ...whiteDots,
];
