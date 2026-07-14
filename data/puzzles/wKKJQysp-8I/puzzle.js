// Title: Japanese Sum Whisper Loop
// Author: yttrio
// Video: https://www.youtube.com/watch?v=wKKJQysp-8I
// Source: https://sudokupad.app/yttrio/japanese-sum-whisper-loop

// A VL overlay records loop membership: 1 is on and 2 is off. Degree two,
// diagonal non-touching, and ConnectedValues make the on cells one simple
// orthogonally-connected cycle. Pair NFAs apply German Whispers only where two
// orthogonally adjacent cells are on the loop. Row/column NFAs read alternating
// membership and digit cells to enforce the wildcard Japanese Sum sequences.
const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const loopCell = cell => loop.at(cell);
const gridCells = graph.cells();

const membership = [
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
];

// An on-loop cell has exactly two orthogonal on-loop neighbours. Off-loop cells
// impose no degree condition.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'cell' },
  transition: (state, value) => {
    if (state.phase === 'cell') {
      return value === ON ? { phase: 'neighbours', count: 0 } : { phase: 'off' };
    }
    if (state.phase === 'off') return { phase: 'off' };
    const count = state.count + (value === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'neighbours', count };
  },
  accept: state => state.phase === 'off' || state.count === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(
  degreeMachine,
  'loop-degree',
  ...loop.at([cell, ...graph.neighbours(cell)]),
));

// Forbid the 2x2 pattern in which only a diagonally opposite pair is on. This
// is the standard local no-diagonal-self-touch condition for a cell loop.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { cells: [] },
  transition: ({ cells }, value) => {
    if (cells === null) return { cells: null };
    const next = [...cells, value === ON];
    if (next.length < 4) return { cells: next };
    const [topLeft, topRight, bottomLeft, bottomRight] = next;
    const diagonalOnly =
      (topLeft && bottomRight && !topRight && !bottomLeft) ||
      (topRight && bottomLeft && !topLeft && !bottomRight);
    return diagonalOnly ? undefined : { cells: null };
  },
  accept: ({ cells }) => cells === null,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noDiagonalTouches = loop.makeReplicate(
  new NFA(
    noDiagonalTouchMachine,
    'no-diagonal-touch',
    ...loop.at(graph.block(gridCells[0], 2, 2)),
  ),
  loop.at(blockOrigins),
);

// Reads membership/digit pairs for one orthogonally adjacent grid-cell pair.
// If both cells are on the loop, their digits must differ by at least 5.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'a-membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'a-membership':
        return value === ON ? { phase: 'a-digit' } : { phase: 'skip', left: 3 };
      case 'a-digit':
        return { phase: 'b-membership', a: value };
      case 'b-membership':
        return value === ON
          ? { phase: 'b-digit', a: state.a }
          : { phase: 'skip', left: 1 };
      case 'b-digit':
        return Math.abs(state.a - value) >= 5 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 }
          : { phase: 'done' };
      case 'done':
        return { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const whispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(
    whisperMachine,
    'conditional-whisper',
    loopCell(cell), cell, loopCell(other), other,
  )));

// A Japanese Sum token describes the decimal width of one positive segment
// total: '?' matches 1-9, '??' matches 10-99, and '*' consumes zero or more
// whole segment totals. The NFA scans membership/digit pairs from the clue side.
function japaneseSumMachine(tokens) {
  const matches = (token, sum) => token.length === String(sum).length;

  const consumeSegment = (sum, tokenIndex) => {
    const nextIndices = [];
    if (tokens[tokenIndex] === '*') nextIndices.push(tokenIndex);

    let fixedIndex = tokenIndex;
    while (tokens[fixedIndex] === '*') fixedIndex++;
    if (fixedIndex < tokens.length && matches(tokens[fixedIndex], sum)) {
      nextIndices.push(fixedIndex + 1);
    }
    return [...new Set(nextIndices)];
  };

  const canFinish = tokenIndex => {
    while (tokens[tokenIndex] === '*') tokenIndex++;
    return tokenIndex === tokens.length;
  };

  return NFA.encodeSpec({
    startState: {
      phase: 'membership',
      previousOn: false,
      tokenIndex: 0,
      sum: 0,
    },
    transition: (state, value) => {
      if (state.phase === 'digit') {
        return {
          ...state,
          phase: 'membership',
          sum: state.currentOn ? state.sum + value : state.sum,
        };
      }

      if (state.previousOn && value === OFF) {
        return consumeSegment(state.sum, state.tokenIndex).map(tokenIndex => ({
          phase: 'digit',
          previousOn: false,
          currentOn: false,
          tokenIndex,
          sum: 0,
        }));
      }

      return {
        phase: 'digit',
        previousOn: value === ON,
        currentOn: value === ON,
        tokenIndex: state.tokenIndex,
        sum: value === ON && !state.previousOn ? 0 : state.sum,
      };
    },
    accept: state => {
      if (state.phase !== 'membership') return false;
      if (!state.previousOn) return canFinish(state.tokenIndex);
      return consumeSegment(state.sum, state.tokenIndex).some(canFinish);
    },
    // Nine membership/digit pairs are the complete input for one clued line.
    maxDepth: 18,
  }, geometry.numValues);
}

// Displayed order is outermost-to-innermost, which is the segment order seen
// while scanning each row from the left and each column from the top.
const japanesePatterns = [
  ['R2', ['?', '?', '??']],
  ['R3', ['*', '??']],
  ['R6', ['??', '?', '?', '?']],
  ['C6', ['*', '?']],
  ['C7', ['??', '??']],
  ['C8', ['?', '*']],
];
const japaneseSums = japanesePatterns.map(([line, tokens]) => {
  const index = Number(line.slice(1));
  const cells = line.startsWith('R') ? graph.row(index) : graph.column(index);
  return new NFA(
    japaneseSumMachine(tokens),
    `japanese-${line}`,
    ...cells.flatMap(cell => [loopCell(cell), cell]),
  );
});

return [
  new Shape('9x9'),
  new Given('R1C6', 5),
  loop.toVar('loop membership'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  noDiagonalTouches,
  ...whispers,
  ...japaneseSums,
];
