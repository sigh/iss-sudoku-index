// Title: Square Sprinkled Donuts
// Author: Sq4nder
// Video: https://www.youtube.com/watch?v=lY9YsqOO19E
// Source: https://sudokupad.app/u2jrdq2b7p

// Each shaded cell is a donut hole. The donut consists of the eight cells
// around that hole. All sprinkles are given only on orthogonally adjacent
// pairs within each donut ring, excluding pairs that touch the hole.

const shadedCells = [
  'R2C2', 'R2C5', 'R2C8',
  'R5C8', 'R5C5', 'R5C2',
  'R8C2', 'R8C5', 'R8C8',
];

const donutHoles = shadedCells;

const whiteDots = [
  ['R1C1', 'R2C1'],
  ['R2C1', 'R3C1'],
  ['R3C1', 'R3C2'],
  ['R2C3', 'R3C3'],
  ['R4C1', 'R5C1'],
  ['R7C3', 'R8C3'],
  ['R9C5', 'R9C6'],
  ['R8C6', 'R9C6'],
  ['R7C5', 'R7C6'],
  ['R2C4', 'R3C4'],
  ['R4C7', 'R5C7'],
  ['R8C9', 'R9C9'],
];

const blackDots = [
  ['R1C4', 'R2C4'],
  ['R1C6', 'R2C6'],
  ['R1C2', 'R1C3'],
  ['R4C1', 'R4C2'],
  ['R9C4', 'R9C5'],
  ['R7C6', 'R8C6'],
  ['R6C8', 'R6C9'],
  ['R5C9', 'R6C9'],
];

const xMarks = [
  ['R1C7', 'R2C7'],
  ['R2C9', 'R3C9'],
  ['R4C6', 'R5C6'],
  ['R6C5', 'R6C6'],
  ['R7C4', 'R8C4'],
  ['R7C2', 'R7C3'],
  ['R9C1', 'R9C2'],
  ['R4C7', 'R4C8'],
];

const vMarks = [
  ['R1C3', 'R2C3'],
  ['R8C7', 'R9C7'],
  ['R7C8', 'R7C9'],
  ['R2C7', 'R3C7'],
];

const rc = cell => parseCellId(cell);
const cell = ({row, col}) => makeCellId(row, col);
const edgeId = edge => edge.join('|');

function ringEdges(hole) {
  const {row, col} = rc(hole);
  const ring = [];
  for (let r = row - 1; r <= row + 1; r++) {
    for (let c = col - 1; c <= col + 1; c++) {
      if (r === row && c === col) continue;
      ring.push({row: r, col: c});
    }
  }

  const ringCells = new Set(ring.map(cell));
  const edges = [];
  for (const current of ring) {
    for (const [dr, dc] of [[1, 0], [0, 1]]) {
      const next = {row: current.row + dr, col: current.col + dc};
      if (ringCells.has(cell(next))) {
        edges.push([cell(current), cell(next)]);
      }
    }
  }
  return edges;
}

const markedEdges = new Set([
  ...whiteDots,
  ...blackDots,
  ...xMarks,
  ...vMarks,
].map(edgeId));

const unmarkedDonutEdges = donutHoles
  .flatMap(ringEdges)
  .filter(edge => !markedEdges.has(edgeId(edge)));

const noSprinkleKey = Pair.fnToKey((a, b) => (
  Math.abs(a - b) !== 1 &&
  a !== 2 * b &&
  b !== 2 * a &&
  a + b !== 5 &&
  a + b !== 10
), 9);

return [
  new Shape('9x9'),
  new AllDifferent(...shadedCells),

  ...whiteDots.map(edge => new WhiteDot(...edge)),
  ...blackDots.map(edge => new BlackDot(...edge)),
  ...xMarks.map(edge => new X(...edge)),
  ...vMarks.map(edge => new V(...edge)),

  ...unmarkedDonutEdges.map(edge => (
    new Pair(noSprinkleKey, 'no sprinkle', ...edge)
  )),
];
