// Title: Pierced Snake
// Author: AndreasV
// Video: https://www.youtube.com/watch?v=ZIm442_mXM8
// Source: https://app.crackingthecryptic.com/sudoku/tGf29NLMRT

// Normal sudoku, plus a hidden 1-cell-wide snake with a head and a tail that
// enters each of the 9 boxes. It may not touch itself, not even diagonally
// (so, orthogonally: connected with every on-snake cell having exactly one
// or two on-snake orthogonal neighbours -- one at the head/tail, two
// elsewhere; diagonally: no 2x2 block has only its two diagonal cells on).
// Six arrows each start on a circled cell; the digits on the rest of that
// arrow sum to the circled digit (the rules' "digits along an arrow must
// sum to the number in the circle"). Separately, each circled cell's own
// digit also counts the snake's cells in the circle's box, and (for the six
// circles that carry an arrow) the two arrow cells nearest the circle, read
// as a 2-digit number, give the sum of the snake's digits in that box. The
// rules consistently name "the circle" and "the arrow" as separate objects
// (rule 1 sums arrow digits *against* the circle's number), so "the first
// two digits on the arrow" is read as excluding the circle cell itself --
// for the two arrows whose non-circle path is only 2 cells long, that
// reading also happens to be the whole path.
// There is a seventh circle (R9C7) with no arrow -- it only carries the
// count reading, not a 2-digit sum.
//
// Omitted: "enters each box exactly once", i.e. the snake's cells within a
// box must form one contiguous run, never leaving a box and re-entering it --
// no known way to state that a partial, solver-discovered path visits each of
// several fixed regions in one contiguous interval. As a consequence, box2
// and box5 (rows1-3/cols4-6 and rows4-6/cols4-6) carry no circle and so have
// no lower bound on snake presence either -- nothing below requires the
// snake to enter them at all.

const ON = 1;                  // snake-membership values, stored in the Var cells
const OFF = 2;

const FLAG_OFF = 1;            // degree-flag values: off the snake
const FLAG_ENDPOINT = 2;       // on the snake with exactly one on neighbour (head/tail)
const FLAG_THROUGH = 3;        // on the snake with exactly two on neighbours

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// The snake-membership Var cell paired with each grid cell (VM1..VM81).
const snake = graph.makeOverlay('VM');
// The degree-flag Var cell paired with each grid cell (VD1..VD81).
const degreeFlag = graph.makeOverlay('VD');

// --- Domains: every cell is on(1)/off(2) the snake, and carries one of the
// three degree flags above.
const snakeOrigin = snake.cells()[0];
const flagOrigin = degreeFlag.cells()[0];
const domains = [
  snake.makeReplicate(new Given(snakeOrigin, ON, OFF)),
  degreeFlag.makeReplicate(new Given(flagOrigin, FLAG_OFF, FLAG_ENDPOINT, FLAG_THROUGH)),
];

// --- Single connected snake body. ---
const connectivity = new ConnectedValues('VM', ON);

// --- Degree: reads [flag, own membership, ...neighbour memberships]. An off
// cell must carry FLAG_OFF (its neighbours are unconstrained by this rule).
// An on cell must carry FLAG_ENDPOINT with exactly one on neighbour, or
// FLAG_THROUGH with exactly two -- so on-snake cells are 1- or 2-regular,
// which with connectivity above forces a single simple path (no branch, no
// cycle).
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    if (state.phase === 'start') return { phase: 'gotFlag', flag: value };
    if (state.phase === 'gotFlag') {
      return value === OFF
        ? { phase: 'off', flag: state.flag }
        : { phase: 'on', flag: state.flag, count: 0 };
    }
    if (state.phase === 'off') return state;
    const count = Math.min(state.count + (value === ON ? 1 : 0), 3);
    return { phase: 'on', flag: state.flag, count };
  },
  accept: (state) => {
    if (state.phase === 'off') return state.flag === FLAG_OFF;
    if (state.phase === 'on') {
      return (state.flag === FLAG_ENDPOINT && state.count === 1) ||
        (state.flag === FLAG_THROUGH && state.count === 2);
    }
    return false;
  },
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  degreeFlag.at(cell), snake.at(cell), ...snake.at(graph.neighbours(cell))));

