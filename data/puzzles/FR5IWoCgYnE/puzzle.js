// Title: Snake Pit
// Author: DiMono
// Video: https://www.youtube.com/watch?v=FR5IWoCgYnE
// Source: https://app.crackingthecryptic.com/sudoku/b9pPRJPRNL

// Rules encoded here:
//   * Normal sudoku (rows, columns, boxes all different).
//   * Eleven "X-Snake sum" outside clues. Each names a tail cell (the grid
//     cell next to the clue) and a printed value. That snake is an
//     orthogonally connected, 1-cell-wide path of X cells starting at the
//     tail cell, where X is the tail cell's own digit; the path's digits
//     are all different and sum to the printed value. The bottom-column-2
//     clue is printed ">7" in the payload rather than a number, so that
//     snake's digits must sum to strictly more than 7 (the payload's own
//     text, not a decode typo -- the puzzle has ten plain-number clues and
//     this one inequality clue).
//   * A snake may not touch itself, or any other snake, orthogonally (grid
//     adjacency); diagonal touches are unrestricted.
//   * R5C5 (the grey rock) belongs to no snake, and no snake cell anywhere
//     may hold the same digit as the rock's own digit.
//   * Exactly one cell, of exactly one snake, is orthogonally or diagonally
//     adjacent to the rock. The rules' own parenthetical reads this as
//     "there is only one snake cell in box 5", which holds because the
//     rock sits at box 5's centre, so its king-neighbours are exactly box
//     5's other 8 cells.
// Nothing is omitted.
//
// Model: one Var per grid cell (`VG`) holds NONE or the id of the snake
// that owns the cell, over a widened Shape so labels fit alongside the
// grid's own 1-9 digits; a Replicate restricts every real grid cell back
// to 1-9. Path shape is "connected, same-label orthogonal degree <= 2,
// tail's own same-label degree forced to 0 (length 1) or 1 (otherwise)".
// A connected graph of maximum degree 2 is always a simple path or a
// simple cycle, and pinning the tail's own degree rules out the cycle and
// fixes the path's start. Snake length, sum and no-repeat all come from one
// small state machine per (snake, tail-digit) branch that scans every
// cell's (label, digit) pair and keeps only the *set* of digits seen for
// that label as a bitmask -- a repeated digit is rejected mid-scan, and
// the final popcount/sum of that bitmask are exactly the snake's length
// and total. The branch is selected with `Or` over the tail's 9 possible
// digits `d`, each `And`ed with `Given(tailCell, d)`, because carrying the
// target digit *inside* the state machine (mask x target) would need
// 512*10 states, over the compiler's state-count cap.

const GRID = '9x9';
const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const NONE = 1;

// Transcribed from the drawn outside-clue circles and the rock's grey
// square, both centred at R5C5, box 5's middle cell. Listed top, right,
// bottom, left; each lane reading toward the far edge.
const SNAKES = [
  { tail: 'R1C3', value: 10, cmp: 'eq' },
  { tail: 'R1C5', value: 19, cmp: 'eq' },
  { tail: 'R1C7', value: 15, cmp: 'eq' },
  { tail: 'R2C9', value: 6, cmp: 'eq' },
  { tail: 'R5C9', value: 18, cmp: 'eq' },
  { tail: 'R7C9', value: 26, cmp: 'eq' },
  { tail: 'R9C7', value: 26, cmp: 'eq' },
  { tail: 'R9C5', value: 13, cmp: 'eq' },
  { tail: 'R9C2', value: 7, cmp: 'gt' },  // printed ">7"
  { tail: 'R2C1', value: 21, cmp: 'eq' },
  { tail: 'R5C1', value: 10, cmp: 'eq' },
].map((s, i) => ({ ...s, label: NONE + 1 + i }));

const ROCK = 'R5C5';
const LABEL_COUNT = NONE + SNAKES.length; // NONE=1, snake labels 2..12

const shape = new Shape(GRID, LABEL_COUNT);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const label = graph.makeOverlay('VG');

// Grid cells hold ordinary digits only; the widened range exists for labels.
const digitDomain = graph.makeReplicate(new Given(gridCells[0], ...DIGITS));

// Every cell is NONE or exactly one snake's label.
const labelDomain = label.makeReplicate(
  new Given(label.cells()[0], NONE, ...SNAKES.map(s => s.label)));

const tailGiven = SNAKES.map(s => new Given(label.at(s.tail), s.label));
const rockGiven = new Given(label.at(ROCK), NONE);

// --- Shape: same-label orthogonal degree is at most 2 everywhere. Reads a
// cell's own label, then each orthogonal neighbour's label, and rejects
// once more than two neighbours share it. Combined with ConnectedValues
// (below), a stray same-label cell that isn't attached to its snake's own
// component would be a second component and get rejected there; pinning
// the tail's own degree (further down, per branch) rules out a closed
// loop and fixes the path's start.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'own' },
  transition: (state, value) => {
    if (state.phase === 'own') {
      return value === NONE
        ? { phase: 'free' }
        : { phase: 'count', own: value, count: 0 };
    }
    if (state.phase === 'free') return { phase: 'free' };
    const count = state.count + (value === state.own ? 1 : 0);
    return count > 2 ? undefined : { phase: 'count', own: state.own, count };
  },
  accept: () => true, // any completed scan already kept degree <= 2
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'snake-degree',
  ...label.at([cell, ...graph.neighbours(cell)])));

