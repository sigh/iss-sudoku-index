// Title: Whisper Loop-de-Loop
// Author: yttrio
// Video: https://www.youtube.com/watch?v=RsoI-EQ85R0
// Source: https://app.crackingthecryptic.com/sudoku/RDQq2T2rpG

// Standard Sudoku applies. A discovered one-cell-wide orthogonal loop enters
// every drawn cage, does not touch itself even diagonally, and gives adjacent
// loop digits a German Whisper difference of at least 5. Cage digits are
// distinct and their drawn totals count each loop digit twice.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const ON = [HORIZ, VERT, UL, UR, DL, DR];
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;

const graph = cellGraph('9x9');
const shape = graph.makeOverlay('VL');
const cells = graph.cells();
const loop = cell => shape.at(cell);
const interleave = clueCells => clueCells.flatMap(cell => [cell, loop(cell)]);

// Shape values describe the two used edges of an on-loop cell. Border domains
// are derived from which neighbour edges exist in the 9x9 grid.
const domains = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = [OFF, ...ON].filter(s =>
    !(row === 1 && usesUp(s)) && !(row === 9 && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === 9 && usesRight(s)));
  return new Given(loop(cell), ...allowed);
});

// A neighbouring pair agrees on its shared used edge; when it is used, the
// pair's Sudoku digits differ by at least five.
const edgeRule = (toB, toA) => Pair.fnToKey(
  (a, b) => toB(a) === toA(b), 9);
const touchRule = toB => Pair.fnToKey(
  (a, b) => a === OFF || b === OFF || toB(a), 9);
const whisperRule = toB => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'a', joined: toB(value) };
    if (state.phase === 'a') return { phase: 'b', joined: state.joined, a: value };
    return !state.joined || Math.abs(state.a - value) >= 5 ? { done: true } : undefined;
  },
  accept: state => state.done === true,
}, 9);
const edgeRight = edgeRule(usesRight, usesLeft);
const edgeDown = edgeRule(usesDown, usesUp);
const touchRight = touchRule(usesRight);
const touchDown = touchRule(usesDown);
const whisperRight = whisperRule(usesRight);
const whisperDown = whisperRule(usesDown);
// A 2x2 may not have only a diagonal pair of loop cells: that is a diagonal
// self-touch. The machine reads the block in row-major order.
const noDiagonalTouch = NFA.encodeSpec({
  startState: { block: [] },
  transition: (state, value) => {
    if (state.block === null) return state;
    const block = [...state.block, value !== OFF];
    if (block.length < 4) return { block };
    const [a, b, c, d] = block;
    return (a && d && !b && !c) || (b && c && !a && !d)
      ? undefined : { block: null };
  },
  accept: state => state.block === null,
}, 9);
const rightStarts = cells.filter(cell => parseCellId(cell).col < 9);
const downStarts = cells.filter(cell => parseCellId(cell).row < 9);
const downRightStarts = cells.filter(cell => {
  const { row, col } = parseCellId(cell);
  return row < 9 && col < 9;
});
const downLeftStarts = cells.filter(cell => {
  const { row, col } = parseCellId(cell);
  return row < 9 && col > 1;
});
const neighbourRules = cells.flatMap(cell => {
  const right = graph.step(cell, 0, 1);
  const down = graph.step(cell, 1, 0);
  const downRight = graph.step(cell, 1, 1);
  const downLeft = graph.step(cell, 1, -1);
  return [
    ...(right ? [
      new NFA(whisperRight, 'whisper-horizontal', loop(cell), cell, right),
    ] : []),
    ...(down ? [
      new NFA(whisperDown, 'whisper-vertical', loop(cell), cell, down),
    ] : []),
  ];
});

// Each NFA scans cage digits interleaved with their loop shapes and accumulates
// a digit once off-loop or twice on-loop.
const cageSum = total => NFA.encodeSpec({
  startState: { phase: 'digit', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'digit') return { phase: 'shape', digit: value, sum: state.sum };
    const sum = state.sum + state.digit * (value === OFF ? 1 : 2);
    return sum <= total ? { phase: 'digit', sum } : undefined;
  },
  accept: state => state.phase === 'digit' && state.sum === total,
}, 9);
const hasLoopCell = NFA.encodeSpec({
  startState: { on: false },
  transition: (state, value) => ({ on: state.on || value !== OFF }),
  accept: state => state.on,
}, 9);
// Cages, provenance: the seven numbered entries in the source cages array.
const cages = [
  [7, ['R7C4', 'R7C5', 'R7C6']],
  [23, ['R9C4', 'R9C5', 'R9C6']],
  [14, ['R1C4', 'R1C5', 'R1C6']],
  [23, ['R2C9', 'R3C9']],
  [20, ['R2C1', 'R3C1']],
  [11, ['R6C1', 'R7C1']],
  [24, ['R4C5', 'R5C5', 'R6C5']],
];

return [
  new Shape('9x9'),
  shape.toVar('loop shapes'),
  ...domains,
  new ConnectedValues('VL', ON),
  shape.makeReplicate(
    new Pair(edgeRight, 'loop-edge-horizontal', loop('R1C1'), loop('R1C2')),
    shape.at(rightStarts)),
  shape.makeReplicate(
    new Pair(edgeDown, 'loop-edge-vertical', loop('R1C1'), loop('R2C1')),
    shape.at(downStarts)),
  shape.makeReplicate(
    new Pair(touchRight, 'no-touch-horizontal', loop('R1C1'), loop('R1C2')),
    shape.at(rightStarts)),
  shape.makeReplicate(
    new Pair(touchDown, 'no-touch-vertical', loop('R1C1'), loop('R2C1')),
    shape.at(downStarts)),
  shape.makeReplicate(
    new NFA(noDiagonalTouch, 'no-touch-diagonal',
      loop('R1C1'), loop('R1C2'), loop('R2C1'), loop('R2C2')),
    shape.at(downRightStarts)),
  ...neighbourRules,
  ...cages.flatMap(([total, cageCells]) => [
    new AllDifferent(...cageCells),
    new NFA(cageSum(total), `doubled-cage-sum-${total}`, ...interleave(cageCells)),
    new NFA(hasLoopCell, 'loop-enters-cage', ...loop(cageCells)),
  ]),
];
