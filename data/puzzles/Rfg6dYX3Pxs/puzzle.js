// Title: Japanese Sum Dutch Loop
// Author: yttrio
// Video: https://www.youtube.com/watch?v=Rfg6dYX3Pxs
// Source: https://sudokupad.app/yttrio/japanese-sum-dutch-loop

// A VL overlay marks loop membership: 1 is on the loop and 2 is off it.
// Degree two, diagonal non-touching, and ConnectedValues make the on cells one
// orthogonally-connected simple cycle. A conditional NFA puts Dutch Whispers
// differences on exactly its used orthogonal edges.
const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const loop = graph.makeOverlay('VL');
const loopCell = cell => loop.at(cell);
const gridCells = graph.cells();

const origin = loop.cells()[0];
const membership = [loop.makeReplicate(new Given(origin, ON, OFF))];

// An on cell has exactly two on-loop orthogonal neighbours; an off cell is free.
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, count }, value) => {
    if (phase === 'start') {
      return value === ON ? { phase: 'on', count: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === ON ? 1 : 0);
    return next > 2 ? undefined : { phase: 'on', count: next };
  },
  accept: ({ phase, count }) => phase === 'off' || count === 2,
}, geometry.numValues);
const degrees = gridCells.map(cell => new NFA(degreeMachine, 'degree',
  loopCell(cell), ...graph.neighbours(cell).map(loopCell)));

// No 2x2 block may have just its two diagonal cells on the loop.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: { cells: [] },
  transition: ({ cells }, value) => {
    if (cells === null) return { cells: null };
    const next = [...cells, value === ON];
    if (next.length < 4) return { cells: next };
    const [a, b, c, d] = next;
    return (a && d && !b && !c) || (b && c && !a && !d)
      ? undefined : { cells: null };
  },
  accept: ({ cells }) => cells === null,
}, geometry.numValues);
const noDiagonalTouches = gridCells
  .map(cell => graph.block(cell, 2, 2))
  .filter(Boolean)
  .map(block => new NFA(noDiagonalTouchMachine, 'no-diagonal-touch',
    ...block.map(loopCell)));

// The machine reads membership/digit pairs for an orthogonal neighbour pair.
const whisperMachine = NFA.encodeSpec({
  startState: { phase: 'a-membership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'a-membership':
        return value === ON ? { phase: 'a-digit' } : { phase: 'skip', left: 3 };
      case 'a-digit':
        return { phase: 'b-membership', a: value };
      case 'b-membership':
        return value === ON ? { phase: 'b-digit', a: state.a } :
          { phase: 'skip', left: 1 };
      case 'b-digit':
        return Math.abs(state.a - value) >= 4 ? { phase: 'done' } : undefined;
      case 'skip':
        return state.left > 1 ? { phase: 'skip', left: state.left - 1 } :
          { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const whispers = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dr, dc]) => graph.step(cell, dr, dc))
  .filter(Boolean)
  .map(other => new NFA(whisperMachine, 'dutch-whisper',
    loopCell(cell), cell, loopCell(other), other)));

// A Japanese-sum pattern is a list of decimal sum tokens. '?' matches one
// decimal digit and '*' consumes zero or more whole loop segments.
function japanesePatternMachine(tokens) {
  const matches = (token, sum) => {
    const text = String(sum);
    return token.length === text.length && [...token]
      .every((char, index) => char === '?' || char === text[index]);
  };
  const consume = (sum, index) => {
    const next = [];
    if (tokens[index] === '*') next.push(index);
    let probe = index;
    while (tokens[probe] === '*') probe++;
    if (probe < tokens.length && matches(tokens[probe], sum)) next.push(probe + 1);
    return [...new Set(next)];
  };
  const canFinish = index => {
    while (tokens[index] === '*') index++;
    return index === tokens.length;
  };
  return NFA.encodeSpec({
    startState: { expect: 'membership', on: false, index: 0, sum: 0 },
    transition: (state, value) => {
      if (state.expect === 'digit') {
        return state.on
          ? { ...state, expect: 'membership', sum: state.sum + value }
          : { ...state, expect: 'membership' };
      }
      if (state.on && value === OFF) {
        return consume(state.sum, state.index).map(index =>
          ({ expect: 'digit', on: false, index, sum: 0 }));
      }
      return {
        expect: 'digit',
        on: value === ON,
        index: state.index,
        sum: 0,
      };
    },
    accept: state => {
      if (state.expect !== 'membership') return false;
      if (!state.on) return canFinish(state.index);
      return consume(state.sum, state.index).some(canFinish);
    },
  }, geometry.numValues);
}

const japanesePatterns = [];
const japaneseSums = japanesePatterns.map(([line, tokens]) => {
  const number = Number(line.slice(1));
  const cells = line[0] === 'R'
    ? graph.row(number)
    : graph.column(number);
  return new NFA(japanesePatternMachine(tokens), `japanese-${line}`,
    ...cells.flatMap(cell => [loopCell(cell), cell]));
});

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  ...membership,
  new ConnectedValues('VL', ON),
  ...degrees,
  ...noDiagonalTouches,
  ...whispers,
  ...japaneseSums,
];
