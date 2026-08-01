// Title: Public Secrecy
// Author: shadow-nexus
// Video: https://www.youtube.com/watch?v=W8jyEch7baE
// Source: https://sudokupad.app/Nf89TQFtH2

// Normal Sudoku. A green cell is on an orthogonal, non-crossing loop that may
// touch itself; joined digits differ by at least 5. The loop visits every box.
// In unclued boxes 4--9, its matching digit has exactly that many off-loop cells
// in its surrounding 3x3 neighbourhood. Omitted: the unknown secret-digit rules
// and requiring the edge shapes to make one closed loop through the green cell.

const OFF = 1, HORIZ = 2, VERT = 3, UL = 4, UR = 5, DL = 6, DR = 7;
const usesUp = s => s === VERT || s === UL || s === UR;
const usesDown = s => s === VERT || s === DL || s === DR;
const usesLeft = s => s === HORIZ || s === UL || s === DL;
const usesRight = s => s === HORIZ || s === UR || s === DR;
const ALL_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');
const cells = graph.cells();

// Shape codes record the two used edges in each loop cell. Border-facing edges
// are unavailable, and matching codes on neighbours make each used edge join.
const shapeDomains = cells.map(cell => {
  const { row, col } = parseCellId(cell);
  const allowed = ALL_SHAPES.filter(s =>
    !(row === 1 && usesUp(s)) && !(row === 9 && usesDown(s)) &&
    !(col === 1 && usesLeft(s)) && !(col === 9 && usesRight(s)));
  return new Given(shape.at(cell), ...allowed);
});

const difference = toB => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'first', joined: toB(value) };
    if (state.phase === 'first') return { phase: 'second', joined: state.joined, digit: value };
    return !state.joined || Math.abs(state.digit - value) >= 5 ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

const agreeRight = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), 9);
const agreeDown = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), 9);
const diffRight = difference(usesRight);
const diffDown = difference(usesDown);
const horizontalOrigins = cells.filter(cell => graph.step(cell, 0, 1));
const verticalOrigins = cells.filter(cell => graph.step(cell, 1, 0));
const joins = [
  shape.makeReplicate(new Pair(agreeRight, 'join-h', ...shape.at(['R1C1', 'R1C2'])),
    shape.at(horizontalOrigins)),
  shape.makeReplicate(new Pair(agreeDown, 'join-v', ...shape.at(['R1C1', 'R2C1'])),
    shape.at(verticalOrigins)),
];
const edgeRules = cells.flatMap(cell => {
  const right = graph.step(cell, 0, 1), down = graph.step(cell, 1, 0);
  return [
    ...(right ? [new NFA(diffRight, 'whisper-h', shape.at(cell), cell, right)] : []),
    ...(down ? [new NFA(diffDown, 'whisper-v', shape.at(cell), cell, down)] : []),
  ];
});

const boxVisited = NFA.encodeSpec({
  startState: false,
  transition: (seen, value) => seen || value !== OFF,
  accept: seen => seen,
}, 9);
// For each possible location of its box number, count the surrounding 3x3
// shape cells. If the location is not that number, the condition is inactive.
const offCount = (boxNumber) => NFA.encodeSpec({
  startState: { digit: null, off: 0 },
  transition: (state, value) => state.digit === null
    ? { digit: value, off: 0 }
    : { digit: state.digit, off: state.off + (value === OFF ? 1 : 0) },
  accept: state => state.digit !== boxNumber || state.off === boxNumber,
  maxDepth: 10,
}, 9);

const boxRules = Array.from({ length: 9 }, (_, i) => {
  const box = i + 1, row = Math.floor(i / 3) * 3 + 1, col = (i % 3) * 3 + 1;
  const boxCells = graph.block(makeCellId(row, col), 3, 3);
  const counts = box < 4 ? [] : boxCells.map(cell =>
    new NFA(offCount(box), 'box-off-count', cell, ...shape.at([cell, ...graph.kingNeighbours(cell)])));
  return [new NFA(boxVisited, 'box-visited', ...shape.at(boxCells)), ...counts];
});

return [
  new Shape('9x9'),
  shape.toVar('loop shapes'),
  new Given('R2C2', 4),
  new Given('R3C5', 5),
  new Given(shape.at('R2C8'), ...ALL_SHAPES.filter(s => s !== OFF)),
  ...shapeDomains,
  ...joins,
  ...edgeRules,
  ...boxRules.flat(),
];