// --- Exactly two endpoints (the head and the tail) across the whole grid.
const endpointCountMachine = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) =>
    ({ count: Math.min(count + (value === FLAG_ENDPOINT ? 1 : 0), 3) }),
  accept: ({ count }) => count === 2,
}, geometry.numValues);
const endpointCount = new NFA(
  endpointCountMachine, 'endpoints', ...degreeFlag.at(gridCells));

// --- No diagonal self-touch: forbid a 2x2 block whose only on cells are a
// diagonal pair. Reads the four membership cells of a 2x2 block, left to
// right, top to bottom.
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
// All 64 possible 2x2 blocks share this exact shape (top-left..bottom-right),
// so they replicate as one template shifted from R1C1's block onto every
// other valid top-left cell.
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouch = snake.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch', ...snake.at(graph.block(gridCells[0], 2, 2))),
  snake.at(blockOrigins));

// --- Arrows: transcribed from the drawn wayPoints, circle cell first. Six of
// the seven circled cells carry one; box9's circle (R9C7) has none.
const arrows = [
  ['R4C3', 'R3C3', 'R2C3'],
  ['R1C7', 'R2C6', 'R2C7', 'R2C8'],
  ['R5C8', 'R5C7', 'R4C8'],
  ['R8C5', 'R7C5', 'R6C5', 'R5C5'],
  ['R7C2', 'R6C2', 'R6C3', 'R6C4'],
  ['R2C2', 'R3C3', 'R2C3'],
].map(cells => new Arrow(...cells));

// --- Per-box circle readings. Each circled box lists its circle cell and,
// where an arrow is attached, the two arrow cells nearest the circle.
const circledBoxes = [
  { box: 1, circle: 'R2C2', pair: ['R3C3', 'R2C3'] },
  { box: 3, circle: 'R1C7', pair: ['R2C6', 'R2C7'] },
  { box: 4, circle: 'R4C3', pair: ['R3C3', 'R2C3'] },
  { box: 6, circle: 'R5C8', pair: ['R5C7', 'R4C8'] },
  { box: 7, circle: 'R7C2', pair: ['R6C2', 'R6C3'] },
  { box: 8, circle: 'R8C5', pair: ['R7C5', 'R6C5'] },
  { box: 9, circle: 'R9C7', pair: null },
];

// Count reading: reads [circle digit, ...box memberships] (the circle cell is
// one of the nine). Accepts when the on-count equals the circle's digit.
const countMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const counts = circledBoxes.map(({ box, circle }) => new NFA(countMachine, 'count',
  circle, ...snake.at(graph.box(box))));

// Sum reading: reads the pair's two digits (segment 1, target = 10a+b), then
// [membership, digit] for each of the box's nine cells (segment 2), tracking
// the still-owed remainder instead of the running sum so the compiled state
// stays a single small field. Accepts when the remainder reaches exactly 0.
const sumMachine = NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.phase === 'a') return { phase: 'b', a: value };
    if (state.phase === 'b') return { phase: 'wait', remaining: 10 * state.a + value };
    if (value === SEGMENT_BREAK) {
      return state.phase === 'wait' ? { phase: 'flag', remaining: state.remaining } : undefined;
    }
    if (state.phase === 'flag') {
      return { phase: 'digit', remaining: state.remaining, pendingOn: value === ON };
    }
    // phase 'digit'
    const owed = state.remaining - (state.pendingOn ? value : 0);
    return owed < 0 ? undefined : { phase: 'flag', remaining: owed };
  },
  accept: (state) => state.phase === 'flag' && state.remaining === 0,
}, geometry.numValues, { multiSegment: true });
const sums = circledBoxes
  .filter(({ pair }) => pair !== null)
  .map(({ box, pair }) => new NFA(sumMachine, 'sum',
    pair,
    graph.box(box).flatMap(cell => [snake.at(cell), cell]),
  ));

return [
  new Shape('9x9'),
  new Given('R3C5', 8),
  new Given('R9C9', 9),

  snake.toVar('snake membership'),
  degreeFlag.toVar('snake degree flag'),
  ...domains,
  connectivity,
  ...degrees,
  endpointCount,
  noDiagonalTouch,

  ...arrows,
  ...counts,
  ...sums,
];
