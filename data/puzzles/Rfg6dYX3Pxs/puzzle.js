// Title: Japanese Sum Dutch Loop
// Author: yttrio
// Video: https://www.youtube.com/watch?v=Rfg6dYX3Pxs
// Source: https://sudokupad.app/yttrio/japanese-sum-dutch-loop

// Rules encoded below, in order:
//   1. Normal sudoku (rows, columns and the nine 3x3 boxes hold 1-9). No givens.
//   2. Draw a one-cell-wide loop of orthogonally connected cells; the loop may
//      not touch itself, not even diagonally.
//   3. The loop acts as a Dutch Whispers line: adjacent digits on the loop
//      differ by at least 4.
//   4. Japanese sums: clues outside the grid give the sums of the loop segments
//      in that row or column, in order, cells off the loop separating segments.
//      A '?' is any digit 0-9 and no clue may have a leading zero; a '*' denotes
//      an arbitrary number (zero, one or several) of further clues.
// A row or column with no printed clue is unclued: it gets no constraint here.

const ON = 1;                   // loop-membership values, stored in the Var cells
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();

// The loop-membership Var cell paired with each grid cell (VL1..VL81, grid order).
const loop = graph.makeOverlay('VL');

// --- Loop membership: every cell is either on (1) or off (2) the loop. ---
const membership = loop.makeReplicate(new Given(loop.cells()[0], ON, OFF));

// --- Degree 2: each on-loop cell has exactly two on-loop orthogonal neighbours.
// Reads the membership of the cell, then of each of its orthogonal neighbours;
// off-loop cells are unconstrained. Degree 2 plus the ConnectedValues below makes
// the on-loop cells one simple cycle, which is the "one-cell-wide loop of
// orthogonally connected cells" that also may not touch itself orthogonally.
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

// --- No diagonal self-touch: forbid a 2x2 whose only on cells are a diagonal.
// Reads the four membership cells of a 2x2 block, left-to-right then top-to-bottom.
// Two diagonally adjacent loop cells are legal only as the arms of a turn, which
// puts a third loop cell in the same 2x2; with neither shared neighbour on the
// loop the two cells are a diagonal touch.
const noDiagonalTouchMachine = NFA.encodeSpec({
  // `block` accumulates the 2x2's membership flags, and becomes null once the
  // block has passed the check (all further symbols are absorbed).
  startState: { block: [] },
  transition: ({ block }, membership) => {
    if (block === null) return { block: null };
    const next = [...block, membership === ON];
    if (next.length < 4) return { block: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { block: null };
  },
  accept: ({ block }) => block === null,
}, geometry.numValues);
// One template at the top-left block, stamped onto every in-grid 2x2 position.
const noDiagonalTouches = loop.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'no-touch',
    ...loop.at(graph.block(gridCells[0], 2, 2))),
  loop.at(gridCells.filter(cell => graph.block(cell, 2, 2))));

// --- Dutch Whispers along the loop: two orthogonally adjacent cells that are
// both on the loop are consecutive on it, so their digits must differ by >= 4.
// Reads (membership, digit) for each cell of the pair; if either cell is off the
// loop the pair is unconstrained and the remaining symbols are absorbed by a
// skip countdown.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'aOn' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aOn':
        return value === ON ? { phase: 'aDigit' } : { phase: 'skip', left: 3 };
      case 'aDigit':
        return { phase: 'bOn', aDigit: value };
      case 'bOn':
        return value === ON
          ? { phase: 'bDigit', aDigit: state.aDigit }
          : { phase: 'skip', left: 1 };
      case 'bDigit':
        return Math.abs(state.aDigit - value) >= 4 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } : { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
// Right/down steps only, so each orthogonal pair is covered exactly once.
const whispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dR, dC]) => graph.step(cell, dR, dC))
  .filter(Boolean)
  .map(other => new NFA(whisperMachine, 'whisper',
    loop.at(cell), cell, loop.at(other), other)));

