// Title: Whispers in the maze
// Author: Ryan Adams
// Video: https://www.youtube.com/watch?v=l8XOG9Vg6Q0
// Source: https://sudokupad.app/zyutsxhylp

// Normal sudoku, with the value range widened to 1-11 so one Var overlay can
// encode the 11 path shapes. Real grid cells are immediately restricted back
// to 1-9. R5C5 and R3C1 are the degree-1 endpoints; every other cell is off the
// path or has degree 2. Adjacent cells agree on shared edges, decoded wall
// edges are forced off, and selected edges are German Whispers. This local
// encoding does not forbid extra disconnected cycles.

const OFF = 1;
const U = 2;
const D = 3;
const L = 4;
const R = 5;
const HORIZ = 6;
const VERT = 7;
const UL = 8;
const UR = 9;
const DL = 10;
const DR = 11;
const VALUE_COUNT = 11;

const ENDPOINT_SHAPES = [U, D, L, R];
const MIDDLE_SHAPES = [OFF, HORIZ, VERT, UL, UR, DL, DR];
const GRID_DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9];

const usesUp = shape => shape === U || shape === VERT || shape === UL || shape === UR;
const usesDown = shape => shape === D || shape === VERT || shape === DL || shape === DR;
const usesLeft = shape => shape === L || shape === HORIZ || shape === UL || shape === DL;
const usesRight = shape => shape === R || shape === HORIZ || shape === UR || shape === DR;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shape = graph.makeOverlay('VS');
const shapeCell = cell => shape.at(cell);
const gridCells = graph.cells();
const constraints = [
  new Shape('9x9', 11),
  shape.toVar('path shape'),
];
const add = (...newConstraints) => constraints.push(...newConstraints);

const lessThan = Pair.fnToKey((a, b) => a < b, VALUE_COUNT);
const rightAgree = Pair.fnToKey((a, b) => usesRight(a) === usesLeft(b), VALUE_COUNT);
const downAgree = Pair.fnToKey((a, b) => usesDown(a) === usesUp(b), VALUE_COUNT);

function wallEdgeKeys(lines) {
  const keys = new Set();
  for (const line of lines) {
    for (let i = 1; i < line.length; i++) {
      const [r1, c1] = line[i - 1];
      const [r2, c2] = line[i];
      if (r1 === r2) {
        const row = r1;
        const minCol = Math.min(c1, c2);
        const maxCol = Math.max(c1, c2);
        if (row >= 1 && row <= 8) {
          for (let col = minCol + 1; col <= maxCol; col++) {
            if (col >= 1 && col <= 9) keys.add(`D:R${row}C${col}`);
          }
        }
      } else if (c1 === c2) {
        const col = c1;
        const minRow = Math.min(r1, r2);
        const maxRow = Math.max(r1, r2);
        if (col >= 1 && col <= 8) {
          for (let row = minRow + 1; row <= maxRow; row++) {
            if (row >= 1 && row <= 9) keys.add(`R:R${row}C${col}`);
          }
        }
      }
    }
  }
  return keys;
}

const wallEdges = wallEdgeKeys([
  [[8, 2], [6, 2], [6, 6], [8, 6]],
  [[6, 2], [4, 2], [4, 3]],
  [[6, 4], [7, 4]],
  [[6, 5], [4, 5], [4, 4], [5, 4]],
  [[6, 6], [6, 8]],
  [[7, 6], [7, 7]],
  [[4, 4], [3, 4], [3, 2], [2, 2]],
  [[3, 2], [3, 0], [9, 0], [9, 9], [0, 9], [0, 6], [1, 6]],
  [[9, 3], [8, 3]],
  [[9, 5], [8, 5]],
  [[9, 7], [8, 7]],
  [[5, 9], [5, 7]],
  [[1, 9], [1, 8]],
  [[0, 6], [0, 0], [2, 0], [2, 1]],
  [[2, 6], [3, 6], [3, 8]],
  [[3, 7], [2, 7]],
  [[5, 6], [3, 6], [3, 5]],
  [[8, 1], [4, 1]],
  [[7, 8], [8, 8]],
  [[1, 3], [2, 3]],
  [[1, 1], [1, 2]],
]);

