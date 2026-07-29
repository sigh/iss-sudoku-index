// Title: Doubling Loop
// Author: yttrio
// Video: https://www.youtube.com/watch?v=97ceVXnYotc
// Source: https://sudokupad.app/gomrgn0npb

// Standard Sudoku. A VC overlay marks a single non-touching loop (1 = on,
// 2 = off). Arrow digits on the loop contribute twice their displayed value.

const ON = 1;
const OFF = 2;
const graph = cellGraph('9x9');
const loop = graph.makeOverlay('VC');
const cells = graph.cells();

const degreeSpec = NFA.encodeSpec({
  startState: { first: true, count: 0, on: false },
  transition: ({ first, count, on }, value) => {
    if (first) return { first: false, count: 0, on: value === ON };
    if (!on) return { first: false, count: 0, on: false };
    const next = count + (value === ON ? 1 : 0);
    return next > 2 ? undefined : { first: false, count: next, on: true };
  },
  accept: ({ on, count }) => !on || count === 2,
}, 9);

const noTouchSpec = NFA.encodeSpec({
  startState: { values: [] },
  transition: ({ values }, value) => {
    if (values.length === 4) return { values };
    const next = [...values, value === ON];
    if (next.length < 4) return { values: next };
    const [a, b, c, d] = next;
    return (a && d && !b && !c) || (b && c && !a && !d) ? undefined : { values: next };
  },
  accept: ({ values }) => values.length === 4,
}, 9);

const arrowSpec = NFA.encodeSpec({
  startState: { phase: 'bulbMark' },
  transition: (state, value) => {
    if (state.phase === 'bulbMark') return { phase: 'bulbDigit', bulbMark: value };
    if (state.phase === 'bulbDigit') return { phase: 'armMark', target: value * (state.bulbMark === ON ? 2 : 1), sum: 0 };
    if (state.phase === 'armMark') return { phase: 'armDigit', target: state.target, sum: state.sum, mark: value };
    if (state.phase === 'armDigit') {
      const sum = state.sum + value * (state.mark === ON ? 2 : 1);
      return sum > state.target ? undefined : { phase: 'armMark', target: state.target, sum };
    }
  },
  accept: ({ phase, target, sum }) => phase === 'armMark' && sum === target,
}, 9);

const arrows = [
  ['R1C1','R1C2','R1C3','R1C4','R1C5','R1C6'], ['R1C7','R2C7','R3C7','R4C7'], ['R1C9','R2C9'],
  ['R4C5','R5C5','R6C5','R7C5','R8C5','R9C5'], ['R5C2','R6C2','R7C2','R8C2','R9C2'], ['R7C3','R6C3','R5C3'],
  ['R7C4','R6C4','R5C4'], ['R9C4','R8C4','R8C3','R9C3'], ['R6C7','R7C7','R8C7','R9C7'],
  ['R7C8','R6C8','R5C8'], ['R8C9','R7C9','R6C9'], ['R2C2','R2C3','R2C4'],
];
const interior = cells.filter(cell => {
  const { row, col } = parseCellId(cell);
  return row > 1 && row < 9 && col > 1 && col < 9;
});
const boundary = cells.filter(cell => !interior.includes(cell));
const blockStarts = cells.filter(cell => graph.block(cell, 2, 2));

return [
  new Shape('9x9'),
  loop.toVar('loop membership'),
  loop.makeReplicate(new Given(loop.cells()[0], ON, OFF)),
  new ConnectedValues('VC', ON),
  // lint-ok: bare-replicate-constructor
  new Replicate([new NFA(degreeSpec, 'loop degree', loop.at('R2C2'), ...loop.at(graph.neighbours('R2C2')))], Replicate.encodeTargetCells(loop.at(interior), loop.at('R2C2'), loop), loop.at('R2C2')),
  ...boundary.map(cell => new NFA(degreeSpec, 'loop degree', loop.at(cell), ...loop.at(graph.neighbours(cell)))),
  loop.makeReplicate(new NFA(noTouchSpec, 'no diagonal touch', ...loop.at(graph.block('R1C1', 2, 2))), loop.at(blockStarts)),
  ...arrows.map(path => new NFA(arrowSpec, 'doubled arrow', ...path.flatMap(cell => [loop.at(cell), cell]))),
];