// --- No orthogonal touch between different snakes (self-touch is already
// excluded by the degree machine above). One Pair template per direction
// (right, down already covers every edge once), Replicated over every
// origin that has such a neighbour.
const noCrossTouchKey = Pair.fnToKey(
  (a, b) => !(a !== NONE && b !== NONE && a !== b), geometry);
const varOrigin = label.cells()[0]; // R1C1's label cell
const edgeReplicate = (dR, dC) => {
  const starts = gridCells.filter(cell => graph.step(cell, dR, dC));
  const template = [new Pair(noCrossTouchKey, 'no-cross-snake-touch',
    varOrigin, label.at(graph.step(gridCells[0], dR, dC)))];
  return label.makeReplicate(template, label.at(starts));
};
const noCrossTouch = [edgeReplicate(0, 1), edgeReplicate(1, 0)];

// --- Each snake's own cells form one connected region.
const connectivity = SNAKES.map(s => new ConnectedValues('VG', s.label));

// --- Length + sum + no-repeat. For a candidate tail digit d, the label-i
// cells' digits form a set (bitmask) of size d summing to (>|==) the clue
// value; a repeated digit rejects mid-scan. One small NFA per (snake, d);
// `Or` over d because the branch must fix d before the scan can compare
// popcount/sum against it (see header note).
const digitsOfMask = (mask) => DIGITS.filter(d => mask & (1 << (d - 1)));
function contentsBranch(s, d) {
  const machine = NFA.encodeSpec({
    startState: { mask: 0, reading: false, own: false },
    transition: (state, value) => {
      if (!state.reading) {
        return { mask: state.mask, reading: true, own: value === s.label };
      }
      if (!state.own) return { mask: state.mask, reading: false, own: false };
      if (value > DIGITS.length) return undefined; // grid digits only
      const bit = 1 << (value - 1);
      if (state.mask & bit) return undefined; // no repeats within a snake
      return { mask: state.mask | bit, reading: false, own: false };
    },
    accept: (state) => {
      if (state.reading) return false;
      const digits = digitsOfMask(state.mask);
      if (digits.length !== d) return false;
      const sum = digits.reduce((a, b) => a + b, 0);
      return s.cmp === 'gt' ? sum > s.value : sum === s.value;
    },
  }, geometry.numValues);
  const contents = new NFA(machine, `snake-${s.label}-contents-${d}`,
    ...gridCells.flatMap(cell => [label.at(cell), cell]));

  // The tail is the path's forced end: 0 same-label neighbours when the
  // whole snake is just the tail (d === 1), otherwise exactly 1.
  const degreeTarget = d === 1 ? 0 : 1;
  const tailDegreeMachine = NFA.encodeSpec({
    startState: 0,
    transition: (count, value) =>
      Math.min(count + (value === s.label ? 1 : 0), degreeTarget + 1),
    accept: (count) => count === degreeTarget,
  }, geometry.numValues);
  const tailDegree = new NFA(tailDegreeMachine, `snake-${s.label}-tail-degree-${d}`,
    ...label.at(graph.neighbours(s.tail)));

  return new And([new Given(s.tail, d), contents, tailDegree]);
}
const lengthSum = SNAKES.map(s => new Or(DIGITS.map(d => contentsBranch(s, d))));

// --- Rock: no snake owns R5C5 (rockGiven, above), and no snake cell
// anywhere repeats the rock's own digit. Reads the rock's digit first (it
// is scanned as a bare value, not paired with a label), then every other
// cell's (label, digit) pair, rejecting a match on an owned cell.
const rockDigitMachine = NFA.encodeSpec({
  startState: { target: null, reading: false, pendingLabel: null },
  transition: (state, value) => {
    if (state.target === null) {
      return { target: value, reading: false, pendingLabel: null };
    }
    if (!state.reading) {
      return { target: state.target, reading: true, pendingLabel: value };
    }
    if (state.pendingLabel !== NONE && value === state.target) return undefined;
    return { target: state.target, reading: false, pendingLabel: null };
  },
  accept: (state) => state.target !== null && !state.reading,
}, geometry.numValues);
const rockOthers = gridCells.filter(cell => cell !== ROCK);
const rockDigitExclusion = new NFA(rockDigitMachine, 'rock-digit-excluded',
  ROCK, ...rockOthers.flatMap(cell => [label.at(cell), cell]));

// --- Exactly one of the rock's up-to-8 king neighbours (== box 5's other
// 8 cells) belongs to any snake.
const rockCountMachine = NFA.encodeSpec({
  startState: 0,
  transition: (count, value) => Math.min(count + (value !== NONE ? 1 : 0), 2),
  accept: (count) => count === 1,
}, geometry.numValues);
const rockTouch = new NFA(rockCountMachine, 'rock-touch-count',
  ...label.at(graph.kingNeighbours(ROCK)));

return [
  shape,
  label.toVar('snake label'),
  digitDomain,
  labelDomain,
  ...tailGiven,
  rockGiven,
  ...degrees,
  ...noCrossTouch,
  ...connectivity,
  ...lengthSum,
  rockDigitExclusion,
  rockTouch,
];