function allowedShapes(cell) {
  const { row, col } = parseCellId(cell);
  return (cell === 'R5C5' || cell === 'R3C1' ? ENDPOINT_SHAPES : MIDDLE_SHAPES)
    .filter(shapeValue =>
      !(row === 1 && usesUp(shapeValue)) &&
      !(row === geometry.numRows && usesDown(shapeValue)) &&
      !(col === 1 && usesLeft(shapeValue)) &&
      !(col === geometry.numCols && usesRight(shapeValue))
    );
}

function canUse(shapeValue, direction) {
  if (direction === 'R') return usesRight(shapeValue);
  if (direction === 'D') return usesDown(shapeValue);
  if (direction === 'L') return usesLeft(shapeValue);
  return usesUp(shapeValue);
}

const edgeWhisper = (toB) => NFA.encodeSpec({
  startState: { phase: 'shape' },
  transition: (state, value) => {
    if (state.phase === 'shape') return { phase: 'digitA', selected: toB(value) };
    if (state.phase === 'digitA') return { phase: 'digitB', selected: state.selected, digitA: value };
    if (!state.selected) return { phase: 'done' };
    return Math.abs(state.digitA - value) >= 5 ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, VALUE_COUNT);

const rightWhisper = edgeWhisper(usesRight);
const downWhisper = edgeWhisper(usesDown);

function shapeDomain(cell) {
  let shapes = allowedShapes(cell);
  if (wallEdges.has(`R:${cell}`)) shapes = shapes.filter(shapeValue => !canUse(shapeValue, 'R'));
  if (wallEdges.has(`D:${cell}`)) shapes = shapes.filter(shapeValue => !canUse(shapeValue, 'D'));
  const leftNeighbour = graph.step(cell, 0, -1);
  const upNeighbour = graph.step(cell, -1, 0);
  if (leftNeighbour && wallEdges.has(`R:${leftNeighbour}`)) {
    shapes = shapes.filter(shapeValue => !canUse(shapeValue, 'L'));
  }
  if (upNeighbour && wallEdges.has(`D:${upNeighbour}`)) {
    shapes = shapes.filter(shapeValue => !canUse(shapeValue, 'U'));
  }
  return shapes;
}

add(new Replicate(
  [new Given('R1C1', ...GRID_DIGITS)],
  Replicate.encodeTargetCells(gridCells, 'R1C1', graph),
  'R1C1',
));

const shapeDomainGroups = new Map();
for (const cell of gridCells) {
  const shapes = shapeDomain(cell);
  const key = shapes.join('_');
  if (!shapeDomainGroups.has(key)) shapeDomainGroups.set(key, { shapes, cells: [] });
  shapeDomainGroups.get(key).cells.push(cell);
}

for (const { shapes, cells } of shapeDomainGroups.values()) {
  const origin = shapeCell(cells[0]);
  add(new Replicate(
    [new Given(origin, ...shapes)],
    Replicate.encodeTargetCells(cells.map(shapeCell), origin, shape),
    origin,
  ));
}

const rightCells = gridCells.filter(cell => graph.step(cell, 0, 1));
add(new Replicate(
  [new Pair(rightAgree, 'path-edge', shapeCell('R1C1'), shapeCell('R1C2'))],
  Replicate.encodeTargetCells(rightCells.map(shapeCell), shapeCell('R1C1'), shape),
  shapeCell('R1C1'),
));

const downCells = gridCells.filter(cell => graph.step(cell, 1, 0));
add(new Replicate(
  [new Pair(downAgree, 'path-edge', shapeCell('R1C1'), shapeCell('R2C1'))],
  Replicate.encodeTargetCells(downCells.map(shapeCell), shapeCell('R1C1'), shape),
  shapeCell('R1C1'),
));

for (const cell of gridCells) {
  const rightNeighbour = graph.step(cell, 0, 1);
  if (rightNeighbour) {
    add(new NFA(rightWhisper, 'maze-whisper', shapeCell(cell), cell, rightNeighbour));
  }

  const downNeighbour = graph.step(cell, 1, 0);
  if (downNeighbour) {
    add(new NFA(downWhisper, 'maze-whisper', shapeCell(cell), cell, downNeighbour));
  }
}

add(
  new WhiteDot('R4C6', 'R5C6'),
  new Pair(lessThan, 'arrow points to smaller digit', 'R1C1', 'R1C2'),
  new SameValues(2, 'R2C9', 'R9C8'),
);

return constraints;
