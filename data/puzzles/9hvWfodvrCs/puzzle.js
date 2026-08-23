// Title: Time Flies Like an Arrow...
// Author: Abdul the Killer
// Video: https://www.youtube.com/watch?v=9hvWfodvrCs
// Source: https://sudokupad.app/0787piuafi

// Standard Sudoku. A shade value is 1 when its grid cell is exactly one above
// a king-adjacent digit within its box, and 2 otherwise. Both shade values are
// orthogonally connected, and no 2x2 square is monochromatic. Each displayed
// arrow counts shaded cells in its ray; because all possible arrows are drawn,
// every other cardinal ray must have a different shaded-cell count.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const shade = graph.makeOverlay('YY');

// The arrow table is transcribed from the chevrons in the supplied background
// artwork. Each direction points away from the listed cell.
const arrowDirections = new Set([
  'R1C2:D', 'R1C6:D', 'R2C5:L', 'R2C5:R', 'R2C7:L', 'R2C7:D', 'R2C8:D',
  'R3C4:D', 'R3C8:U', 'R4C2:D', 'R4C3:L', 'R4C3:D', 'R4C8:L', 'R4C8:D',
  'R5C5:R', 'R5C5:D', 'R6C3:R', 'R6C4:U', 'R6C4:D', 'R7C1:U', 'R7C1:R',
  'R7C6:L', 'R7C7:R', 'R7C7:D', 'R8C2:L', 'R8C2:D', 'R8C3:R', 'R8C6:R',
  'R8C7:L', 'R9C5:U', 'R9C5:L',
]);

const directions = [
  ['U', -1, 0], ['D', 1, 0], ['L', 0, -1], ['R', 0, 1],
];

function rayFrom(cell, dRow, dCol) {
  const ray = [];
  let current = graph.step(cell, dRow, dCol);
  while (current !== null) {
    ray.push(current);
    current = graph.step(current, dRow, dCol);
  }
  return ray;
}

// This state machine reads shade, digit, then the within-box king neighbours.
// Its final state enforces the iff in the shading rule, rather than only the
// easier shaded-implies-lower-neighbour direction.
const shadingMachine = NFA.encodeSpec({
  startState: { phase: 'shade' },
  transition: (state, value) => {
    if (state.phase === 'shade') {
      return value === SHADED || value === UNSHADED
        ? { phase: 'digit', shade: value } : undefined;
    }
    if (state.phase === 'digit') return { phase: 'neighbours', shade: state.shade, digit: value, lower: false };
    return {
      phase: 'neighbours',
      shade: state.shade,
      digit: state.digit,
      lower: state.lower || value === state.digit - 1,
    };
  },
  accept: state => state.phase === 'neighbours' &&
    (state.shade === SHADED) === state.lower,
}, geometry.numValues);

// A cardinal ray begins after its arrow cell. The two machines respectively
// enforce a displayed arrow and the stated absence of any undisplayed arrow.
function countMachine(matches) {
  return NFA.encodeSpec({
    startState: { target: null, count: 0 },
    transition: ({ target, count }, value) => {
      if (target === null) return { target: value, count: 0 };
      return { target, count: Math.min(count + (value === SHADED ? 1 : 0), target + 1) };
    },
    accept: ({ target, count }) => target !== null && (matches ? count === target : count !== target),
  }, geometry.numValues);
}
const arrowCountMachine = countMachine(true);
const noArrowCountMachine = countMachine(false);

const shadingRules = gridCells.map(cell => {
  const { row, col } = parseCellId(cell);
  const boxTop = Math.floor((row - 1) / 3) * 3 + 1;
  const boxLeft = Math.floor((col - 1) / 3) * 3 + 1;
  const neighbours = graph.kingNeighbours(cell).filter(other => {
    const pos = parseCellId(other);
    return Math.floor((pos.row - 1) / 3) * 3 + 1 === boxTop &&
      Math.floor((pos.col - 1) / 3) * 3 + 1 === boxLeft;
  });
  return new NFA(shadingMachine, 'shade-iff', shade.at(cell), cell, ...neighbours);
});

const arrowRules = gridCells.flatMap(cell => directions.map(([name, dRow, dCol]) => {
  const shown = arrowDirections.has(`${cell}:${name}`);
  return new NFA(shown ? arrowCountMachine : noArrowCountMachine,
    shown ? 'shaded-count' : 'not-shaded-count', cell, ...shade.at(rayFrom(cell, dRow, dCol)));
}));

return [
  new Shape('9x9'),
  new YinYang(),
  ...shadingRules,
  ...arrowRules,
];