// --- Japanese sums. -------------------------------------------------------
// The clue texts, transcribed from the text marks printed outside the frame and
// listed in printed reading order: left to right beside a row, top to bottom
// above a column, which is the order of the segments they describe.
const STAR = '*';
const rowClues = {
  1: ['?', '??'],
  2: ['??', STAR],
  4: ['2?', '?', '?'],
  7: [STAR, '?0'],
};
const columnClues = {
  3: ['??', STAR],
  6: [STAR, '?3', STAR],
  7: ['?', STAR],
};

// A lane holds the nine distinct digits 1-9, so no segment can sum above 45.
const MAX_SEGMENT_SUM = 45;
// Running sums are clamped here; the value is outside every clue's set, so it is
// a sink meaning "this segment can no longer match any clue".
const SUM_OVERFLOW = MAX_SEGMENT_SUM + 1;

// The totals a clue text admits: each '?' is a free digit, a literal digit is
// fixed, and the leading digit is never 0.
const clueTotals = (text) => {
  const totals = [...text].reduce((partials, ch, position) => {
    const digits = ch !== '?' ? [Number(ch)]
      : position === 0 ? [1, 2, 3, 4, 5, 6, 7, 8, 9]
        : [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    return partials.flatMap(partial => digits.map(d => partial * 10 + d));
  }, [0]);
  return new Set(totals.filter(total => total <= MAX_SEGMENT_SUM));
};

// A lane's clue list becomes a pattern of items: STAR, or the set of totals the
// clue admits. `at` below is a position in this pattern.
const cluePattern = (clues) => clues.map(
  clue => clue === STAR ? STAR : clueTotals(clue));

// Positions the pattern can be in after a segment of the given sum closes. A STAR
// may absorb the segment (position unchanged) or be skipped; the first non-STAR
// item reached must match the sum and then advances past it. Several positions can
// be live at once, which is why the machine branches here.
const afterSegment = (pattern, at, sum) => {
  const positions = [];
  let index = at;
  while (index < pattern.length && pattern[index] === STAR) {
    positions.push(index);
    index += 1;
  }
  if (index < pattern.length && pattern[index].has(sum)) positions.push(index + 1);
  return positions;
};
// The lane is complete when only STARs (which may absorb nothing) remain.
const patternComplete = (pattern, at) => pattern.slice(at).every(item => item === STAR);

// One machine per clued lane, scanning the lane as
// (membership, digit) for each cell in segment order. `sum` is null between
// segments and the running total inside one; `at` is the pattern position.
const japaneseSumMachine = (pattern) => NFA.encodeSpec({
  startState: { phase: 'flag', at: 0, sum: null },
  transition: (state, value) => {
    if (state.phase === 'digit') {
      // `on` says whether this digit's cell is on the loop, so whether it counts.
      const sum = state.on
        ? Math.min(state.sum + value, SUM_OVERFLOW)
        : state.sum;
      return { phase: 'flag', at: state.at, sum };
    }
    if (value === ON) {
      // Open a new segment at 0, or carry on with the current one.
      return {
        phase: 'digit', at: state.at, on: true,
        sum: state.sum === null ? 0 : state.sum,
      };
    }
    if (state.sum === null) {
      return { phase: 'digit', at: state.at, sum: null, on: false };
    }
    // An off-loop cell closes the segment that was running.
    return afterSegment(pattern, state.at, state.sum).map(
      at => ({ phase: 'digit', at, sum: null, on: false }));
  },
  // The scan ends mid-segment when the lane's last cell is on the loop; that
  // segment still has to close against the pattern.
  accept: (state) => state.sum === null
    ? patternComplete(pattern, state.at)
    : afterSegment(pattern, state.at, state.sum).some(
      at => patternComplete(pattern, at)),
}, geometry.numValues);

const laneConstraints = (clues, laneCells) => {
  const machine = japaneseSumMachine(cluePattern(clues));
  return new NFA(machine, 'japanese-sum',
    ...laneCells.flatMap(cell => [loop.at(cell), cell]));
};
const japaneseSums = [
  ...Object.entries(rowClues).map(
    ([row, clues]) => laneConstraints(clues, graph.row(Number(row)))),
  ...Object.entries(columnClues).map(
    ([column, clues]) => laneConstraints(clues, graph.column(Number(column)))),
];

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  membership,
  // Single loop: the on-loop cells form one orthogonally-connected region.
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...whispers,
  ...japaneseSums,
];
